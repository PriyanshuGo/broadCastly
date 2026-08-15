import crypto from "crypto"

export const generateHandle = (name, email) => {
  // 1. Fallback chain with safe defaults to prevent crashes
  const sourceString = (name || email || "").split("@")[0];

  // 2. Clean, normalize, and truncate
  const base = sourceString
    .trim()
    .toLowerCase()
    .normalize("NFD") // Removes accents (e.g., "á" becomes "a")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);

  const suffix = crypto
    .randomBytes(4)
    .toString("hex");

  return `${base}-${suffix}`;

};
