const crypto = require("crypto");
const Session = require("../models/session.model");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("./jwt");

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const getRefreshExpiryDate = () => {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

const createAuthSession = async (user, req) => {
  const accessToken = generateAccessToken({
    userId: user._id,
  });

  const refreshToken = generateRefreshToken({
    userId: user._id,
  });

  await Session.create({
    user: user._id,
    refreshTokenHash: hashToken(refreshToken),
    userAgent: req.headers["user-agent"] || null,
    ipAddress: req.ip || req.connection?.remoteAddress || null,
    expiresAt: getRefreshExpiryDate(),
  });

  return {
    accessToken,
    refreshToken,
  };
};

module.exports = {
  hashToken,
  createAuthSession,
};