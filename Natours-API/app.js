import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/error.controller.js';
import tourRouter from './routes/tour.routes.js';
import userRouter from './routes/user.routes.js';


dotenv.config();
const app = express();
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: "fail",
    //     message: `Couldn't find ${req.originalUrl} on this server :(`
    // })
    // const err = new Error(`Couldn't find ${req.originalUrl} on this server :(`);
    // err.statusCode = 404;
    // err.status = 'fail';
    // next(err);
    next(new AppError(`Couldn't find ${req.originalUrl} on this server :(`, 404));
});
app.use(globalErrorHandler);

export default app;