/**
 * Web stub for the background task service. Web browsers don't have a real
 * background scheduler (Service Workers could approximate it but they are
 * out of scope for LISTEN today), so both entry points are no-ops.
 *
 * The native version lives in `backgroundTask.native.ts` and is picked up
 * automatically by Metro on iOS and Android.
 */

export async function registerBackgroundTask(): Promise<void> {
  // no-op on web
}

export async function unregisterBackgroundTask(): Promise<void> {
  // no-op on web
}
