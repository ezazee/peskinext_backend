import { Request, Response } from "express";
import * as CouponService from "./CouponService";

export const getCoupons = async (req: Request, res: Response) => {
    try {
        const coupons = await CouponService.getAllCoupons();
        res.json(coupons);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const checkCoupon = async (req: Request, res: Response) => {
    try {
        const { code, total, regionTag } = req.body;
        const result = await CouponService.checkCoupon(code, total, regionTag);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
