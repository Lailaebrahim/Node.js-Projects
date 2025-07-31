import router from 'express';
import laptopController from '../controllers/laptop.controller.js'
import laptopMiddleware from '../middlewares/laptop.middleware.js';
import {checkAuth} from "../middlewares/auth.middleware.js";


const laptopRouter = router.Router();

laptopRouter
.route('/stats')
.get(checkAuth, laptopController.getLaptopsStats);

laptopRouter
.route('/top-5-advanced')
.get(laptopMiddleware.aliasTopFiveAdvanced, laptopController.getAllLaptops);

laptopRouter
.route('/')
.get(laptopController.getAllLaptops)
.post(laptopController.createLaptop);

laptopRouter
.route('/:id')
.get(laptopController.getLaptopById)
.patch(laptopController.updateLaptop)
.delete(laptopController.deleteLaptop);



export default laptopRouter;