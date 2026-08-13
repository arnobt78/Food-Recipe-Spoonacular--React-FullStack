/**
 * Sentry Edge Configuration
 *
 * REQ-0024 / CR-0003 — @sentry/nextjs v10.x (not v11). Init behavior unchanged.
 * Error tracking for Edge runtime.
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production
  tracesSampleRate: 1.0,
  
  // Set environment
  environment: process.env.NODE_ENV || "development",
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
});
