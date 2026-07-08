const requirePermission = (permission) => {
    return (req, res, next) => {
        const permissions = req.user?.role?.permissions || [];

        if (!permissions.includes(permission)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to perform this action",
            });
        }

        next();
    };
};

export { requirePermission };
