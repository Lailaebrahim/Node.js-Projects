import router from 'express';
import laptopRouter from './laptop.router.js';
import userRouter from './user.router.js'

const indexRouter = router.Router();

indexRouter.use('/laptop', laptopRouter);
indexRouter.use('/user', userRouter);

export default indexRouter;