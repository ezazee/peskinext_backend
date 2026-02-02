import { Request, Response } from "express";
import * as ProductService from "./ProductService";

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await ProductService.getAllProducts();
        res.json(products);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getProductDetail = async (req: Request, res: Response) => {
    try {
        const product = await ProductService.getProductDetail(req.params.productId, req.query.channel as string);
        res.json(product);
    } catch (error: any) {
        res.status(error.message === "Produk tidak ditemukan" ? 404 : 500).json({ message: error.message });
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
        await ProductService.updateProduct(req.params.id, req.body);
        res.json({ message: "Produk berhasil diperbarui" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        await ProductService.deleteProduct(req.params.productId);
        res.json({ message: "Produk berhasil dihapus" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getProductStock = async (req: Request, res: Response) => {
    try {
        const result = await ProductService.getProductStock(req.params.productId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const addStock = async (req: Request, res: Response) => {
    try {
        await ProductService.addStock(req.body.stocks);
        res.status(201).json({ message: "Stok berhasil ditambahkan" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const updateStock = async (req: Request, res: Response) => {
    try {
        await ProductService.updateStock(req.params.id, req.body);
        res.json({ message: "Stok berhasil diperbarui" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteStock = async (req: Request, res: Response) => {
    try {
        await ProductService.deleteStock(req.params.variantId, req.params.stockId);
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
        await ProductService.updateProductVariant(id, req.body);
        res.json({ message: "Variant berhasil diupdate" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteVariant = async (req: Request, res: Response) => {
    try {
        await ProductService.deleteProductVariant(req.params.productId, req.params.variantId);
        res.json({ message: "Variant berhasil dihapus" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const getVariant = async (req: Request, res: Response) => {
    try {
        const result = await ProductService.getVariantById(req.params.variantId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
