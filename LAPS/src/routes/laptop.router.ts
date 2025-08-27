import router from 'express';
import laptopController from '../controllers/laptop.controller.js'
import laptopMiddleware from '../middlewares/laptop.middleware.js';
import {checkAuth, restrictTo} from "../middlewares/auth.middleware.js";
import uploadManual from "../utils/lapManualFileUpload.js";


const laptopRouter = router.Router();

laptopRouter
.route('/stats')
.get(checkAuth, restrictTo('admin'), laptopController.getLaptopsStats);

laptopRouter
.route('/top-5-advanced')
.get(laptopMiddleware.aliasTopFiveAdvanced, laptopController.getAllLaptops);

laptopRouter
.route('/')
.get(laptopController.getAllLaptops)
.post(checkAuth, restrictTo('admin'), uploadManual.single('manual'), laptopController.createLaptop);

laptopRouter
.route('/:id')
.get(laptopController.getLaptopById)
.patch(checkAuth, restrictTo('admin'), uploadManual.single('manual'), laptopController.updateLaptop)
.delete(checkAuth, restrictTo('admin'), laptopController.deleteLaptop);

laptopRouter
.route('/ask')
.post(laptopController.askAboutLaptop);


export default laptopRouter;