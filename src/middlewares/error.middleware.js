import multer from "multer";
import { ApiError } from "../utils/common/ApiError.js";

const errorHandler = (err, req, res, next) => {

    let error;

    // ================= MULTER ERRORS =================

    if (err instanceof multer.MulterError) {

        switch (err.code) {

            case "LIMIT_FILE_SIZE":
                error = new ApiError(
                    400,
                    "File is too large."
                );
                break;

            case "LIMIT_FILE_COUNT":
                error = new ApiError(
                    400,
                    "Too many files uploaded."
                );
                break;

            case "LIMIT_UNEXPECTED_FILE":
                error = new ApiError(
                    400,
                    "Unexpected file uploaded."
                );
                break;

            case "LIMIT_PART_COUNT":
                error = new ApiError(
                    400,
                    "Too many form fields or files were submitted."
                );
                break;

            default:
                error = new ApiError(
                    400,
                    "File upload failed."
                );
        }
    }

    // ================= FILE TYPE / OTHER ERRORS =================

    else if (err instanceof ApiError) {

        error = err;

    }
    else if (err instanceof Error) {

        error = new ApiError(
            400,
            err.message
        );

    }

    // ================= UNKNOWN ERROR =================

    else {

        console.error("Unhandled error:", err);

        error = new ApiError(
            500,
            "Something went wrong. Please try again later."
        );
    }


    // ================= RESPONSE =================

    const response = {
        success: false,
        message: error.message,

        ...(process.env.NODE_ENV === "development"
            ? {
                stack: error.stack,
            }
            : {}),
    };

    return res.status(error.statusCode).json(response);
};

export { errorHandler };