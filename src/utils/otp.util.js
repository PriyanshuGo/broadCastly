const { redis } = require("../config/redis.js");

/**
 * Generate a 6-digit numeric OTP
 */
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Store OTP and user data in Redis for 5 minutes.
 * Handles both email or phone as unique identifiers.
 * Automatically overwrites any previous OTP for the same user.
 */
const storeOtpWithUser = async (identifier, otp, userData = {}) => {
  if (!identifier) throw new Error("Missing email or phone identifier");

  const otpKey = `otp:${identifier}`;
  const dataKey = `otpdata:${identifier}`;

  // Clean up any old keys (optional but safe)
  await redis.del(otpKey);
  await redis.del(dataKey);

  // ✅ Store OTP (5-minute expiry)
  await redis.set(otpKey, otp, { ex: 300 });

  // ✅ Filter out undefined or null values before saving
  const cleanUserData = Object.fromEntries(
    Object.entries(userData).filter(([_, v]) => v !== undefined && v !== null && v !== "")
  );

  // ✅ Store user data as JSON (same expiry)
  if (Object.keys(cleanUserData).length > 0) {
    await redis.set(dataKey, JSON.stringify(cleanUserData), { ex: 300 });
  }

  console.log(`✅ OTP and user data stored in Redis for: ${identifier}`);
};
/**
 * Verify OTP — check OTP match and return user data
 */
const verifyOtpAndGetUserData = async (email, enteredOtp) => {
  const otpKey = `otp:${email}`;
  const dataKey = `otpdata:${email}`;
  console.log("otpKey", otpKey, "dataKey", dataKey);
  console.log("enteredOtp", enteredOtp);

  const savedOtp = await redis.get(otpKey);
  console.log("savedOtp:", savedOtp, "enteredOtp:", enteredOtp);
  if (!savedOtp) return { valid: false, reason: "OTP expired or not found" };

  // 🧹 Convert both to string and trim
  if (savedOtp.toString().trim() !== enteredOtp.toString().trim()) {
    return { valid: false, reason: "Invalid OTP" };
  }
  // Fetch stored user data
  const userDataString = await redis.get(dataKey);
  console.log("userDataString", userDataString);

  // Delete both after successful verification
  await redis.del(otpKey);
  await redis.del(dataKey);

  return { valid: true, userDataString };
};

module.exports = {
  generateOtp,
  storeOtpWithUser,
  verifyOtpAndGetUserData
};
