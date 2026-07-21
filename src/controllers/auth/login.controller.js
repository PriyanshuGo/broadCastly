
import User from "../../models/user.model.js";
import Session from "../../models/session.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  getRefreshExpiryDate
} from "../../utils/jwt.js";



export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError(400, "Email and password are required"));
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    })

    if (!user) {
      return next(new ApiError(401, "Invalid credentials"));
    }

    if (!user.isActive) {
      return next(new ApiError(403, "Your account is inactive"));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ApiError(401, "Invalid credentials"));
    }

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

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
        },
        "Login successful"
      )
    );
  } catch (error) {
    next(error);
  }
};
