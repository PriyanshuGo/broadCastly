import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { verifyGoogleIdToken } from "../../utils/googleAuth.js";
import { createAuthSession } from "../../utils/authSession.js";
import User from "../../models/user.model.js";


export const googleAuth = async (req, res, next) => {
    try {
        const { idToken, deviceInfo } = req.body;

        if (!idToken) {
            return next(new ApiError(400, "Google idToken is required"));
        }

        const googleUser = await verifyGoogleIdToken(idToken);

        if (!googleUser.email || !googleUser.emailVerified) {
            return next(new ApiError(401, "Google email is not verified"));
        }

        let user = await User.findOne({
            email: googleUser.email.toLowerCase().trim(),
        });

        if (!user) {
            user = await User.create({
                name: googleUser.name || normalizedEmail.split("@")[0],
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

        const { accessToken, refreshToken } = await createAuthSession(user, deviceInfo);

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken,
                    user: user.name,
                },
                "Google login successful"
            )
        );
    } catch (error) {
        next(error);
    }
};

