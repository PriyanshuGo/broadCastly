const User = require("../models/user.model");
const { generateOtp, storeOtpWithUser, verifyOtpAndGetUserData } = require("../utils/otp.util.js");
const { sendEmailOtp } = require("../utils/email.util.js");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const Session = require("../models/session.model");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/jwt");
const crypto = require("crypto");


const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const getRefreshExpiryDate = () => {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};



// ---------------- Register ----------------
/**
 * @desc    Register a new user (initiates OTP verification)
 * @route   POST /user/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, otpMethod = "email" } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // 🔍 Check if user already exists
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "User with this email already exists");
  }

  // 🔢 Generate OTP
  const otp = generateOtp();

  // Prepare userData — only include defined, non-empty fields
  const userData = { name, email, password };

  // Store OTP + user data in Redis
  await storeOtpWithUser(email, otp, userData);

  // ✉️ Send OTP
  if (otpMethod === "email") {
    await sendEmailOtp(email, otp);
    console.log(`📧 OTP sent to ${email}: ${otp}`);
  } else if (otpMethod === "phone") {
    // phone logic would go here
    console.log(`📱 OTP sent to phone: ${otp}`);
  } else {
    throw new ApiError(400, "Invalid OTP method. Use 'email' or 'phone'.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, `OTP sent via ${otpMethod} successfully`));
});

// ---------------- Verify OTP ----------------
/**
 * @desc    Verify OTP and complete registration
 * @route   POST /user/verify-otp
 * @access  Public
 */
const verifyUserOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new ApiError(400, "Missing OTP or email"));
    }

    const { valid, reason, userDataString } = await verifyOtpAndGetUserData(
      email,
      otp
    );

    if (!valid) {
      return next(new ApiError(400, reason));
    }

    const userData =
      typeof userDataString === "string"
        ? JSON.parse(userDataString)
        : userDataString;

    const user = await User.create(userData);

    await user.populate({
      path: "role",
      select: "name permissions",
    });

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

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          accessToken,
          refreshToken,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: {
              id: user.role._id,
              name: user.role.name,
              permissions: user.role.permissions,
            },
          },
        },
        "User verified, registered and logged in successfully"
      )
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerUser,
  verifyUserOtp
};
