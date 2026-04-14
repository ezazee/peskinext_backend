import { v4 as uuidv4 } from "uuid";
import db from "../../../config/database";
import Orders from "../models/OrderModel";
import OrderItems from "../models/OrderItemModel";
import ProductVariants from "../../product/models/ProductVariantModel";
import ProductVariantPrices from "../../product/models/ProductVariantPriceModel";
import Products from "../../product/models/ProductModel";

const seedOrderItems = async () => {
    try {
        await db.authenticate();
        console.log("🚀 Berhasil terhubung ke Database untuk restorasi data...");

        // Ensure tables are synced
        await OrderItems.sync();

        // 1. Get all orders
        const orders = await Orders.findAll();
        console.log(`🔍 Ditemukan ${orders.length} pesanan.`);

        // 2. Get all variants with prices
        const variants = await ProductVariants.findAll({
            include: [{
                model: ProductVariantPrices,
                as: 'prices',
                where: { channel: ['default', 'website'] },
                required: false
            }, {
                model: Products,
                required: true
            }]
        });

        if (variants.length === 0) {
            console.error("❌ Tidak ada varian produk dengan harga. Harap jalankan 'npm run seedProduct' terlebih dahulu.");
            process.exit(1);
        }

        let totalItemsCreated = 0;

        for (const order of orders) {
            // Only seed if order is empty
            const existingItems = await OrderItems.count({ where: { order_id: order.id } });
            
            if (existingItems === 0) {
                console.log(`🛠️ Mengisi barang untuk pesanan: ${order.id.split('-')[0]}...`);
                
                // Pick 1-2 random variants for each order
                const numItems = Math.floor(Math.random() * 2) + 1;
                const selectedVariants = variants.sort(() => 0.5 - Math.random()).slice(0, numItems);
                
                let orderSubtotal = 0;

                for (const variant of selectedVariants) {
                    const qty = Math.floor(Math.random() * 2) + 1;
                    
                    // Get price from variant prices
                    const priceInfo = (variant as any).prices?.[0] || { price: 50000 }; // Fallback price
                    const price = parseFloat(priceInfo.price);
                    
                    await OrderItems.create({
                        id: uuidv4(),
                        order_id: order.id,
                        product_id: variant.product_id,
                        variant_id: variant.id,
                        quantity: qty,
                        price: price
                    });
                    
                    orderSubtotal += price * qty;
                    totalItemsCreated++;
                }

                // Update order total (subtotal + shipping)
                const shipping = 10000;
                order.total_amount = orderSubtotal + shipping;
                await order.save();
            }
        }

        console.log(`✅ Sukses! Membuat ${totalItemsCreated} record di tabel order_items.`);
        console.log("✨ Data Dashboard Admin Anda sekarang seharusnya sudah terisi.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Gagal melakukan seeding order_items:", error);
        process.exit(1);
    }
};

seedOrderItems();
