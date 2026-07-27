import User from "../../models/user.model.js";
import Session from "../../models/session.model.js";

import { hashToken, verifyRefreshToken } from "../../utils/jwt.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import {getSessionDeletionDate} from "../../utils/authSession.js"


export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new ApiError(400, "Refresh token is required"));
    }

    const decoded = verifyRefreshToken(refreshToken);

    const session = await Session.findById(decoded.sessionId);
    
    if (!session) {
      return next(new ApiError(401, "Session not found"));
    }

    if (session.refreshTokenHash !== hashToken(refreshToken)) {
      return next(
        new ApiError(401, "Invalid refresh token")
      );
    }

    if (!session.user.equals(decoded.userId)) {
      return next(
        new ApiError(403, "You are not allowed to logout this session")
      );
    }
    
    session.isRevoked = true;
    session.revokedAt = new Date();
    session.expiresAt = getSessionDeletionDate(),
    await session.save();

    return res.status(200).json(
      new ApiResponse(200, {}, "Logged out successfully")
    );
  } catch (error) {
    return next(error);
  }
};