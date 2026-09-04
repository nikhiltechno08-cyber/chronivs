'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { memo, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  clampMessageIndex,
  getDefaultMessage,
  getRandomDefaultMessage,
  hasDefaultMessages,
} from '@/config/templateDefaultMessages';
import { resolveTemplateId } from '@/features/experience-engine/core/template-registry';

import { OCCASION_CONFIG } from '../../constants/occasions';
import { detailsFormSchema, type DetailsFormValues } from '../../schemas/details-schema';
import { useStudioStore } from '../../store/studio-store';
import type { OccasionKey, RelationshipKey } from '../../types';
import { ContinueButton, PanelActions } from '../ContinueButton';
import { DatePicker } from '../DatePicker';
import { PanelHead } from '../Hero';
import { FloatingInput } from '../forms/FloatingField';
import { MessageInput } from '../MessageInput';
import { MessageShuffleHint } from '../MessageShuffleHint';

type DetailsFormProps = {
  onContinue: () => void;
};

export const DetailsForm = memo(function DetailsForm({ onContinue }: DetailsFormProps) {
  const occasion = useStudioStore((s) => s.occasion) as OccasionKey | null;
  const relationship = useStudioStore((s) => s.relationship) as RelationshipKey | null;
  const hydrateDetails = useStudioStore((s) => s.hydrateDetails);
  const setSelectedMessageIndex = useStudioStore((s) => s.setSelectedMessageIndex);
  const senderName = useStudioStore((s) => s.senderName);
  const receiverName = useStudioStore((s) => s.receiverName);
  const specialDate = useStudioStore((s) => s.specialDate);
  const customMessage = useStudioStore((s) => s.customMessage);
  const selectedMessageIndex = useStudioStore((s) => s.selectedMessageIndex);

  const templateId = resolveTemplateId(occasion, relationship);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsFormSchema),
    mode: 'onChange',
    defaultValues: {
      senderName,
      receiverName,
      specialDate,
      customMessage,
    },
  });

  const userEditedMessageRef = useRef(false);
  const lastAutoMessageRef = useRef<string>('');
  const lastTemplateIdRef = useRef<string | null>(templateId);
  const didInitRef = useRef(false);
  const messageAreaRef = useRef<HTMLDivElement | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);

  useEffect(() => {
    const subscription = watch((formValues) => {
      hydrateDetails(formValues);
    });
    return () => subscription.unsubscribe();
  }, [watch, hydrateDetails]);

  // Random prefill when empty / template changes; re-personalize until user edits.
  useEffect(() => {
    if (!templateId || !hasDefaultMessages(templateId)) return;

    const templateChanged = lastTemplateIdRef.current !== templateId;
    lastTemplateIdRef.current = templateId;

    if (templateChanged) {
      userEditedMessageRef.current = false;
    }

    // First mount: keep persisted custom copy if present.
    if (!didInitRef.current) {
      didInitRef.current = true;
      const existing = (getValues('customMessage') || customMessage || '').trim();
      if (existing && !templateChanged) {
        const index = clampMessageIndex(templateId, selectedMessageIndex);
        const preset = getDefaultMessage(templateId, {
          index,
          recipientName: receiverName || getValues('receiverName'),
        });
        lastAutoMessageRef.current = existing === preset.trim() ? preset : existing;
        userEditedMessageRef.current = existing !== preset.trim();
        if (userEditedMessageRef.current) return;
      }
    }

    // After a manual edit, never overwrite (template switches reset the flag above).
    if (userEditedMessageRef.current) return;

    const current = (getValues('customMessage') ?? '').trim();
    const canReplace =
      !current || current === lastAutoMessageRef.current.trim() || templateChanged;

    if (!canReplace) {
      userEditedMessageRef.current = true;
      return;
    }

    let index: number;
    let next: string;

    if (templateChanged || !current) {
      const picked = getRandomDefaultMessage(templateId, {
        recipientName: receiverName || getValues('receiverName'),
      });
      index = picked.index;
      next = picked.message;
    } else {
      index = clampMessageIndex(templateId, selectedMessageIndex);
      next = getDefaultMessage(templateId, {
        index,
        recipientName: receiverName || getValues('receiverName'),
      });
    }

    if (!next) return;
    if (next === getValues('customMessage')) {
      lastAutoMessageRef.current = next;
      return;
    }

    setSelectedMessageIndex(index);
    setValue('customMessage', next, { shouldValidate: true, shouldDirty: false });
    hydrateDetails({ customMessage: next, selectedMessageIndex: index });
    lastAutoMessageRef.current = next;
  }, [
    templateId,
    receiverName,
    selectedMessageIndex,
    customMessage,
    getValues,
    setValue,
    hydrateDetails,
    setSelectedMessageIndex,
  ]);

  if (!occasion) return null;

  const labels = OCCASION_CONFIG[occasion];
  const messageField = register('customMessage');
  const watchedMessage = watch('customMessage');

  const submit = handleSubmit(() => {
    onContinue();
  });

  const shuffleMessage = () => {
    if (!templateId || isShuffling) return;

    const { message, index } = getRandomDefaultMessage(templateId, {
      recipientName: getValues('receiverName') || receiverName,
      excludeIndex: selectedMessageIndex,
    });
    if (!message) return;

    setIsShuffling(true);
    window.setTimeout(() => {
      userEditedMessageRef.current = false;
      lastAutoMessageRef.current = message;
      setSelectedMessageIndex(index);
      setValue('customMessage', message, { shouldValidate: true, shouldDirty: true });
      hydrateDetails({ customMessage: message, selectedMessageIndex: index });

      // Allow opacity to return after content swap (~250ms fade).
      window.requestAnimationFrame(() => {
        setIsShuffling(false);
        const textarea = messageAreaRef.current?.querySelector('textarea');
        if (textarea) {
          textarea.focus();
          const end = textarea.value.length;
          textarea.setSelectionRange(end, end);
        }
      });
    }, 220);
  };

  return (
    <>
      <PanelHead
        eyebrow="Getting personal"
        title="Let's get to know them."
        description="Nothing formal — just what matters."
      />

      <form className="mx-auto flex max-w-[480px] flex-col gap-[30px]" onSubmit={submit} noValidate>
        <FloatingInput
          label="What should they call you?"
          autoComplete="off"
          error={errors.senderName?.message}
          {...register('senderName')}
        />
        <FloatingInput
          label={labels.recipientLabel}
          autoComplete="off"
          error={errors.receiverName?.message}
          {...register('receiverName')}
        />
        <DatePicker label={labels.dateLabel} error={errors.specialDate?.message} {...register('specialDate')} />
        <div ref={messageAreaRef}>
          {templateId && hasDefaultMessages(templateId) ? (
            <MessageShuffleHint onShuffle={shuffleMessage} disabled={isShuffling} />
          ) : null}
          <div
            className={`studio-message-fade${isShuffling ? ' is-fading' : ''}`}
          >
            <MessageInput
              label={labels.messageLabel}
              error={errors.customMessage?.message}
              name={messageField.name}
              onBlur={messageField.onBlur}
              ref={messageField.ref}
              value={watchedMessage ?? ''}
              onChange={(event) => {
                userEditedMessageRef.current = true;
                void messageField.onChange(event);
              }}
            />
          </div>
        </div>

        <PanelActions>
          <ContinueButton type="submit" disabled={!isValid}>
            Continue
          </ContinueButton>
        </PanelActions>
      </form>
    </>
  );
});
