import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/error.controller.js';
import tourRouter from './routes/tour.routes.js';
import userRouter from './routes/user.routes.js';
import reviewRouter from './routes/review.routes.js';
// import { whitelist } from 'validator';

// ================== Global Middlewares ==================

// load environment variables
dotenv.config();

// create an express app
const app = express();

// middleware to set security HTTP headers
app.use(helmet());

// middleware to log requests in development mode
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// middleware to limit the number of requests from an IP
const limiter = rateLimit({
    limit: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour'
})
app.use('/api', limiter);

// middleware to parse the body of the request
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// middleware to sanitize the body of the request from NoSQL query injection
app.use(mongoSanitize());

// middleware to protect from xss attacks
app.use(xss());

// middleware to protect from parameter pollution
// whitelist is used to allow duplicate query parameters
// for example: /api/v1/tours?duration=5&duration=9
// by default, the last query parameter will be used for parameters as sort, limit, etc.
app.use(hpp({
    whitelist: [
        'duration',
        'ratingQuantity',
        'ratingAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));

// middleware to serve static files
const __dirname = new URL('.', import.meta.url).pathname;
app.use(express.static(`${__dirname}/public`));

// adding routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// middleware to handle unhandled routes
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

// global middleware to handle errors
app.use(globalErrorHandler);

export default app;