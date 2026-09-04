'use client';

import { useEffect } from 'react';
import { logEvent } from '@/lib/utils/analytics';

interface ViewLoggerProps {
  entityType: string;
  entityId: string;
}

export function ViewLogger({ entityType, entityId }: ViewLoggerProps) {
  useEffect(() => {
    logEvent(entityType, entityId);
  }, [entityType, entityId]);

  return null;
}
