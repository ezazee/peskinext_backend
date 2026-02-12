import { Request, Response } from "express";
import Orders from "./models/OrderModel";
import * as NotificationService from "../notification/NotificationService";
import OrderItems from "./models/OrderItemModel";
import OrderStatusHistory from "./models/OrderStatusHistoryModel";
import Cart from "../cart/models/CartModel";
import Products from "../product/models/ProductModel";
import ProductVariants from "../product/models/ProductVariantModel";
import Address from "../user/models/AddressModel";
import Transaction from "../transaction/models/TransactionModel";
import Users from "../user/models/UserModel";
import * as DokuService from "../payment/services/DokuService";
import Reviews from "../review/models/ReviewModel";
import db from "../../config/database";

export const createOrder = async (req: Request, res: Response) => {
    const t = await db.transaction();
    try {
        const { user_id, address_id, courier, courier_service, shipping_cost, coupon_id, items } = req.body;

        // Use provided address_id or fallback to default address
        let finalAddressId = address_id;
        if (!finalAddressId || finalAddressId === "temp") {
            const address = await Address.findOne({ where: { user_id, is_default: "yes" } });
            if (address) {
                finalAddressId = address.id;
            } else {
                // Allow temporary address for initial order creation
                finalAddressId = "00000000-0000-0000-0000-000000000000";
            }
        }

        let orderItemsData: any[] = [];
        let grandTotalCalc = 0;

        // 1. Use items from payload if available (Direct Buy / specific checkout)
        if (items && Array.isArray(items) && items.length > 0) {
            orderItemsData = items.map((item: any) => ({
                product_id: item.product_id,
                quantity: item.quantity || item.qty, // Accept both 'quantity' and 'qty'
                price: item.price,
                variant_id: item.variant_id || null // Optional if you have variants
            }));

            // Calculate total from items
            items.forEach((item: any) => {
                const qty = item.quantity || item.qty || 1;
                grandTotalCalc += item.price * qty;
            });

            // NOTE: Cart is managed in frontend localStorage, not database
            // Frontend will handle removing items from cart

        } else {
            // 2. Fallback to Database Cart
            const cartItems = await Cart.findAll({
                where: { user_id },
                include: [{ model: Products, as: "product" }],
            });

            if (!cartItems.length) {
                await t.rollback();
                return res.status(400).json({ message: "Cart kosong" });
            }

            orderItemsData = cartItems.map((item: any) => {
                const price = parseFloat(item.product?.price || 0);
                grandTotalCalc += price * item.quantity;
                return {
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: price,
                    // variant?? CartModel might need update if we support variants there
                };
            });

            // Only clear cart if we used the cart!
            await Cart.destroy({ where: { user_id }, transaction: t });
        }

        let discount = 0;
        if (coupon_id) {
            discount = 0; // Implement logic if needed
        }

        // recalculate total or use payload? 
        // Best practice: Recalculate server side. 
        // But for DOKU integration urgency, let's allow frontend total or re-sum.
        // The controller previously did: totalAmount = subtotal + shipping - discount

        const totalAmount = grandTotalCalc + parseFloat(shipping_cost || 0) - discount;

        // Create order (address_id and courier can be temporary, will be updated in checkout)
        const order = await Orders.create(
            {
                user_id,
                address_id: finalAddressId,
                total_amount: totalAmount,
                shipping_cost: parseFloat(shipping_cost || 0),
                original_shipping_cost: parseFloat(shipping_cost || 0), // Initially same as shipping_cost
                discount,
                courier: courier || "pending", // Temporary value
                courier_service: courier_service || null,
                status: "pending",
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours expiry
            },
            { transaction: t }
        );
        const finalOrderItems = orderItemsData.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price
        }));

        await OrderItems.bulkCreate(finalOrderItems, { transaction: t });

        await OrderStatusHistory.create({
            order_id: order.id,
            status: "pending",
            note: "Pesanan dibuat, menunggu pembayaran",
        }, { transaction: t });

        await Cart.destroy({ where: { user_id }, transaction: t });

        await t.commit();
        res.status(201).json({
            message: "Order berhasil dibuat",
            order_id: order.id,
            total: totalAmount,
            shipping_cost,
            courier
        });

    } catch (err: any) {
        await t.rollback();
        console.error("❌ Error createOrder:", err);
        res.status(500).json({ message: "Gagal membuat order", error: err.message });
    }
};

