export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const candidate = error as { data?: unknown; message?: string };
    const data = candidate.data;
    if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') return data.error;
    if (candidate.message) return candidate.message.replace(/^HTTP \d+ [^:]+:\s*/, '');
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}