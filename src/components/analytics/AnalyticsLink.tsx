'use client';

import React from 'react';
import { logEvent } from '@/lib/utils/analytics';

interface AnalyticsLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  entityType: string;
  entityId: string;
  children: React.ReactNode;
}

export function AnalyticsLink({
  entityType,
  entityId,
  children,
  onClick,
  ...props
}: AnalyticsLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    logEvent(entityType, entityId);
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <a {...props} onClick={handleClick}>
      {children}
    </a>
  );
}