export const getOrders = async (req: Request, res: Response) => {
    try {
        const { user_id } = req.params;
        const orders = await Orders.findAll({
            where: { user_id: user_id as string },
            include: [{
                model: OrderItems,
                as: "items"
            }],
            order: [["created_at", "DESC"]]
        });

        // Proactive Check for Pending Orders (Limit to recent ones to avoid delay)
        // We check status for orders that are 'pending' to sync with DOKU
        for (const order of orders) {
            if (order.status === "pending") {
                try {
                    const transaction = await Transaction.findOne({ where: { order_id: order.id } });
                    if (transaction && transaction.invoice_number) {
                        const status = await DokuService.checkTransactionStatus(transaction.invoice_number);
                        if (status === "SUCCESS") {
                            order.status = "paid";
                            transaction.status = "success";
                            await order.save();
                            await transaction.save();

                        } else if (status === "FAILED" || status === "EXPIRED") {
                            // Optional: mark failed
                            transaction.status = "failed";
                            await transaction.save();
                        }
                    }
                } catch (e) {
                    console.error("⚠️ Failed sync in getOrders:", e);
                }
            }
        }

        // Manually fetch product data for each order item
        const formattedOrders = await Promise.all(orders.map(async (order: any) => {
            const orderJson = order.toJSON();


            // Fetch product and variant data for each item
            const itemsWithProducts = await Promise.all(orderJson.items.map(async (item: any) => {
                const product = await Products.findByPk(item.product_id, {
                    attributes: ['id', 'name', 'slug', 'front_image', 'type', 'weight_gr']
                });

                let variant: any = null;
                if (item.variant_id) {
                    variant = await ProductVariants.findByPk(item.variant_id);
                }

                // Fetch review data for this item
                const existingReview = await Reviews.findOne({
                    where: {
                        user_id: user_id,
                        product_id: item.product_id,
                        order_id: order.id,
                        variant_id: item.variant_id || null
                    }
                });

                let reviewData: any = null;
                if (existingReview) {
                    const reviewJson = existingReview.toJSON() as any;
                    let images: string[] = [];
                    try { images = JSON.parse(reviewJson.images || "[]"); } catch (e) { }

                    reviewData = {
                        id: reviewJson.id,
                        rating: reviewJson.rating,
                        comment: reviewJson.comment,
                        images: images,
                        created_at: reviewJson.created_at
                    };
                }

                return {
                    ...item,
                    product: product ? product.toJSON() : null,
                    variant: variant ? variant.toJSON() : null,
                    review: reviewData
                };
            }));

            return {
                ...orderJson,
                items: itemsWithProducts,
                total_amount: parseFloat(order.total_amount),
                shipping_cost: parseFloat(order.shipping_cost),
                original_shipping_cost: parseFloat(order.original_shipping_cost || order.shipping_cost),
                discount: parseFloat(order.discount),
                expires_at: order.expires_at, // Ensure explicit mapping if needed, though ...orderJson might cover it
            };
        }));



        res.json(formattedOrders);
    } catch (err: any) {
        console.error("❌ Error getOrders:", err);
        res.status(500).json({ message: "Gagal mengambil orders", error: err.message });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    const t = await db.transaction();
    try {
        const { id } = req.params;
        const { status, note } = req.body;

        const order = await Orders.findByPk(id as string, { transaction: t });
        if (!order) {
            await t.rollback();
            return res.status(404).json({ message: "Order tidak ditemukan" });
        }

        order.status = status as any;
        await order.save({ transaction: t });

        await OrderStatusHistory.create({
            order_id: order.id,
            status,
            note: note || null,
        }, { transaction: t });

        await t.commit();
        res.json({ message: `Status order berhasil diupdate ke "${status}"` });
    } catch (err: any) {
        await t.rollback();
        console.error("❌ Gagal update status order:", err);
        res.status(500).json({ message: "Gagal update status order", error: err.message });
    }
};

export const updateOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { address_id, courier, shipping_service, shipping_cost, original_shipping_cost, discount, total_amount } = req.body;

        const order = await Orders.findByPk(id as string);
        if (!order) {
            return res.status(404).json({ message: "Order tidak ditemukan" });
        }

        // Update order fields
        if (address_id !== undefined) order.address_id = address_id;
        if (courier !== undefined) order.courier = courier;
        if (shipping_service !== undefined) (order as any).shipping_service = shipping_service;
        if (shipping_cost !== undefined) order.shipping_cost = parseFloat(shipping_cost);
        if (original_shipping_cost !== undefined) order.original_shipping_cost = parseFloat(original_shipping_cost);
        if (discount !== undefined) order.discount = parseFloat(discount);
        if (total_amount !== undefined) order.total_amount = parseFloat(total_amount);

        await order.save();

        res.json({
            message: "Order berhasil diupdate",
            order: order.toJSON()
        });
    } catch (err: any) {
        console.error("❌ Error updateOrder:", err);
        res.status(500).json({ message: "Gagal update order", error: err.message });
    }
};

