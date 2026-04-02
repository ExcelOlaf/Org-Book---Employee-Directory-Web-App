const DEFAULT_ALLOWED_ORIGINS = [
  "https://www.orgbooksd.com",
  "https://d2ywwchq35tdbl.cloudfront.net",
];

function getAllowedOrigins(): string[] {
  const configured = process.env.API_ALLOWED_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configured && configured.length > 0) {
    return configured;
  }

  return DEFAULT_ALLOWED_ORIGINS;
}

function resolveOrigin(requestOrigin?: string): string {
  const allowedOrigins = getAllowedOrigins();

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  return allowedOrigins[0];
}

export function buildApiHeaders(event?: any): Record<string, string> {
  const origin = resolveOrigin(event?.headers?.origin ?? event?.headers?.Origin);

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
  };
}
