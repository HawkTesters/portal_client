// src/lib/password-utils.ts
import * as argon2 from "argon2";

// Hash a plain-text password
export async function hashPassword(plainPassword: string) {
  // Adjust saltRounds as needed (default: 10-12 for typical usage)
  const hashed = await argon2.hash(plainPassword);
  return hashed;
}

// Compare a plain-text password with a hashed password
export async function compareHashedPasswords(
  plainPassword: string,
  hashedPassword: string
) {
  return await argon2.verify(hashedPassword, plainPassword);
}