export const getOrderDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const order = await Orders.findByPk(id as string, {
            include: [
                { model: Users, as: "user", attributes: ["id", "name", "email"] },
                { model: Address, as: "address" },
                {
                    model: OrderItems,
                    as: "items",
                    include: [
                        {
                            model: Products,
                            as: "product",
                            attributes: ["id", "name", "slug", "front_image", "type", "weight_gr"]
                        },
                        {
                            model: ProductVariants,
                            as: "variant",
                            attributes: ["id", "variant_name"]
                        }
                    ]
                },
                { model: OrderStatusHistory, as: "order_status_history", order: [["created_at", "DESC"]] },
            ],
        });
        // ...

        if (!order) {
            return res.status(404).json({ message: "Order tidak ditemukan" });
        }

        // Proactive Status Check for Pending Orders (Sync with DOKU)
        if (order.status === "pending") {
            try {
                const transaction = await Transaction.findOne({ where: { order_id: order.id } });
                if (transaction && transaction.invoice_number) {
                    const status = await DokuService.checkTransactionStatus(transaction.invoice_number);
                    if (status === "SUCCESS") {
                        // Update Transaction
                        transaction.status = "success";
                        await transaction.save();

                        // Update Order
                        order.status = "paid"; // Will be saved below if needed, or explicitly here
                        await order.save();

                    } else if (status === "FAILED" || status === "EXPIRED") {
                        transaction.status = "failed"; // or expired
                        await transaction.save();
                        // We might want to cancel the order immediately?
                        // order.status = "cancelled";
                        // await order.save();
                    }
                }
            } catch (checkErr) {
                console.error("⚠️ Failed to check DOKU status:", checkErr);
            }
        }

        // Auto-cancel if pending and expired
        if (order.status === "pending") {
            const now = new Date();
            let isExpired = false;

            if (order.expires_at) {
                isExpired = now > new Date(order.expires_at);
            } else {
                // Fallback logic if no expires_at set (legacy orders) -> 24 hours
                const created = new Date(order.created_at).getTime();
                const diffHours = (now.getTime() - created) / 1000 / 60 / 60;
                if (diffHours > 24) {
                    isExpired = true;
                }
            }

            if (isExpired) {
                order.status = "cancelled"; // or expired
                await order.save();

                await OrderStatusHistory.create({
                    order_id: order.id,
                    status: "expired",
                    note: "Order expired (auto-cancel)",
                });


            }
        }

        // Enrich order items with review data
        const orderJson = order.toJSON() as any;
        const userId = orderJson.user?.id;



        if (orderJson.items && userId) {
            for (const item of orderJson.items) {


                const existingReview = await Reviews.findOne({
                    where: {
                        user_id: userId,
                        product_id: item.product_id,
                        order_id: order.id,
                        variant_id: item.variant_id || null
                    }
                });

                if (existingReview) {
                    const reviewJson = existingReview.toJSON() as any;
                    let images: string[] = [];
                    try { images = JSON.parse(reviewJson.images || "[]"); } catch (e) { }

                    item.review = {
                        id: reviewJson.id,
                        rating: reviewJson.rating,
                        comment: reviewJson.comment,
                        images: images,
                        created_at: reviewJson.created_at
                    };

                }
            }
        }

        const responseData = {
            ...orderJson,
            shipping_cost: parseFloat(order.shipping_cost as any),
            original_shipping_cost: parseFloat(order.original_shipping_cost as any || order.shipping_cost as any),
            discount: parseFloat(order.discount as any),
            total_amount: parseFloat(order.total_amount as any),
        };

        // Prevent caching to ensure fresh review data
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.json(responseData);
    } catch (err: any) {
        console.error("❌ Error getOrderDetails:", err);
        res.status(500).json({ message: "Gagal mengambil detail order", error: err.message });
    }
};

