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
