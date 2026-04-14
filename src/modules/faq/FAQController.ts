import { Request, Response } from "express";
import FAQs from "./models/FAQModel";

class FAQController {
    // Get all FAQs (Public)
    public static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const faqs = await FAQs.findAll({
                order: [["category", "ASC"], ["order", "ASC"]],
                where: { status: "published" }
            });
            res.json({ success: true, data: faqs });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Get all FAQs for Admin (including drafts)
    public static async getAllAdmin(req: Request, res: Response): Promise<void> {
        try {
            const faqs = await FAQs.findAll({
                order: [["category", "ASC"], ["order", "ASC"]]
            });
            res.json({ success: true, data: faqs });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Get Single FAQ (Admin/Edit)
    public static async getOne(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const faq = await FAQs.findByPk(id);

            if (!faq) {
                res.status(404).json({ success: false, error: "FAQ not found" });
                return;
            }

            res.json({ success: true, data: faq });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Create New FAQ
    public static async create(req: Request, res: Response): Promise<void> {
        try {
            const { question, answer, category, order, status } = req.body;
            const newFaq = await FAQs.create({
                question,
                answer,
                category,
                order: order || 0,
                status: status || "published"
            });
            res.status(201).json({ success: true, data: newFaq });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Update FAQ
    public static async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { question, answer, category, order, status } = req.body;
            const faq = await FAQs.findByPk(id);

            if (!faq) {
                res.status(404).json({ success: false, error: "FAQ not found" });
                return;
            }

            await faq.update({
                question,
                answer,
                category,
                order,
                status
            });

            res.json({ success: true, data: faq });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Delete FAQ
    public static async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const faq = await FAQs.findByPk(id);

            if (!faq) {
                res.status(404).json({ success: false, error: "FAQ not found" });
                return;
            }

            await faq.destroy();
            res.json({ success: true, message: "FAQ deleted successfully" });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
}

export default FAQController;
