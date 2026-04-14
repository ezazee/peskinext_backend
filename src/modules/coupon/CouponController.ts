import { Request, Response } from "express";
import * as CouponService from "./CouponService";

export const getCoupons = async (req: Request, res: Response) => {
    try {
        const isAdmin = req.query.admin === 'true';
        const coupons = await CouponService.getAllCoupons(isAdmin);
        res.json(coupons);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getCouponById = async (req: Request, res: Response) => {
    try {
        const coupon = await CouponService.getCouponById(req.params.id);
        res.json(coupon);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};

export const createCoupon = async (req: Request, res: Response) => {
    try {
        const coupon = await CouponService.createCoupon(req.body);
        res.status(201).json(coupon);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateCoupon = async (req: Request, res: Response) => {
    try {
        const coupon = await CouponService.updateCoupon(req.params.id, req.body);
        res.json(coupon);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteCoupon = async (req: Request, res: Response) => {
    try {
        await CouponService.deleteCoupon(req.params.id);
        res.json({ message: "Kupon berhasil dihapus" });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const checkCoupon = async (req: Request, res: Response) => {
    try {
        const { code, total, regionTag, isManual } = req.body;
        const result = await CouponService.checkCoupon(code, total, regionTag, isManual);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