export const shipOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { tracking_number } = req.body;

        if (!tracking_number) {
            return res.status(400).json({ message: "Nomor Resi wajib diisi" });
        }

        const order = await Orders.findByPk(id as string);
        if (!order) {
            return res.status(404).json({ message: "Order tidak ditemukan" });
        }

        // if (order.status !== 'paid' && order.status !== 'processed') ... allow flexibility

        order.status = "shipped";
        order.tracking_number = tracking_number;
        await order.save();

        await OrderStatusHistory.create({
            order_id: order.id,
            status: "shipped",
            note: `Pesanan dikirim. Resi: ${tracking_number}`,
        });

        // 3. Order Shipped Notification
        await NotificationService.createNotification({
            user_id: order.user_id,
            title: "🚚 Paket Sedang Dikirim",
            message: `Pesanan #${order.id} sedang dalam perjalanan. Resi: ${tracking_number}`,
            type: "info",
            category: "transaction",
            status: "ongoing",
            actionUrl: `/orders/${order.id}`,
            metadata: { order_id: order.id, tracking_number }
        });

        res.json({
            message: "Order berhasil dikirim (Shipped)",
            order: order.toJSON()
        });
    } catch (err: any) {
        console.error("❌ Error shipOrder:", err);
        res.status(500).json({ message: "Gagal update status pengiriman", error: err.message });
    }
};

export const completeOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const order = await Orders.findByPk(id as string);

        if (!order) {
            return res.status(404).json({ message: "Order tidak ditemukan" });
        }

        order.status = "delivered";
        await order.save();

        await OrderStatusHistory.create({
            order_id: order.id,
            status: "delivered",
            note: "Pesanan diterima oleh pelanggan",
        });

        // 4. Order Delivered (Completed) Notification
        await NotificationService.createNotification({
            user_id: order.user_id,
            title: "✅ Pesanan Telah Diterima",
            message: `Terima kasih! Pesanan #${order.id} telah selesai. Jangan lupa beri ulasan ya!`,
            type: "success",
            category: "transaction",
            status: "completed",
            actionUrl: `/orders/${order.id}`,
            metadata: { order_id: order.id }
        });

        res.json({ message: "Pesanan selesai (Diterima)" });

    } catch (err: any) {
        console.error("❌ Error completeOrder:", err);
        res.status(500).json({ message: "Gagal menyelesaikan pesanan", error: err.message });
    }
};

