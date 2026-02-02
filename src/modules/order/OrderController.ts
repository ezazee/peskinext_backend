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
        const { user_id, courier, shipping_cost, coupon_id } = req.body;

        const address = await Address.findOne({ where: { user_id, is_default: "yes" } });
        if (!address) {
            await t.rollback();
            return res.status(400).json({ message: "Alamat default tidak ditemukan" });
        }

        const cartItems = await Cart.findAll({
            where: { user_id },
            include: [{ model: Products, as: "product" }],
        });
        if (!cartItems.length) {
            await t.rollback();
            return res.status(400).json({ message: "Cart kosong" });
        }

        let subtotal = 0;
        cartItems.forEach((item: any) => {
            const price = parseFloat(item.product?.price || 0);
            subtotal += price * item.quantity;
        });

        let discount = 0;
        if (coupon_id) {
            discount = 0; // Implement logic if needed
        }

        const totalAmount = subtotal + parseFloat(shipping_cost || 0) - discount;

        const order = await Orders.create({
            user_id,
            address_id: address.id,
            status: "pending",
            total_amount: totalAmount,
            shipping_cost,
            discount,
            courier,
        }, { transaction: t });

        const orderItems = cartItems.map((item: any) => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.product?.price,
        }));
        await OrderItems.bulkCreate(orderItems, { transaction: t });

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
            where: { user_id },
            include: [{ model: OrderItems, as: "items" }],
        });
        const formattedOrders = orders.map((order: any) => ({
            ...order.toJSON(),
            total_amount: parseFloat(order.total_amount),
            shipping_cost: parseFloat(order.shipping_cost),
            discount: parseFloat(order.discount),
        }));
        res.json(formattedOrders);
    } catch (err: any) {
        res.status(500).json({ message: "Gagal mengambil orders", error: err.message });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    const t = await db.transaction();
    try {
        const { id } = req.params;
        const { status, note } = req.body;

        const order = await Orders.findByPk(id, { transaction: t });
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
