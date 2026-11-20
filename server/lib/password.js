// Нууц үгийг scrypt + salt-аар hash хийх, шалгах
import crypto from "node:crypto";

export const hashPassword = (pw) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(pw, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

export const verifyPassword = (pw, stored) => {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const test = crypto.scryptSync(pw, salt, 64);
  const real = Buffer.from(hash, "hex");
  return real.length === test.length && crypto.timingSafeEqual(real, test);
};
