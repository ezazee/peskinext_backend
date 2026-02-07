import { Request, Response } from "express";
import Orders from "./models/OrderModel";
import OrderItems from "./models/OrderItemModel";
import OrderStatusHistory from "./models/OrderStatusHistoryModel";
import Cart from "../cart/models/CartModel";
import Products from "../product/models/ProductModel";
import Address from "../user/models/AddressModel";
import db from "../../config/database";

export const createOrder = async (req: Request, res: Response) => {
    const t = await db.transaction();
    try {
        const { user_id, address_id, courier, shipping_cost, coupon_id, items } = req.body;

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
                discount,
                courier: courier || "pending", // Temporary value
                status: "pending"
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

        // Manually fetch product data for each order item
        const formattedOrders = await Promise.all(orders.map(async (order: any) => {
            const orderJson = order.toJSON();

            // Fetch product data for each item
            const itemsWithProducts = await Promise.all(orderJson.items.map(async (item: any) => {
                const product = await Products.findByPk(item.product_id, {
                    attributes: ['id', 'name', 'slug', 'front_image', 'type', 'weight_gr']
                });
                return {
                    ...item,
                    product: product ? product.toJSON() : null
                };
            }));

            return {
                ...orderJson,
                items: itemsWithProducts,
                total_amount: parseFloat(order.total_amount),
                shipping_cost: parseFloat(order.shipping_cost),
                discount: parseFloat(order.discount),
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
        const { address_id, courier, shipping_service, shipping_cost, total_amount } = req.body;

        const order = await Orders.findByPk(id as string);
        if (!order) {
            return res.status(404).json({ message: "Order tidak ditemukan" });
        }

        // Update order fields
        if (address_id !== undefined) order.address_id = address_id;
        if (courier !== undefined) order.courier = courier;
        if (shipping_service !== undefined) (order as any).shipping_service = shipping_service;
        if (shipping_cost !== undefined) order.shipping_cost = parseFloat(shipping_cost);
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
            include: [{
                model: OrderItems,
                as: "items"
            }]
        });

        if (!order) {
            return res.status(404).json({ message: "Order tidak ditemukan" });
        }

        // Auto-cancel if pending and expired (e.g., > 60 minutes)
        if (order.status === "pending") {
            const created = new Date(order.created_at).getTime();
            const now = new Date().getTime();
            const diffMinutes = (now - created) / 1000 / 60;

            if (diffMinutes > 60) {
                order.status = "cancelled";
                await order.save();

                await OrderStatusHistory.create({
                    order_id: order.id,
                    status: "cancelled",
                    note: "Order expired (auto-cancel)",
                });

                console.log(`⚠️ Order ${order.id} auto-cancelled (expired)`);
            }
        }

        res.json(order);
    } catch (err: any) {
        console.error("❌ Error getOrderDetails:", err);
        res.status(500).json({ message: "Gagal mengambil detail order", error: err.message });
    }
};

