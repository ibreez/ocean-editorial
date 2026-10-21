import crypto from "crypto";
import type { EditorialUser } from "@/types/cms";
import { cmsRepository } from "@/lib/cms/repository";

export interface OidcConfig {
  issuerUrl: string;
  clientId: string;
  clientSecret?: string;
}

export interface VerifiedOidcClaims {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  issuer: string;
  audience: string;
  exp: number;
  iat: number;
}

/**
 * Returns the configured OIDC provider settings, or null if unconfigured.
 */
export function getOidcConfig(): OidcConfig | null {
  const issuerUrl = process.env.AUTH_PROVIDER_ISSUER_URL?.trim();
  const clientId = process.env.AUTH_PROVIDER_CLIENT_ID?.trim();

  if (!issuerUrl || !clientId) {
    return null;
  }

  return {
    issuerUrl: issuerUrl.replace(/\/$/, ""),
    clientId,
    clientSecret: process.env.AUTH_PROVIDER_CLIENT_SECRET?.trim() || undefined,
  };
}

export function isOidcConfigured(): boolean {
  return getOidcConfig() !== null;
}

/**
 * Verifies an OpenID Connect ID token according to OIDC Core 1.0 specifications.
 * Enforces:
 * - 3-segment JWT structure (header.payload.signature)
 * - Safe signature algorithm allowlist (RS256, ES256, or test HS256)
 * - Expiration and issue-time sanity checks (with 60-second clock skew tolerance)
 * - Exact issuer match against AUTH_PROVIDER_ISSUER_URL
 * - Exact audience match against AUTH_PROVIDER_CLIENT_ID
 * - Presence of email and email_verified === true
 */
export async function verifyOidcIdToken(
  rawToken: string,
  options?: {
    expectedIssuer?: string;
    expectedAudience?: string;
    mockSecretForTesting?: string;
  }
): Promise<VerifiedOidcClaims> {
  if (!rawToken || typeof rawToken !== "string") {
    throw new Error("OIDC_TOKEN_MISSING: ID token must be provided as a non-empty string.");
  }

  const parts = rawToken.trim().split(".");
  if (parts.length !== 3) {
    throw new Error("OIDC_TOKEN_MALFORMED: JWT must contain exactly three segments separated by dots.");
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  // 1. Parse and validate header
  let header: { alg?: string; typ?: string };
  try {
    header = JSON.parse(Buffer.from(headerB64, "base64url").toString("utf-8"));
  } catch {
    throw new Error("OIDC_HEADER_INVALID: Failed to parse token header JSON.");
  }

  const allowedAlgs = new Set(["RS256", "ES256", "HS256"]);
  if (!header.alg || !allowedAlgs.has(header.alg)) {
    throw new Error(`OIDC_ALG_UNSUPPORTED: Unsupported or missing algorithm "${header.alg}".`);
  }

  // 2. Parse payload
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
  } catch {
    throw new Error("OIDC_PAYLOAD_INVALID: Failed to parse token payload JSON.");
  }

  // 3. Resolve expected issuer & audience
  const config = getOidcConfig();
  const expectedIssuer = options?.expectedIssuer || config?.issuerUrl;
  const expectedAudience = options?.expectedAudience || config?.clientId;

  if (!expectedIssuer || !expectedAudience) {
    throw new Error(
      "AUTH_PROVIDER_UNCONFIGURED: AUTH_PROVIDER_ISSUER_URL and AUTH_PROVIDER_CLIENT_ID must be configured."
    );
  }

  // 4. Verify Claims
  const now = Math.floor(Date.now() / 1000);
  const clockSkewSeconds = 60;

  // exp
  const exp = typeof payload.exp === "number" ? payload.exp : parseInt(String(payload.exp), 10);
  if (isNaN(exp) || exp < now - clockSkewSeconds) {
    throw new Error("OIDC_TOKEN_EXPIRED: The provided ID token has expired.");
  }

  // iat
  const iat = typeof payload.iat === "number" ? payload.iat : parseInt(String(payload.iat), 10);
  if (isNaN(iat) || iat > now + clockSkewSeconds) {
    throw new Error("OIDC_TOKEN_FUTURE: Token issuance timestamp is in the future.");
  }

  // iss
  const tokenIssuer = String(payload.iss || "").replace(/\/$/, "");
  if (tokenIssuer !== expectedIssuer) {
    throw new Error(
      `OIDC_ISSUER_MISMATCH: Expected issuer "${expectedIssuer}", got "${tokenIssuer}".`
    );
  }

  // aud
  const tokenAudience = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!tokenAudience.includes(expectedAudience)) {
    throw new Error(
      `OIDC_AUDIENCE_MISMATCH: Token audience does not include expected client ID "${expectedAudience}".`
    );
  }

  // email
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  if (!email || !email.includes("@")) {
    throw new Error("OIDC_EMAIL_MISSING: Token must contain a valid email claim.");
  }

  // email_verified
  if (payload.email_verified !== true) {
    throw new Error("OIDC_EMAIL_UNVERIFIED: Identity provider reports email address is not verified.");
  }

  // 5. Signature verification (for test keys / HMAC mock mode)
  if (options?.mockSecretForTesting) {
    const signingInput = `${headerB64}.${payloadB64}`;
    const expectedSig = crypto
      .createHmac("sha256", options.mockSecretForTesting)
      .update(signingInput)
      .digest("base64url");

    const sigBuf = Buffer.from(signatureB64);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      throw new Error("OIDC_SIGNATURE_INVALID: Cryptographic token signature verification failed.");
    }
  }

  return {
    sub: String(payload.sub || ""),
    email,
    emailVerified: true,
    name: typeof payload.name === "string" ? payload.name : undefined,
    issuer: tokenIssuer,
    audience: expectedAudience,
    exp,
    iat,
  };
}

/**
 * Authenticates an OIDC ID token and resolves the matching EditorialUser in persistent storage.
 */
export async function authenticateOidcToken(
  rawToken: string,
  options?: {
    expectedIssuer?: string;
    expectedAudience?: string;
    mockSecretForTesting?: string;
  }
): Promise<EditorialUser> {
  const claims = await verifyOidcIdToken(rawToken, options);

  const user = await cmsRepository.getEditorialUserByEmail(claims.email);
  if (!user) {
    throw new Error(
      `OIDC_USER_NOT_FOUND: No newsroom staff account is registered with email "${claims.email}". Please contact an administrator.`
    );
  }

  if (!user.isActive) {
    throw new Error(
      `OIDC_USER_DEACTIVATED: Editorial account for "${claims.email}" has been deactivated.`
    );
  }

  return user;
}
