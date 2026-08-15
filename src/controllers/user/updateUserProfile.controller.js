import fs from "fs/promises";

import UserProfile from "../../models/user/userProfile.model.js";

import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../../utils/cloudinary/cloudinary.service.js";

import { validateImageFile } from "../../utils/fileValidation/imageValidator.js";

import { ApiError } from "../../utils/common/ApiError.js";
import { ApiResponse } from "../../utils/common/ApiResponse.js";


export const updateUserProfile = async (req, res, next) => {
    try {
        const { displayName, bio } = req.body;

        const userId = req.user.userId;

        // Nothing provided
        if (
            displayName === undefined &&
            bio === undefined &&
            !req.file
        ) {
            return next(
                new ApiError(
                    400,
                    "No profile data provided"
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

        // --------------------------------
        // Validate text fields
        // --------------------------------

        if (displayName !== undefined) {
            const trimmedName = displayName.trim();

            if (
                trimmedName.length < 2 ||
                trimmedName.length > 50
            ) {
                return next(
                    new ApiError(
                        400,
                        "Display name must be between 2 and 50 characters"
                    )
                );
            }

            profile.displayName = trimmedName;
        }

        if (bio !== undefined) {
            const trimmedBio = bio.trim();

            if (trimmedBio.length > 160) {
                return next(
                    new ApiError(
                        400,
                        "Bio cannot exceed 160 characters"
                    )
                );
            }

            profile.bio = trimmedBio;
        }

        // --------------------------------
        // New avatar
        // --------------------------------

        let oldAvatarPublicId = null;

        if (req.file) {
            const validation =
                await validateImageFile(req.file);

            if (!validation.valid) {
                await fs
                    .unlink(req.file.path)
                    .catch(() => {});

                return next(
                    new ApiError(
                        400,
                        validation.error
                    )
                );
            }

            const uploadResult =
                await uploadOnCloudinary(
                    req.file.path,
                    req.file,
                    {
                        folder: "user_avatars",
                        resourceType: "image",
                    }
                );

            if (!uploadResult.success) {
                return next(
                    new ApiError(
                        500,
                        "Failed to upload avatar"
                    )
                );
            }

            oldAvatarPublicId =
                profile.avatar?.publicId || null;

            profile.avatar = {
                url: uploadResult.file.url,
                publicId: uploadResult.file.publicId,
            };
        }

        await profile.save();

        // --------------------------------
        // Delete OLD avatar only AFTER
        // new avatar + DB update succeeds
        // --------------------------------

        if (oldAvatarPublicId) {
            await deleteFromCloudinary(
                oldAvatarPublicId
            );
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                { profile },
                "Profile updated successfully"
            )
        );

    } catch (error) {
        next(error);
    }
};