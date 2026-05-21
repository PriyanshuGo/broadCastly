const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = require("../models/user.model");
const { verifyGoogleIdToken } = require("../utils/googleAuth");
const { createAuthSession } = require("../utils/authSession");
const Session = require("../models/session.model");

const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const getRefreshExpiryDate = () => {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

const login = async (req, res, next) => {
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

const googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return next(new ApiError(400, "Google idToken is required"));
    }

    const googleUser = await verifyGoogleIdToken(idToken);
    console.log("google user identified", googleUser);


    if (!googleUser.email || !googleUser.emailVerified) {
      return next(new ApiError(401, "Google email is not verified"));
    }

    let user = await User.findOne({
      email: googleUser.email.toLowerCase().trim(),
    });

    if (!user) {
      user = await User.create({
        email: googleUser.email.toLowerCase().trim(),
        authProvider: "google",
        providerId: googleUser.providerId,
      });
    } else {
      if (!user.isActive) {
        return next(new ApiError(403, "Account is inactive"));
      }

      if (user.authProvider === "local") {
        user.authProvider = "google";
        user.providerId = googleUser.providerId;
        await user.save();
      }
    }

    const { accessToken, refreshToken } = await createAuthSession(user, req);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken,
          user: {
            id: user._id,
            email: user.email,
            authProvider: user.authProvider,
          },
        },
        "Google login successful"
      )
    );
  } catch (error) {
    next(error);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new ApiError(400, "Refresh token is required"));
    }

    const decoded = verifyRefreshToken(refreshToken);
    const refreshTokenHash = hashToken(refreshToken);

    const session = await Session.findOne({
      user: decoded.userId,
      refreshTokenHash,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return next(new ApiError(401, "Invalid or expired session"));
    }

    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return next(new ApiError(401, "User not allowed"));
    }

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
    return next(new ApiError(401, "Invalid or expired refresh token"));
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new ApiError(400, "Refresh token is required"));
    }

    await Session.findOneAndUpdate(
      {
        refreshTokenHash: hashToken(refreshToken),
        isRevoked: false,
      },
      {
        isRevoked: true,
        revokedAt: new Date(),
      }
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {},
        "Logged out successfully"
      )
    );
  } catch (error) {
    return next(new ApiError(500, "Logout failed"));
  }
};

module.exports = {
  login,
  refreshAccessToken,
  logout,
  googleAuth,
};