import { Request, Response } from "express";
import fetch from "node-fetch";
import Address from "../user/models/AddressModel";
import Cart from "../cart/models/CartModel";
import Products from "../product/models/ProductModel";
import ProductVariants from "../product/models/ProductVariantModel";

export const checkOngkir = async (req: Request, res: Response) => {
    try {
        const { user_id } = req.body;
        const apiKey = process.env.RAJAONGKIR_API_KEY;

        // Use "yes" matching the enum in AddressModel
        const address = await Address.findOne({ where: { user_id, is_default: "yes" } });
        if (!address) return res.status(400).json({ message: "Alamat default tidak ditemukan" });

        const cartItems = await Cart.findAll({
            where: { user_id },
            include: [
                { model: Products, as: "product" },
                {
                    model: ProductVariants,
                    as: "variant",
                    attributes: ["id", "variant_name", "weight"],
                },
            ],
        });

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "Cart kosong, tidak bisa cek ongkir" });
        }

        let totalWeight = 0;
        cartItems.forEach((item: any) => {
            const variantWeight = parseInt(item.variant?.weight || "0", 10);
            totalWeight += variantWeight * item.quantity;
        });

        if (totalWeight <= 0) {
            return res.status(400).json({ message: "Produk belum memiliki berat yang valid" });
        }

        const searchUrl = `https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search=${encodeURIComponent(address.districts!)}&limit=100`;
        const destRes = await fetch(searchUrl, { headers: { key: apiKey } });
        const destJson = await destRes.json() as any;

        const rows: any[] = destJson.data || [];
        const needle = (address.postal_code || "").replace(/\D+/g, "");
        const matches = rows.filter(row => {
            const zip = (row.zip_code || row.zipcode || "").replace(/\D+/g, "");
            return zip && zip === needle;
        });

        const destination = matches[0] || null;
        if (!destination) return res.status(422).json({ message: "Destination id tidak valid" });

        const destinationId = parseInt(destination.id);

        // Hitung ongkir
        const originId = parseInt(process.env.ORIGIN_ID || "17587");
        const courierParam = "jne:sicepat:ide:sap:jnt:ninja:tiki:lion:anteraja:pos:ncs:rex:rpx:sentral:star:wahana:dse";
        const priceMode = "lowest";

        const costRes = await fetch("https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                key: apiKey || "",
            },
            body: new URLSearchParams({
                origin: originId.toString(),
                destination: destinationId.toString(),
                weight: totalWeight.toString(),
                courier: courierParam,
                price: priceMode,
            }),
        });

        const costJson = await costRes.json() as any;

        return res.json({
            destination,
            destination_id: destinationId,
            totalWeight,
            cost: costJson,
        });

    } catch (err: any) {
        console.error("❌ Error checkOngkir:", err);
        res.status(500).json({ message: "Gagal cek ongkir", error: err.message });
    }
};
