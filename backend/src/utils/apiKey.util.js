import crypto from "crypto";
import bcrypt from "bcrypt";

/**
 * Generate secure random API key
 */
export const generateRawApiKey = () => {
  return "ck_" + crypto.randomBytes(32).toString("hex");
};

/**
 * Hash API key before storing
 */
export const hashApiKey = async (apiKey) => {
  return bcrypt.hash(apiKey, 12);
};

/**
 * Compare raw key with hash
 */
export const compareApiKey = async (rawKey, hash) => {
  return bcrypt.compare(rawKey, hash);
};
