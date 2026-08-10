import crypto from "crypto";

export const generateSlug = (name) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
};

export const generateJoinCode = () => {
    return crypto.randomBytes(5).toString("hex").toUpperCase();
};