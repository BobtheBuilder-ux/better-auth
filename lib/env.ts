const defaultPort = process.env.PORT || "4002";

export const apiKey =
  process.env.BETTERAUTH_API_KEY || "dev-api-key";

export const issuer =
  process.env.BETTERAUTH_ISSUER ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : `http://localhost:${defaultPort}`);

export const audience =
  process.env.BETTERAUTH_AUDIENCE || "central-auth";

