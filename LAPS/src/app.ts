import express, { response } from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
import indexRouter from './routes/index.router.js';
import globalErrorHandler from "./middlewares/error.middleware.js"
import AppError from './utils/appError.js';


dotenv.config();

const app = express();

// Set query parser to "extended" - uses the extended querystring parser
// app.set('query parser', 'extended');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1', indexRouter);
// catch-all for unhandled routes
app.use((req, res, next)=>{
    next(new AppError(`URL ${req.originalUrl} Not Found`, 404, "error", true));
})
app.use(globalErrorHandler);

export default app;