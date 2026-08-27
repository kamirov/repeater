export function normalizeReferenceUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(trimmed);
  const looksLikeHostAndPort = /^[^/?#\s]+:\d+(?:[/?#]|$)/.test(trimmed);
  const candidate = hasScheme && !looksLikeHostAndPort ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:" ? candidate : null;
  } catch {
    return null;
  }
}

export function isValidReferenceUrl(value: string): boolean {
  return normalizeReferenceUrl(value) !== null;
}
