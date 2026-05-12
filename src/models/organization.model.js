const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        type: {
            type: String,
            enum: [
                "school",
                "college",
                "brand",
                "community",
                "company",
                "ngo",
                "other",
            ],
            required: true,
        },

        logo: {
            type: String,
            default: null,
        },

        description: {
            type: String,
            default: null,
        },

        website: {
            type: String,
            default: null,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);        