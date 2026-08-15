import { ApiError } from "../../utils/common/ApiError.js";
import { ApiResponse } from "../../utils/common/ApiResponse.js";
import { verifyGoogleIdToken } from "../../utils/auth/googleAuth.js";
import { createAuthSession } from "../../utils/auth/authSession.js";
import User from "../../models/user/user.model.js";
import UserProfile from "../../models/user/userProfile.model.js";
import { generateHandle } from "../../utils/user/userProfile.js";

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
            const MAX_RETRIES = 3;

            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                const session = await mongoose.startSession();

                try {
                    await session.withTransaction(async () => {
                        const [createdUser] = await User.create(
                            [
                                {
                                    name:
                                        googleUser.name ||
                                        normalizedEmail.split("@")[0],
                                    email: normalizedEmail,
                                    authProvider: "google",
                                    providerId: googleUser.providerId,
                                },
                            ],
                            { session }
                        );

                        user = createdUser;

                        const handle = generateHandle(
                            user.name,
                            user.email
                        );

                        await UserProfile.create(
                            [
                                {
                                    user: user._id,
                                    handle,
                                    displayName: user.name,
                                    avatar: {
                                        url: googleUser.profileImg || null,
                                        publicId: null
                                    }
                                },
                            ],
                            { session }
                        );
                    });

                    break; // transaction succeeded

                } catch (error) {
                    if (error.code === 11000 && attempt < MAX_RETRIES) {
                        continue;
                    }
                    // Max retries exhausted
                    if (error.code === 11000) {
                        return next(
                            new ApiError(
                                500,
                                "Unable to generate a unique name identifier. Please try again."
                            )
                        );
                    }

                } finally {
                    await session.endSession();
                }
            }
        } else {
            if (!user.isActive) {
                return next(new ApiError(403, "Account is inactive"));
            }

            if (user.authProvider === "local") {
                user.authProvider = "google";
                user.providerId = googleUser.providerId;
                user.name = googleUser.name;
                await user.save();
            }
        }

        const { accessToken, refreshToken, sessionId } = await createAuthSession(user, deviceInfo);
        console.log(refreshToken, " refreshToken ,login succesfull")
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken,
                    user: user.name,
                    userId: user._id,
                    sessionId,
                },
                "Google login successful"
            )
        );
    } catch (error) {
        next(error);
    }
};

