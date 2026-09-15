export function successResponse(data, meta = {}) {
    return {
        success: true,
        data,
        ...meta,
    };
}

export function errorResponse(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
