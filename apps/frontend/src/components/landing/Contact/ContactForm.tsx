'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useReducedMotion } from '@/animations/hooks/use-reduced-motion';

import { CONTACT_FORM } from './contact-content';
import { ContactFormField } from './ContactFormField';
import { contactFormSchema, type ContactFormValues } from './contact-schema';

export function ContactForm() {
  const prefersReducedMotion = useReducedMotion();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (_values: ContactFormValues) => {
    // UI-only — wire to API / email service when backend is ready.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmitted(true);
    reset();
  };

  if (submitted) {
    return (
      <motion.div
        className="contact-form-success"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
        role="status"
      >
        <p className="contact-form-success-title">{CONTACT_FORM.successTitle}</p>
        <p className="contact-form-success-copy">{CONTACT_FORM.successMessage}</p>
        <button
          type="button"
          className="contact-form-reset"
          onClick={() => setSubmitted(false)}
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  return (
    <form
      className="contact-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Contact form"
    >
      <ContactFormField
        id="contact-name"
        label="Name"
        autoComplete="name"
        placeholder="Your name"
        error={errors.name?.message}
        {...register('name')}
      />

      <ContactFormField
        id="contact-email"
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <ContactFormField
        id="contact-subject"
        label="Subject"
        autoComplete="off"
        placeholder="How can we help?"
        error={errors.subject?.message}
        {...register('subject')}
      />

      <ContactFormField
        id="contact-message"
        label="Message"
        multiline
        placeholder="Tell us a little about your question or project..."
        error={errors.message?.message}
        {...register('message')}
      />

      <button type="submit" className="landing-btn-primary contact-form-submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : CONTACT_FORM.submitLabel}
      </button>
    </form>
  );
}
