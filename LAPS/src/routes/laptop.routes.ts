import router from 'express';
import laptopController from '../controllers/laptop.controller.js'
import laptopMiddleware from '../middlewares/laptop.middleware.js';
import {checkAuth} from "../middlewares/auth.middleware.js";
import uploadManual from "../utils/lapManualFileUpload.js";


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
.post(uploadManual.single('manual'), laptopController.createLaptop);

laptopRouter
.route('/:id')
.get(laptopController.getLaptopById)
.patch(uploadManual.single('manual'), laptopController.updateLaptop)
.delete(laptopController.deleteLaptop);

laptopRouter
.route('/ask')
.post(laptopController.askAboutLaptop);


export default laptopRouter;