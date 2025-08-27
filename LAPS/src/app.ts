import hpp from 'hpp';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import AppError from './utils/appError.js';
import express, { response } from 'express';
import indexRouter from './routes/index.router.js';
import globalErrorHandler from "./middlewares/error.middleware.js";
import { laptopRoutesWhitelist } from './utils/routesParamatersWhitelist.js';


dotenv.config();

const app = express();

// add http security headers
app.use(helmet());

// Set query parser to "extended" - uses the extended querystring parser
// app.set('query parser', 'extended');

// rate limit to protect from brute force attack
const rateLImiter = rateLimit({
    limit: 100,
    windowMs: 60 * 60 * 1000,
    message: "Slow Down !! Two Many Requests ! Try Again Hour Later."
})
app.use(rateLImiter);

// allow cross-origin requests
app.use(cors());

// parse request body
app.use(express.json());

// parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// protect against HTTP Parameter Pollution
app.use('/api', hpp({
    whitelist: [
        ...laptopRoutesWhitelist
    ]
}));

// add API routes
app.use('/api/v1', indexRouter);

// catch-all for unhandled routes
app.use((req, res, next)=>{
    next(new AppError(`URL ${req.originalUrl} Not Found`, 404, "error", true));
})
app.use(globalErrorHandler);

export default app;