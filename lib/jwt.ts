import crypto from "crypto";
import {
  SignJWT,
  exportJWK,
  generateKeyPair,
  type JWK,
  type KeyLike
} from "jose";
import { audience, issuer } from "./env";

let signingKeyPromise: Promise<KeyLike> | undefined;
let publicJwkPromise: Promise<JWK> | undefined;

async function getSigningKey() {
  if (!signingKeyPromise) {
    signingKeyPromise = generateKeyPair("RS256").then(
      async ({ privateKey, publicKey }) => {
        const jwk = (await exportJWK(publicKey)) as JWK;
        if (!jwk.kid) {
          jwk.kid = crypto.randomBytes(8).toString("hex");
        }
        publicJwkPromise = Promise.resolve(jwk);
        return privateKey;
      }
    );
  }
  return signingKeyPromise;
}

async function getPublicJwk() {
  if (!publicJwkPromise) {
    await getSigningKey();
  }
  return publicJwkPromise as Promise<JWK>;
}

export async function issueToken(user: {
  id: string;
  email: string;
}) {
  const privateKey = await getSigningKey();
  const jwk = await getPublicJwk();

  const jwt = await new SignJWT({
    sub: user.id,
    email: user.email,
    aud: audience
  })
    .setProtectedHeader({
      alg: "RS256",
      kid: jwk.kid
    })
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);

  return jwt;
}

export async function getJwks() {
  const jwk = await getPublicJwk();
  return { keys: [jwk] };
}

