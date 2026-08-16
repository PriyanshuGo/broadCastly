import { ApiResponse } from "../../utils/common/ApiResponse.js";
import { ApiError } from "../../utils/common/ApiError.js";
import UserProfile from "../../models/user/userProfile.model.js"

export const getUserProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const profile = await UserProfile.findOne({
            user: userId,
        })
            .select(
                "handle displayName bio avatar createdAt updatedAt"
            )
            .lean();

        if (!profile) {
            return next(
                new ApiError(
                    404,
                    "User profile not found"
                )
            );
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                { profile },
                "User profile fetched successfully"
            )
        );
    } catch (error) {
        next(error);
    }
};