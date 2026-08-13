import crypto from "crypto";

export const generateSlug = (name) => {
     const base = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    const suffix = crypto.randomBytes(4).toString("hex");

    return `${base}-${suffix}`;
};

export const generateJoinCode = () => {
    return crypto.randomBytes(5).toString("hex").toUpperCase();
};