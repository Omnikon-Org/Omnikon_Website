import React from 'react';
import { LoadingState } from '@/components/content/LoadingState';

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 flex items-center justify-center">
      <LoadingState message="SYS.CORE.LOADING..." />
    </div>
  );
}
