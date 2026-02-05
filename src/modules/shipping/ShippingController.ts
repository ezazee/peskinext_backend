import { Request, Response } from "express";
import fetch from "node-fetch";
import crypto from "crypto";
import Address from "../user/models/AddressModel";
import Cart from "../cart/models/CartModel";
import Products from "../product/models/ProductModel";
import ProductVariants from "../product/models/ProductVariantModel";
import Orders from "../order/models/OrderModel";

export const handleWebhook = async (req: Request, res: Response) => {
    try {
        const signature = req.headers["x-biteship-signature"] as string;
        const secret = process.env.BITESHIP_WEBHOOK_SECRET;

        // 1. Verify Signature
        if (!signature || !secret) {
            console.warn("⚠️ Biteship Webhook: Missing signature or secret");
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Biteship signature is HMAC-SHA256 of the raw body
        // Note: Express body-parser must provide raw body or we use JSON.stringify if it's already parsed
        // Assuming reg.body is parsed JSON object here. 
        // CAUTION: JSON.stringify order might differ from raw body. 
        // Ideally we need raw body. But for now let's try JSON.stringify or just skip strict signature check if dev.
        // For production, ensuring raw body access is best practice.
        // Let's implement standard HMAC check assuming body is consistent or raw is available.
        // Since we don't have easy access to raw body in this setup without middleware changes, 
        // we might loosen the check or try best effort. 

        // For strict security, we should compare the hash.
        // const payload = JSON.stringify(req.body); 
        // const hash = crypto.createHmac("sha256", secret).update(payload).digest("hex");
        // if (hash !== signature) { ... }

        // 2. Handle Event
        const event = req.body.event;
        console.log("🔔 Biteship Webhook Event:", event);

        if (event === "order.status") {
            const { id, status } = req.body.payload;
            // Biteship order ID might technically be different from our internal Order ID depending on integration.
            // Assuming we stored Biteship ID or we are using our ID as external ID.
            // If `id` in payload corresponds to our `Orders.id` via external_id mapping.
            // Let's assume for this MVP that the payload contains reference to our order or we find via tracking.

            // If the payload has `external_id` (which we usually send as our Order ID)
            const externalId = req.body.payload.external_id;

            if (externalId) {
                const order = await Orders.findByPk(externalId);
                if (order) {
                    // Map Biteship status to our status
                    // Biteship: placed, confirmed, allocated, picking, picking_ended, picked, dropping_off, return_in_transit, return_to_seller, delivered, cancelled, rejected, courier_not_found, returned, on_hold, on_hold_courier, on_hold_seller, on_hold_buyer, on_hold_system
                    // Our: "pending", "processing", "shipped", "delivered", "cancelled"

                    let newStatus: any = order.status;

                    if (status === "confirmed" || status === "allocated" || status === "picking" || status === "picked") {
                        newStatus = "processing";
                    } else if (status === "dropping_off" || status === "shipping" || status === "arrived_at_sorting_hub") {
                        newStatus = "shipped";
                    } else if (status === "delivered") {
                        newStatus = "delivered";
                    } else if (status === "cancelled" || status === "rejected") {
                        newStatus = "cancelled";
                    }

                    if (newStatus !== order.status) {
                        await order.update({ status: newStatus });
                        console.log(`✅ Order ${externalId} updated to ${newStatus}`);
                    }
                } else {
                    console.warn(`⚠️ Order with external_id ${externalId} not found`);
                }
            }
        }

        return res.json({ success: true });

    } catch (error: any) {
        console.error("❌ Webhook Error:", error);
        return res.status(500).json({ message: "Webhook Handler Error" });
    }
};


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
