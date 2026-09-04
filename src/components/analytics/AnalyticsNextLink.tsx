'use client';

import React from 'react';
import Link, { LinkProps } from 'next/link';
import { logEvent } from '@/lib/utils/analytics';

interface AnalyticsNextLinkProps extends LinkProps {
  entityType: string;
  entityId: string;
  className?: string;
  children: React.ReactNode;
}

export function AnalyticsNextLink({
  entityType,
  entityId,
  children,
  onClick,
  ...props
}: AnalyticsNextLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    logEvent(entityType, entityId);
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}
