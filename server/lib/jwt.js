// JWT Encode / Decode / Verify (HS256) — гадны сангүй
import crypto from "node:crypto";
import { JWT_SECRET, TOKEN_DAYS } from "../config.js";

const b64urlEncode = (input) =>
  Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const b64urlDecode = (str) => {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(b64, "base64").toString("utf8");
};

const sign = (data) =>
  crypto
    .createHmac("sha256", JWT_SECRET)
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

export function signJWT(payload, expiresInSeconds = TOKEN_DAYS * 86400) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const fullPayload = { ...payload, iat: now, exp: now + expiresInSeconds };
  const data = `${b64urlEncode(JSON.stringify(header))}.${b64urlEncode(JSON.stringify(fullPayload))}`;
  return `${data}.${sign(data)}`;
}

export function decodeJWT(token) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length !== 3) return null;
    return {
      header: JSON.parse(b64urlDecode(parts[0])),
      payload: JSON.parse(b64urlDecode(parts[1])),
    };
  } catch {
    return null;
  }
}

export function verifyJWT(token) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedPayload, signature] = parts;

    const a = Buffer.from(signature);
    const b = Buffer.from(sign(`${encodedHeader}.${encodedPayload}`));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    const payload = JSON.parse(b64urlDecode(encodedPayload));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
