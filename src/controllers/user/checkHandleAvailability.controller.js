import { ApiResponse } from "../../utils/common/ApiResponse.js";
import UserProfile from "../../models/user/userProfile.model.js";

export const checkHandleAvailability = async (req, res, next) => {
    try {
        const handle = req.query.handle
            ?.trim()
            .toLowerCase();

        if (!handle) {
            return next(
                new ApiError(400, "Handle is required")
            );
        }

        if (!/^[a-z0-9_]{3,30}$/.test(handle)) {
            return res.status(200).json(
                new ApiResponse(
                    200,
                    { available: false },
                    "Invalid handle"
                )
            );
        }

        const exists = await UserProfile.exists({
            handle,
        });

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    available: !exists,
                    handle,
                },
                !exists
                    ? "Handle is available"
                    : "Handle is already taken"
            )
        );
    } catch (error) {
        next(error);
    }
};