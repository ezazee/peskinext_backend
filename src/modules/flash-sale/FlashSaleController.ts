import { Request, Response } from "express";
import FlashSale from "./models/FlashSaleModel";
import FlashSaleItem from "./models/FlashSaleItemModel";
import Products from "../product/models/ProductModel";
import { Op } from "sequelize";

class FlashSaleController {
    // Get all Flash Sale campaigns (Admin)
    public static async getAllAdmin(req: Request, res: Response): Promise<void> {
        try {
            const campaigns = await FlashSale.findAll({
                include: [
                    {
                        model: FlashSaleItem,
                        as: "items",
                        include: [{ model: Products, as: "product", attributes: ["name", "slug", "front_image"] }]
                    }
                ],
                order: [["start_time", "DESC"]]
            });
            res.json({ success: true, data: campaigns });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Get Flash Sale by ID (Admin)
    public static async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const campaign = await FlashSale.findByPk(id, {
                include: [
                    {
                        model: FlashSaleItem,
                        as: "items",
                        include: [
                            { 
                                model: Products, 
                                as: "product", 
                                attributes: ["name", "slug", "front_image"]
                            },
                            {
                                model: require("../product/models/ProductVariantModel").default,
                                as: "variant",
                                include: [{
                                    model: require("../product/models/ProductVariantPriceModel").default,
                                    as: "prices",
                                    where: { channel: "default" },
                                    required: false
                                }]
                            }
                        ]
                    }
                ]
            });

            if (!campaign) {
                res.status(404).json({ success: false, error: "Flash Sale not found" });
                return;
            }

            res.json({ success: true, data: campaign });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Create New Flash Sale
    public static async create(req: Request, res: Response): Promise<void> {
        try {
            const { 
                name, description, start_time, end_time, items, is_active,
                bg_type, bg_color, bg_image_desktop, bg_image_mobile 
            } = req.body;
            
            // Safety Guard: Check for overlapping active campaigns
            const startStr = new Date(start_time).toISOString();
            const endStr = new Date(end_time).toISOString();

            if (is_active !== false) { // Default is true
                const conflict = await FlashSale.findOne({
                    where: {
                        is_active: true,
                        [Op.and]: [
                            { start_time: { [Op.lt]: endStr } },
                            { end_time: { [Op.gt]: startStr } }
                        ]
                    }
                });

                if (conflict) {
                    res.status(400).json({ 
                        success: false, 
                        error: `Waktu bentrok dengan campaign aktif: "${conflict.name}". Silakan ganti jam atau nonaktifkan promo tersebut.` 
                    });
                    return;
                }
            }

            const campaign = await FlashSale.create({
                name,
                description,
                start_time: new Date(start_time),
                end_time: new Date(end_time),
                is_active: is_active !== undefined ? is_active : true,
                status: "active",
                bg_type: bg_type || "color",
                bg_color,
                bg_image_desktop,
                bg_image_mobile
            });

            if (items && Array.isArray(items)) {
                for (const item of items) {
                    await FlashSaleItem.create({
                        flash_sale_id: campaign.id,
                        product_id: item.product_id,
                        variant_id: item.variant_id,
                        flash_sale_price: item.flash_sale_price,
                        stock_limit: item.stock_limit || 0
                    });
                }
            }

            res.status(201).json({ success: true, data: campaign });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Delete Flash Sale
    public static async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const campaign = await FlashSale.findByPk(id);

            if (!campaign) {
                res.status(404).json({ success: false, error: "Flash Sale not found" });
                return;
            }

            // Delete associated items first
            await FlashSaleItem.destroy({ where: { flash_sale_id: id } });
            await campaign.destroy();

            res.json({ success: true, message: "Flash Sale deleted successfully" });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Get Active Flash Sale (Public)
    public static async getActive(req: Request, res: Response): Promise<void> {
        try {
            const now = new Date();
            const campaign = await FlashSale.findOne({
                where: {
                    is_active: true,
                    start_time: { [Op.lte]: now },
                    end_time: { [Op.gte]: now }
                },
                include: [
                    {
                        model: FlashSaleItem,
                        as: "items",
                        include: [
                            { 
                                model: Products, 
                                as: "product",
                                attributes: ["name", "slug", "front_image"]
                            },
                            {
                                model: require("../product/models/ProductVariantModel").default,
                                as: "variant",
                                include: [{
                                    model: require("../product/models/ProductVariantPriceModel").default,
                                    as: "prices",
                                    where: { channel: "default" },
                                    required: false
                                }]
                            }
                        ]
                    }
                ],
                order: [["created_at", "DESC"]]
            });

            res.json({ success: true, data: campaign });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Update Flash Sale
    public static async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { 
                name, description, start_time, end_time, items, is_active,
                bg_type, bg_color, bg_image_desktop, bg_image_mobile
            } = req.body;
            const campaign = await FlashSale.findByPk(id);

            if (!campaign) {
                res.status(404).json({ success: false, error: "Flash Sale not found" });
                return;
            }

            // Safety Guard: Check for overlapping active campaigns (excluding self)
            const targetActive = is_active !== undefined ? is_active : campaign.is_active;
            const targetStart = start_time ? new Date(start_time) : campaign.start_time;
            const targetEnd = end_time ? new Date(end_time) : campaign.end_time;

            if (targetActive) {
                const conflict = await FlashSale.findOne({
                    where: {
                        id: { [Op.ne]: id },
                        is_active: true,
                        [Op.and]: [
                            { start_time: { [Op.lt]: targetEnd.toISOString() } },
                            { end_time: { [Op.gt]: targetStart.toISOString() } }
                        ]
                    }
                });

                if (conflict) {
                    res.status(400).json({ 
                        success: false, 
                        error: `Waktu bentrok dengan campaign aktif lain: "${conflict.name}".` 
                    });
                    return;
                }
            }

            await campaign.update({
                name,
                description,
                start_time: start_time ? new Date(start_time) : campaign.start_time,
                end_time: end_time ? new Date(end_time) : campaign.end_time,
                is_active: targetActive,
                bg_type: bg_type !== undefined ? bg_type : campaign.bg_type,
                bg_color: bg_color !== undefined ? bg_color : campaign.bg_color,
                bg_image_desktop: bg_image_desktop !== undefined ? bg_image_desktop : campaign.bg_image_desktop,
                bg_image_mobile: bg_image_mobile !== undefined ? bg_image_mobile : campaign.bg_image_mobile
            });

            if (items && Array.isArray(items)) {
                // Simplified: Delete and recreate items
                await FlashSaleItem.destroy({ where: { flash_sale_id: id } });
                for (const item of items) {
                    await FlashSaleItem.create({
                        flash_sale_id: id,
                        product_id: item.product_id,
                        variant_id: item.variant_id,
                        flash_sale_price: item.flash_sale_price,
                        stock_limit: item.stock_limit || 0
                    });
                }
            }

            res.json({ success: true, data: campaign });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
}

export default FlashSaleController;
