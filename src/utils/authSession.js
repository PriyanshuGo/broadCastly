import crypto from "crypto";
import Session from "../models/session.model.js";
import mongoose from "mongoose";
import {
  generateAccessToken,
  generateRefreshToken,
} from "./jwt.js";

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const getRefreshExpiryDate = () => {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

const createAuthSession = async (user, req) => {

  const sessionId = new mongoose.Types.ObjectId();

  const accessToken = generateAccessToken({
    userId: user._id,
  });

  const refreshToken = generateRefreshToken({
    userId: user._id,
    sessionId,
  });

  await Session.create({
    _id: sessionId,
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

export {
  hashToken,
  createAuthSession,
};
