import { Request, Response, NextFunction } from 'express';
import Laptop from '../models/laptop.model.js';


class LaptopMiddleware {
    async validateLaptopData(req: Request, res: Response, next: NextFunction) {
        const { model_name, brand, spec_score } = req.body;
        if (!model_name || !brand || !spec_score) {
            return res.status(400).json({ message: "All fields are required" });
        }
        next();
    }
    aliasTopFiveAdvanced(req: Request, res: Response, next: NextFunction) {
        req.url = '/api/v1/laptop?sort=-spec_score model_name&limit=5';
        next();
    }
}

const laptopMiddleware = new LaptopMiddleware();
export default laptopMiddleware;
