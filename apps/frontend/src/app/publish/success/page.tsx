'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import { getDeliveryStatus, retryDelivery, type DeliveryStatus } from '@/services/delivery.service';

import '@/features/studio/studio.css';

function PublishSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryStatus | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const publicUrl = params.get('url') || '';
  const publicUuid = params.get('uuid') || '';
  const publishedAt = params.get('at') || '';
  const experienceId = params.get('id') || '';

  const displayUrl = useMemo(() => {
    if (publicUrl) return publicUrl;
    if (publicUuid && typeof window !== 'undefined') {
      return `${window.location.origin}/e/${publicUuid}`;
    }
    return '';
  }, [publicUrl, publicUuid]);

  const openPath = useMemo(() => {
    if (!displayUrl) return '/';
    try {
      const parsed = new URL(
        displayUrl,
        typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
      );
      return `${parsed.pathname}${parsed.search}`;
    } catch {
      return displayUrl.startsWith('/') ? displayUrl : `/e/${publicUuid}`;
    }
  }, [displayUrl, publicUuid]);

  const refreshDelivery = useCallback(async () => {
    if (!experienceId) return;
    setDeliveryLoading(true);
    try {
      const status = await getDeliveryStatus(experienceId);
      setDelivery(status);
    } catch {
      setDelivery({
        status: 'pending',
        email_sent: false,
        pending: true,
        failed: false,
        retry_count: 0,
        last_retry: 0,
      });
    } finally {
      setDeliveryLoading(false);
    }
  }, [experienceId]);

  useEffect(() => {
    void refreshDelivery();
  }, [refreshDelivery]);

  useEffect(() => {
    if (!experienceId) return;
    if (delivery?.email_sent || delivery?.status === 'email_sent') return;
    if (delivery?.failed || delivery?.status === 'failed') return;
    const timer = window.setInterval(() => {
      void refreshDelivery();
    }, 4000);
    return () => window.clearInterval(timer);
  }, [delivery?.email_sent, delivery?.failed, delivery?.status, experienceId, refreshDelivery]);

  const handleCopy = useCallback(async () => {
    if (!displayUrl) return;
    try {
      await navigator.clipboard.writeText(displayUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [displayUrl]);

  const handleShare = useCallback(async () => {
    if (!displayUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Chronivs Experience',
          text: 'A cinematic personal experience, crafted just for you.',
          url: displayUrl,
        });
        return;
      } catch {
        // Fall through to copy
      }
    }
    await handleCopy();
  }, [displayUrl, handleCopy]);

  const handleRetryEmail = useCallback(async () => {
    if (!experienceId || retrying) return;
    setRetrying(true);
    try {
      const status = await retryDelivery(experienceId);
      setDelivery(status);
    } catch {
      setDelivery((prev) =>
        prev
          ? { ...prev, status: 'failed', failed: true, pending: false, email_sent: false }
          : prev,
      );
    } finally {
      setRetrying(false);
    }
  }, [experienceId, retrying]);

  const emailLabel = useMemo(() => {
    if (!experienceId) return 'Email status unavailable';
    if (deliveryLoading && !delivery) return 'Sending…';
    if (!delivery) return 'Sending…';
    if (delivery.email_sent || delivery.status === 'email_sent') return 'Email Sent';
    if (delivery.failed || delivery.status === 'failed') return 'Failed';
    return 'Sending…';
  }, [delivery, deliveryLoading, experienceId]);

  if (!displayUrl) {
    return (
      <main className="studio-page flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <h1 className="studio-serif text-[clamp(26px,4vw,36px)] text-[var(--studio-white)] italic">
          Experience not found
        </h1>
        <p className="mt-3 text-sm text-[var(--studio-gray)]">
          Return to studio to finish checkout and publish.
        </p>
        <button type="button" className="studio-btn-primary mt-8" onClick={() => router.push('/studio')}>
          Back to Studio
        </button>
      </main>
    );
  }

  return (
    <main className="studio-page relative flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <div className="relative z-[2] w-full max-w-[440px]">
        <div className="text-[34px]" aria-hidden="true">
          ✨
        </div>
        <h1 className="studio-serif mt-3.5 text-[clamp(26px,4vw,36px)] font-normal text-[var(--studio-white)] italic">
          Your Experience Is Ready
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--studio-gray)]">
          Your Chronivs experience is published and ready to share.
        </p>

        <div className="mt-8 rounded-[var(--studio-radius)] border border-[var(--studio-line)] bg-[var(--studio-card)] px-4 py-4 text-left">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--studio-gold)]">Published URL</p>
          <p className="mt-2 break-all text-sm text-[var(--studio-white)]">{displayUrl}</p>
          {publishedAt ? (
            <p className="mt-2 text-xs text-[var(--studio-gray)]">
              Published {new Date(publishedAt).toLocaleString()}
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <button type="button" className="studio-btn-primary w-full max-w-[320px]" onClick={() => void handleCopy()}>
            {copied ? 'Link Copied' : 'Copy Link'}
          </button>
          <Link href={openPath} className="studio-btn-secondary w-full max-w-[320px]">
            Open Experience
          </Link>
          <button type="button" className="studio-btn-secondary w-full max-w-[320px]" onClick={() => void handleShare()}>
            Share
          </button>
        </div>

        <div className="mt-8 rounded-[var(--studio-radius)] border border-[var(--studio-line)] bg-[var(--studio-card)] px-4 py-3 text-left">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--studio-gold)]">Email Status</p>
          <p className="mt-1.5 text-sm text-[var(--studio-white)]">{emailLabel}</p>
          {delivery?.recipient_email ? (
            <p className="mt-1 text-xs text-[var(--studio-gray)]">To {delivery.recipient_email}</p>
          ) : null}
          {delivery?.failed && delivery.error ? (
            <p className="mt-1 text-xs text-[#ffd0d0]">{delivery.error}</p>
          ) : null}
          {(delivery?.failed || delivery?.status === 'failed') && experienceId ? (
            <button
              type="button"
              className="studio-btn-secondary mt-3 w-full"
              disabled={retrying}
              onClick={() => void handleRetryEmail()}
            >
              {retrying ? 'Retrying…' : 'Retry Email'}
            </button>
          ) : null}
        </div>

        <Link href="/" className="studio-btn-ghost mt-8 inline-block">
          Back to Home
        </Link>
      </div>
    </main>
  );
}

export default function PublishSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="studio-page flex min-h-dvh items-center justify-center text-[var(--studio-white)]">
          Loading…
        </main>
      }
    >
      <PublishSuccessContent />
    </Suspense>
  );
}
