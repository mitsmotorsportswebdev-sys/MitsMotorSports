export function notFoundHandler(_req, res) {
    return res.status(404).json({
        success: false,
        message: "Route not found",
    });
}

export function errorHandler(error, _req, res, _next) {
    const statusCode = error.statusCode || 500;

    if (process.env.NODE_ENV !== "production") {
        console.error(error);
    } else {
        console.error("Server error", error.message);
    }

    return res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? "Internal server error" : error.message,
    });
}
