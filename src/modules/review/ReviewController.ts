import { Request, Response } from "express";
import * as ReviewService from "./ReviewService";

export const getReviews = async (req: Request, res: Response) => {
    try {
        const { slug } = req.query;
        if (!slug) throw new Error("Product slug required");
        const reviews = await ReviewService.getReviewsByProduct(slug as string);
        res.json(reviews);
    } catch (error: any) {
        if (error.message === "Produk tidak ditemukan") {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

export const createReview = async (req: Request, res: Response) => {
    try {
        // Auth middleware populates req.user with JWT payload {sub, role, aud}
        const userId = (req as any).user?.sub as string;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const result = await ReviewService.createReview(userId, req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllReviews = async (req: Request, res: Response) => {
    try {
        const reviews = await ReviewService.getAllReviewsAdmin();
        res.json({ success: true, data: reviews });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteReview = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await ReviewService.deleteReview(Number(id));
        res.json({ success: true, message: "Ulasan berhasil dihapus" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createReviewByAdmin = async (req: Request, res: Response) => {
    try {
        const result = await ReviewService.createReviewAdmin(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
