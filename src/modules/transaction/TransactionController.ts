import { Request, Response } from "express";
import * as TransactionService from "./TransactionService";

export const handlePaymentCallback = async (req: Request, res: Response) => {
    try {
        const result = await TransactionService.handleCallback(req.body);
        res.json({ message: "Callback processed", result });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getTransaction = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const result = await TransactionService.getTransactionByOrder(orderId as string);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
