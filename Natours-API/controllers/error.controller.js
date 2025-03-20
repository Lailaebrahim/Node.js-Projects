import AppError from "../utils/appError.js";

const handleCastErrorDB = err => {
    return new AppError(`Invalid ${err.path}: ${err.value}.`, 400);
}

const handleDuplicateErrorDB = err => {
    const value = err.errorResponse.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleJWTError = () => {
    return new AppError('Invalid token. Please login again!', 401);
}

const handleJWTExpiredError = () => {
    return new AppError('Your token has expired! Please login again!', 401);
}

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack
    });
}

const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
        })
    }
}

const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        if (err.name == 'JsonWebTokenError') {
            error = handleJWTError();
        }
        if (err.name == 'TokenExpiredError') {
            error = handleJWTExpirationError();
        }
        if (err.name === 'CastError') {
            error = handleCastErrorDB(error);
        }
        if (err.name === 'ValidationError') {
            error = handleValidationErrorDB(error);
        }
        // duplicate key error is raised from the mongodb driver underlaying the mongoose odm so we handle it using the error code
        if (err.code === 11000) {
            error = handleDuplicateErrorDB(error);
        }
        sendErrorProd(error, res);
    }
}

export default globalErrorHandler;
