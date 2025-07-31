class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public status = 'error',
    public isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}
export default AppError;
