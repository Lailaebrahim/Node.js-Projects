import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError.js";

const handleCastErrorDB = (err: any) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  return new AppError(`Invalid Input Data: ${errors.join(", ")}`, 400);
};

const handleDuplicateErrorDB = (err: any) => {
  // const value = err.errmsg.match(/(["'])((?:(?!\1)[^\\]|\\.)*)?\1/)[0];
  const fieldName = Object.keys(err.keyValue)[0]; // "model_name"
  const fieldValue = Object.values(err.keyValue)[0]; // "Lenovo Laptop"

  return new AppError(
    `${fieldName} '${fieldValue}' already exists. Please use a different ${fieldName}.`,
    400
  );
};

const handleJsonWebTokenError = (err: any)=>{
  return new AppError("Invalid Token", 401);
}

const handleTokenExpiredError = (err: any)=>{
  return new AppError("Token Expired, Login Again !", 401);
}

const sendErrorDevelopment = (err: AppError, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "fail",
    message: err.message || "something went wrong",
    error: err,
    stack: err.stack,
  });
};

const sendErrorProduction = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: err.status || "fail",
      message: err.message || "something went wrong",
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "SOMETHING WENT WRONG!",
    });
  }
};

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err);
  if (process.env.NODE_ENV === "development") {
    sendErrorDevelopment(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    if (err.name === "CastError") {
      error = handleCastErrorDB(error);
    }
    if (err.name === "ValidationError") {
      error = handleValidationErrorDB(error);
    }
    if (err.code === 11000) {
      error = handleDuplicateErrorDB(error);
    }
    if(err.name === "JsonWebTokenError") {
      error = handleJsonWebTokenError(error);
    }
    if(err.name === "TokenExpiredError") {
      error = handleTokenExpiredError(error);
    }

    sendErrorProduction(error, res);
  }
};

export default globalErrorHandler;