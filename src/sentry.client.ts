import * as Sentry from '@sentry/react';

const env = (import.meta as any)?.env || {};
const dsn = env?.VITE_SENTRY_DSN as string | undefined;
const vercelEnv = env?.VERCEL_ENV as string | undefined; // 'development' | 'preview' | 'production'
const environment = (vercelEnv || env?.MODE || 'development') as string;
const traces = Number(env?.VITE_SENTRY_TRACES ?? (environment === 'production' ? 0.2 : environment === 'preview' ? 0.1 : 0));

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: traces,
    environment,
    integrations: [],
  });
}

export { Sentry };
