import crypto from "crypto";
import Session from "../models/session.model.js";
import mongoose from "mongoose";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken
} from "./jwt.js";

const getRefreshExpiryDate = () => {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

const createAuthSession = async (user, deviceInfo) => {

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
    device: deviceInfo,
    expiresAt: getRefreshExpiryDate(),
  });

  return {
    accessToken,
    refreshToken,
  };
};

export { createAuthSession };
