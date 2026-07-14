import crypto from "crypto";

/** API key for a hardware sensor — sent as a Bearer token to /api/ingest. */
export function newSensorKey() {
  return "kgs_" + crypto.randomBytes(24).toString("base64url");
}
