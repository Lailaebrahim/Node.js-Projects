import router from 'express';
import laptopRouter from './laptop.routes.js';

const indexRouter = router.Router();

indexRouter.use('/laptop', laptopRouter);

export default indexRouter;