import { Request, Response } from "express";
import * as ProductService from "./ProductService";
import { Op } from "sequelize";
import FlashSale from "../flash-sale/models/FlashSaleModel";
import FlashSaleItem from "../flash-sale/models/FlashSaleItemModel";

/** HELPER: Get currently active flash sale items as a Map<variant_id, item_data> */
const getActivePromoMap = async () => {
    const now = new Date();
    const activeCampaign = await FlashSale.findOne({
        where: {
            is_active: true,
            start_time: { [Op.lte]: now },
            end_time: { [Op.gte]: now }
        },
        include: [{ 
            model: FlashSaleItem, 
            as: "items",
            attributes: ["variant_id", "flash_sale_price"],
            include: [{
                model: require("../product/models/ProductVariantModel").default,
                as: "variant",
                attributes: ["id"],
                include: [{
                    model: require("../product/models/ProductVariantPriceModel").default,
                    as: "prices",
                    where: { channel: "default" },
                    required: false
                }]
            }]
        }]
    }) as any;

    const promoMap = new Map<number, any>();
    if (activeCampaign && activeCampaign.items) {
        activeCampaign.items.forEach((item: any) => {
            const variantPrice = item.variant?.prices?.[0]?.price || 0;
            promoMap.set(Number(item.variant_id), {
                flash_sale_price: item.flash_sale_price,
                original_price: variantPrice
            });
        });
    }
    return promoMap;
};

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const search = req.query.search as string;
        const promoMap = await getActivePromoMap();
        const products = await ProductService.getAllProducts(search, promoMap);
        res.json(products);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const calculatePrice = async (req: Request, res: Response) => {
    try {
        const { productId, variantId, qty, channel } = req.body;
        const promoMap = await getActivePromoMap();
        const result = await ProductService.calculateProductPrice({
            productId,
            variantId: Number(variantId),
            qty: Number(qty),
            channel: channel as string,
            activePromoItems: promoMap
        });
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getProductDetail = async (req: Request, res: Response) => {
    try {
        const promoMap = await getActivePromoMap();
        const product = await ProductService.getProductDetail(
            req.params.productId as string, 
            req.query.channel as string, 
            promoMap
        );
        res.json(product);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const result = await ProductService.createProduct(req.body);
        res.status(201).json({ message: "Produk berhasil dibuat", product_id: result.id });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        await ProductService.updateProduct(req.params.id as string, req.body);
        res.json({ message: "Produk berhasil diperbarui" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        await ProductService.deleteProduct(req.params.productId as string);
        res.json({ message: "Produk berhasil dihapus" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getProductStock = async (req: Request, res: Response) => {
    try {
        const result = await ProductService.getProductStock(req.params.productId as string);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const addStock = async (req: Request, res: Response) => {
    try {
        // Handle both { stocks: [...] } and direct array [...]
        const stocks = Array.isArray(req.body) ? req.body : req.body.stocks;
        if (!stocks) throw new Error("Stocks data are required");
        
        await ProductService.addStock(stocks);
        res.status(201).json({ message: "Stok berhasil ditambahkan" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const transferStock = async (req: Request, res: Response) => {
    try {
        await ProductService.transferStock(req.body);
        res.json({ message: "Transfer stok berhasil" });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const updateStock = async (req: Request, res: Response) => {
    try {
        await ProductService.updateStock(req.params.id as string, req.body);
        res.json({ message: "Stok berhasil diperbarui" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteStock = async (req: Request, res: Response) => {
    try {
        await ProductService.deleteStock(req.params.variantId as string, req.params.stockId as string);
        res.json({ message: "Stock berhasil dihapus" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const addVariant = async (req: Request, res: Response) => {
    try {
        const result = await ProductService.addProductVariant(req.body);
        res.status(201).json({ message: "Variant berhasil ditambahkan", variant_id: result.id });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const updateVariant = async (req: Request, res: Response) => {
    try {
        const id = req.params.variantId || req.body.variant_id;
        await ProductService.updateProductVariant(id as string, req.body);
        res.json({ message: "Variant berhasil diupdate" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteVariant = async (req: Request, res: Response) => {
    try {
        await ProductService.deleteProductVariant(req.params.productId as string, req.params.variantId as string);
        res.json({ message: "Variant berhasil dihapus" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const getVariant = async (req: Request, res: Response) => {
    try {
        const result = await ProductService.getVariantById(req.params.variantId as string);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
