import { createHash, randomBytes, timingSafeEqual } from "crypto";

const DELIVERY_TOKEN_BYTES = 24;

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function createReportDeliveryToken() {
  return randomBytes(DELIVERY_TOKEN_BYTES).toString("hex");
}

export function hashReportDeliveryToken(token: string) {
  return sha256(token);
}

export function reportDeliveryTokenMatches(token: string, hashedToken: string | null | undefined) {
  if (!token || !hashedToken) return false;

  const provided = Buffer.from(sha256(token), "hex");
  const expected = Buffer.from(hashedToken, "hex");

  if (provided.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(provided, expected);
}
