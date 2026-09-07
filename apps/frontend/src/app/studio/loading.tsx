import { LoadingFallback } from '@/components/layout';

export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <LoadingFallback />
    </div>
  );
}
