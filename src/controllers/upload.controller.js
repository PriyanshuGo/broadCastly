const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");

const { uploadOnCloudinary } = require("../utils/cloudinary");


const uploadContentImage = asyncHandler(async (req, res) => {

    if (!req.file) {

        throw new ApiError(400, "File is required");

    }

    const username = req.user.username;
    const folderPath = `content/${username}`;

    // use your existing function
    const result = await uploadOnCloudinary(req.file.path, folderPath);

    if (!result.success) {

        throw new ApiError(500, result.error);

    }

    return res.status(200).json(

        new ApiResponse(

            200,

            {

                url: result.url,

                public_id: result.public_id

            },

            "Image uploaded"

        )

    );

});


module.exports = { uploadContentImage };