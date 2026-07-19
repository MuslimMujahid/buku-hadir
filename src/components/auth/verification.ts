/**
 * Fixed, safe callback target for verification e-mails. Never built from user
 * input — Better Auth appends ?error=<code> on failure and redirects here
 * untouched on success, so the ?verified=1 flag marks a successful callback.
 */
export function verificationCallbackUrl(): string {
  return new URL("/verify-email?verified=1", window.location.origin).toString();
}
