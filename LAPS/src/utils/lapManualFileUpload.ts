import multer from "multer";
import { Request } from "express";
import { fileURLToPath } from "url";
import { extname, join, dirname } from "path";
import AppError from "./appError.js";

///When using memory storage, the file info will contain a field called buffer that contains the entire file.
const dirPath = fileURLToPath(dirname(import.meta.url));

const manualStorage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb) {
    cb(null, join(dirPath, "../uploads/manuals/laptops/"));
  },
  filename: function (req: Request, file: Express.Multer.File, cb) {
    //// Note that req.body might not have been fully populated yet. It depends on the order that the client transmits fields and files to the server.
    // model_name is strictly unique by the schema so it can be used to name file
    // const fileName = lapName + "-" + extname(file.originalname);
    // const lapName = req.body.model_name.replace(/ /g, "_");
    const timestamp = Date.now();
    const fileName = `manual-${timestamp}${extname(file.originalname)}`;

    cb(null, fileName);
  },
});

const manualFileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  const mimetype = file.mimetype.split("/")[0];
  if (mimetype === "application") {
    return cb(null, true);
  } else {
    return cb(new AppError("manual must be a PDF file", 400), false);
  }
};

const uploadManual = multer({
  storage: manualStorage,
  fileFilter: manualFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

export default uploadManual;
