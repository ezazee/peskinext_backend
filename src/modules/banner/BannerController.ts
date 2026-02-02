import { Request, Response } from "express";
import * as BannerService from "./BannerService";

export const getBanners = async (req: Request, res: Response) => {
    try {
        const banners = await BannerService.getAllBanners();
        res.json(banners);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createBanner = async (req: Request, res: Response) => {
    try {
        const result = await BannerService.createBanner(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
