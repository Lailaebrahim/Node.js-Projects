import router from 'express';
import laptopRouter from './laptop.routes.js';
import userRouter from './user.routes.js'

const indexRouter = router.Router();

indexRouter.use('/laptop', laptopRouter);
indexRouter.use('/user', userRouter);

export default indexRouter;