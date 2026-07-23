import jwt from "jsonwebtoken";
import crypto from "crypto";

import { ApiError } from "./ApiError.js";

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const getRefreshExpiryDate = () => {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    switch (error.name) {
      case "TokenExpiredError":
        throw new ApiError(
          401,
          "Your session has expired. Please sign in again."
        );

      case "JsonWebTokenError":
        throw new ApiError(
          401,
          "Your session is invalid. Please sign in again."
        );

      case "NotBeforeError":
        throw new ApiError(
          401,
          "Your session is not valid yet. Please try again."
        );

      default:
        throw new ApiError(
          401,
          "Authentication failed. Please sign in again."
        );
    }
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    switch (error.name) {
      case "TokenExpiredError":
        throw new ApiError(
          401,
          "Your login session has expired. Please sign in again."
        );

      case "JsonWebTokenError":
        throw new ApiError(
          401,
          "Your login session is invalid. Please sign in again."
        );

      case "NotBeforeError":
        throw new ApiError(
          401,
          "Your login session is not valid yet. Please try again."
        );

      default:
        throw new ApiError(
          401,
          "Authentication failed. Please sign in again."
        );
    }
  }
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  getRefreshExpiryDate
};
