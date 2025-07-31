import expressAsyncHandler from "express-async-handler";
import Laptop from "../models/laptop.model.js";
import { Request, Response, NextFunction } from "express";
import APIFeatures from "../utils/apiFeatures.js";
import AppError from "../utils/appError.js";

class LaptopController {
  getAllLaptops = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      console.log("Fetching all laptops with query:", req.query);

      // using APIFeatures to handle filtering, sorting, limiting fields, and pagination
      const features = new APIFeatures(Laptop.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

      // executing the query
      const laptops = await features.query;
      console.log("Laptops fetched successfully:", laptops.length);

      res.status(200).json({
        status: "success",
        results: laptops.length,
        data: laptops,
      });
    }
  );

  getLaptopById = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const laptop = await Laptop.findById(req.params.id);
      if (!laptop) {
        return next(new AppError("No Laptop found with that ID", 404));
      }
      res.status(200).json({
        status: "success",
        data: laptop,
      });
    }
  );

  createLaptop = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const laptop = await Laptop.create(req.body);
      res.status(201).json({
        status: "success",
        data: laptop,
      });
    }
  );

  updateLaptop = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const laptop = await Laptop.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!laptop) {
        return next(new AppError("No Laptop found with that ID", 404));
      }
      res.status(200).json({
        status: "success",
        data: laptop,
      });
    }
  );

  deleteLaptop = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const laptop = await Laptop.findByIdAndDelete(req.params.id);
      if (!laptop) {
        return next(new AppError("No Laptop found with that ID", 404));
      }
      res.status(200).json({
        status: "success",
        data: {},
      });
    }
  );

  getLaptopsStats = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const stats = await Laptop.aggregate([
        {
          $group: {
            // _id is the criteria for grouping the documents
            // in this case, we are grouping by brand
            _id: { brand: "$brand" },
            // the fields below are the aggregated values on the grouped documents
            averageSpecScore: { $avg: "$spec_score" },
            count: { $sum: 1 },
            averagePrice: { $avg: "$price" },
            maxPrice: { $max: "$price" },
            minPrice: { $min: "$price" },
            maxRam: { $max: "$ram" },
            minRam: { $min: "$ram" },
          },
        },
        {
          // the addFields stage is used to add a new field to the output
          // the new field is the brand name to later reomve _id field as a way to rename it
          $addFields: {
            brand: "$_id.brand",
          },
        },
        {
          // the project stage is used to format the output, 0 means exclude the field
          // 1 means include the field
          $project: {
            _id: 0,
          },
        },
        {
          // sorting the output by averageSpecScore in descending order
          // and by brand in ascending order
          // this is the final output of the aggregation pipeline
          // the aggregated fields and the added ones is available in this stage so can be used for sorting
          $sort: { brand: 1, averageSpecScore: -1 },
        },
      ]);
      res.status(200).json({
        status: "success",
        data: stats,
      });
    }
  );
}

const laptopController = new LaptopController();
export default laptopController;