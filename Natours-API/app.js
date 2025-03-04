import express from 'express';
import tourRouter from './routes/tour.routes.js';
import userRouter from './routes/user.routes.js';



const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

export default app;