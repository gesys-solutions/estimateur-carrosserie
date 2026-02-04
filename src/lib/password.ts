/**
 * Password hashing utilities using bcrypt
 * Salt rounds: 12 (security best practice)
 */

import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hash a plain text password
 * @param plaintext - The plain text password to hash
 * @returns Promise<string> - The hashed password
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

/**
 * Verify a plain text password against a hash
 * @param plaintext - The plain text password to verify
 * @param hash - The hash to verify against
 * @returns Promise<boolean> - True if password matches
 */
export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}

/**
 * Generate a random temporary password
 * @param length - Length of the password (default: 12)
 * @returns string - The generated password
 */
export function generateTemporaryPassword(length: number = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
