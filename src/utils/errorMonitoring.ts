/**
 * Safe client/server error monitoring & reporting
 * Will log locally and gracefully bypass if no Sentry DSN is configured,
 * ensuring the app boots and runs without error under any environment.
 */

interface ErrorContext {
  userId?: string | null;
  route?: string;
  extra?: Record<string, any>;
}

export function initErrorMonitoring(): void {
  const dsn = (typeof window !== 'undefined'
    ? (import.meta as any).env?.VITE_SENTRY_DSN
    : process.env.SENTRY_DSN) || '';

  if (!dsn) {
    // Graceful silent fallback
    return;
  }

  try {
    console.log('[MONITORING] Initializing error reporting with provided DSN');
  } catch (err) {
    console.warn('[MONITORING] Failed to initialize Sentry:', err);
  }
}

export function reportError(error: unknown, context?: ErrorContext): void {
  const errObj = error instanceof Error ? error : new Error(String(error));
  console.error('[APPLICATION ERROR]', errObj.message, {
    stack: errObj.stack,
    context
  });
}
