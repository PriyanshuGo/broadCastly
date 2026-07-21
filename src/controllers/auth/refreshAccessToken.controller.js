
import User from "../../models/user.model.js";
import Session from "../../models/session.model.js";

import {
  generateAccessToken,
  verifyRefreshToken,
  hashToken,
} from "../../utils/jwt.js";


export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new ApiError(400, "Refresh token is required"));
    }

    // 1. Verify JWT (signature + expiry)
    const decoded = verifyRefreshToken(refreshToken);

    // 2. Get session using sessionId from payload
    const session = await Session.findById(decoded.sessionId);

    if (!session) {
      return next(new ApiError(401, "Session not found"));
    }

    // 3. Check if session is revoked
    if (session.isRevoked) {
      return next(new ApiError(401, "Session has been revoked"));
    }

    // 4. Hash the incoming refresh token
    const refreshTokenHash = hashToken(refreshToken);

    // 5. Verify refresh token belongs to this session
    if (session.refreshTokenHash !== refreshTokenHash) {
      return next(new ApiError(401, "Invalid refresh token"));
    }

    // 6. Verify user
    const user = await User.findById(session.user);

    if (!user || !user.isActive) {
      return next(new ApiError(401, "User not allowed"));
    }

    // 7. Generate new access token
    const accessToken = generateAccessToken({
      userId: user._id,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        { accessToken },
        "Access token refreshed successfully"
      )
    );
  } catch (error) {
    return next(error);
  }
};