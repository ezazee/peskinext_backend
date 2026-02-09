import { Request, Response } from "express";
import * as BannerService from "./BannerService";
import Banners from "./models/BannerModel";

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

export const seedPopup = async (req: Request, res: Response) => {
    try {
        const existing = await Banners.findOne({ where: { section: "popup" as any } });
        if (existing) {
            return res.json({ message: "Popup already exists", data: existing });
        }

        const banner = await Banners.create({
            section: "popup",
            image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop",
            alt_text: "Promo Spesial",
            redirect_url: "/shop",
            sort_order: 1,
            is_active: true
        });

        res.status(201).json({ message: "Popup seeded", data: banner });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
