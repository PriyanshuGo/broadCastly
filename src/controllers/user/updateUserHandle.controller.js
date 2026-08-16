import { ApiError } from "../../utils/common/ApiError.js";
import { ApiResponse } from "../../utils/common/ApiResponse.js";
import UserProfile from "../../models/user/userProfile.model.js"

export const updateUserHandle = async (req, res, next) => {
    try {
        const { handle } = req.body;
        const userId = req.user.userId;

        if (!handle) {
            return next(
                new ApiError(400, "Handle is required")
            );
        }

        const normalizedHandle = handle
            .trim()
            .toLowerCase();

        // Validate format
        if (!/^[a-z0-9_]{3,30}$/.test(normalizedHandle)) {
            return next(
                new ApiError(
                    400,
                    "Handle must contain only letters, numbers, and underscores and be 3-30 characters long"
                )
            );
        }

        const profile = await UserProfile.findOne({
            user: userId,
        });

        if (!profile) {
            return next(
                new ApiError(
                    404,
                    "User profile not found"
                )
            );
        }

        // No change
        if (profile.handle === normalizedHandle) {
            return res.status(200).json(
                new ApiResponse(
                    200,
                    { handle: profile.handle },
                    "Handle is already up to date"
                )
            );
        }

        // Database unique index is the final protection
        try {
            profile.handle = normalizedHandle;
            await profile.save();
        } catch (error) {
            if (error.code === 11000) {
                return next(
                    new ApiError(
                        409,
                        "This handle is already taken"
                    )
                );
            }

            throw error;
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    handle: profile.handle,
                },
                "Handle updated successfully"
            )
        );
    } catch (error) {
        next(error);
    }
};