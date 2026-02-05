import { Request, Response } from "express";
import * as InvoiceService from "./InvoiceService";

export const getInvoice = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const result = await InvoiceService.getInvoiceByOrder(orderId as string);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
