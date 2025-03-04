import express from "express";
import * as tourController from "../controllers/tour.controller.js";

const tourRouter = express.Router();

tourRouter
    .route("/")
    .get(tourController.getAllTours)
    .post(tourController.createTour);

tourRouter
    .route("/:id")
    .get(tourController.getTourById)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour);

export default tourRouter;
