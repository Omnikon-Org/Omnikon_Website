/**
 * Client-side analytics logger to send interaction metrics to the /api/analytics route.
 */
export function logEvent(entityType: string, entityId: string) {
  if (typeof window === 'undefined') return;

  const url = '/api/analytics';
  const body = JSON.stringify({ entityType, entityId });

  // Use sendBeacon if available for non-blocking analytics delivery on page unload, fallback to fetch
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon(url, blob);
  } else {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    }).catch((err) => {
      console.warn('Analytics event dispatch failed:', err);
    });
  }
}
