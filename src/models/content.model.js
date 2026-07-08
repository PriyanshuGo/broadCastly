import mongoose from "mongoose";
import fileSchema from "./file.model.js";


const contentSchema = new mongoose.Schema(
    {
        // ───────────── Basic Information ─────────────

        /** Display title shown on the broadcast screen */
        title: {
            type: String,
            required: true,
            trim: true,
        },

        /** Optional longer description / caption for the content */
        description: {
            type: String,
            trim: true,
        },

        // ───────────── Attached Files ─────────────

        /**
         * Array of embedded file sub-documents (uses fileSchema).
         * At least one file must be attached — enforced by the custom validator.
         */
        files: {
            type: [fileSchema],
            default: [],
        },

        // ───────────── Ownership ─────────────

        /** The user who originally uploaded / created this content */
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // ───────────── Review / Approval Workflow ─────────────

        /**
         * Current workflow status.
         *
         *  • "draft"
         *      Teacher is still preparing content.
         *      Not yet requested for approval.
         *
         *  • "pending"
         *      Requested for approval and waiting for principal review.
         *
         *  • "approved"
         *      Approved for broadcasting.
         *
         *  • "rejected"
         *      Rejected by principal.
         *      Teacher can edit and re-request approval.
         */
        status: {
            type: String,

            enum: [
                "draft",
                "pending",
                "approved",
                "rejected",
            ],

            default: "draft",

            index: true,
        },

        /**
         * Number of times this content has been requested for approval.
         *
         * Draft content starts at 0 because it has not yet been
         * requested for review.
         *
         * First approval request = 1
         * Re-request after rejection = 2, 3, 4...
         */
        approvalRequestCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        /**
         * Timestamp of the latest approval request.
         *
         * Remains null while content is still in draft state.
         * Updated every time teacher requests or re-requests approval.
         */
        approvalRequestedAt: {
            type: Date,
            default: null,
        },

        /**
         * Full approval request history.
         * Stores every request and re-request.
         */
        approvalRequests: [
            {
                requestedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },

                requestedAt: {
                    type: Date,
                    default: Date.now,
                },

                note: {
                    type: String,
                    trim: true,
                    default: null,
                },

                changesSummary: {
                    type: String,
                    trim: true,
                    default: null,
                },
            },
        ],

        /** Reason provided by the reviewer when content is rejected */
        rejectionReason: {
            type: String,
            trim: true,
            default: null,
        },

        /** The user who reviewed (but not necessarily approved) the content */
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        /** Timestamp of when the review took place */
        reviewedAt: {
            type: Date,
            default: null,
        },

        // ✅ Approval tracking

        /** The user who approved the content for broadcast */
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        /** Timestamp of when the content was approved */
        approvedAt: {
            type: Date,
            default: null,
        },

        // ❌ Rejection tracking

        /** The user who rejected the content */
        rejectedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        /** Timestamp of when the content was rejected */
        rejectedAt: {
            type: Date,
            default: null,
        },

        // ───────────── Scheduling / Playback ─────────────

        /** When the content should start appearing on broadcast screens */
        startTime: {
            type: Date,
            required: true,
        },

        /** When the content should stop appearing on broadcast screens */
        endTime: {
            type: Date,
            required: true,
        },

        /**
         * How long (in seconds) each file in the rotation is displayed
         * before cycling to the next one.
         */
        rotationDuration: {
            type: Number,
            min: 1,
            default: 10,
        },

    },
    /**
     * Schema options:
     *  • timestamps: true → automatically adds `createdAt` and `updatedAt` fields
     */
    { timestamps: true }
);

// Export the Content model bound to the "contents" MongoDB collection
export default mongoose.model("Content", contentSchema);
