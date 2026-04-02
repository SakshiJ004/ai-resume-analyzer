const ApiError = require('../utils/apiError');

const notFound = (req, res, next) => {
    const error = new ApiError(404, `Route not found: ${req.originalUrl}`);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    // Always log the full error in terminal
    console.error('🔴 ERROR:', err.message);
    console.error('🔴 STACK:', err.stack);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        statusCode = 404;
        message = 'Resource not found';
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue || {})[0];
        message = `${field} already exists`;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map((e) => e.message).join(', ');
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || [],
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = { notFound, errorHandler };