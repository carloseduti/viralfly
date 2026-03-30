export function isAuthSessionMissingMessage(message: string | null | undefined) {
  if (!message) {
    return false;
  }

  const normalized = message.toLowerCase();
  return normalized.includes('auth session missing') || normalized.includes('session missing');
}
