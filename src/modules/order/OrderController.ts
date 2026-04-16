import { Request, Response } from "express";
import { Op } from "sequelize";
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
import { deductStockForOrder, restoreStockForOrder, incrementSoldCount } from "../product/ProductService";
import * as CouponService from "../coupon/CouponService";

export const createOrder = async (req: Request, res: Response) => {
    const t = await db.transaction();
    try {
        const { user_id, address_id, courier, courier_service, shipping_cost, coupon_id, items } = req.body;

        let finalAddressId = address_id;
        if (!finalAddressId || finalAddressId === "temp") {
            const address = await Address.findOne({ where: { user_id, is_default: "yes" } });
            if (address) {
                finalAddressId = address.id;
            } else {
                finalAddressId = "00000000-0000-0000-0000-000000000000";
            }
        }

        let orderItemsData: any[] = [];
        let grandTotalCalc = 0;

        if (items && Array.isArray(items) && items.length > 0) {
            orderItemsData = items.map((item: any) => ({
                product_id: item.product_id,
                quantity: item.quantity || item.qty,
                price: item.price,
                variant_id: item.variant_id || null
            }));

            items.forEach((item: any) => {
                const qty = item.quantity || item.qty || 1;
                grandTotalCalc += item.price * qty;
            });

        } else {
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
                };
            });

            await Cart.destroy({ where: { user_id }, transaction: t });
        }

        let discount = 0;
        let validatedCouponId: string | undefined = undefined;

        if (coupon_id) {
            try {
                // Get region for coupon validation
                let regionTag = "";
                const address = await Address.findByPk(finalAddressId);
                if (address) {
                    regionTag = address.regencies || "";
                }

                const couponCheck = await CouponService.checkCoupon(coupon_id, grandTotalCalc, regionTag);
                if (couponCheck.valid) {
                    discount = couponCheck.discount;
                    validatedCouponId = coupon_id;
                }
            } catch (couponErr: any) {
                console.warn(`⚠️ Coupon validation failed: ${couponErr.message}`);
                // Continue without discount if coupon invalid? 
                // Alternatively, return error if user explicitly provided coupon but it's invalid.
                // For now, let's allow return error to inform user.
                await t.rollback();
                return res.status(400).json({ message: `Kupon tidak valid: ${couponErr.message}` });
            }
        }

        const totalAmount = grandTotalCalc + parseFloat(shipping_cost || 0) - discount;

        const order = await Orders.create(
            {
                user_id,
                address_id: finalAddressId,
                total_amount: totalAmount,
                shipping_cost: parseFloat(shipping_cost || 0),
                original_shipping_cost: parseFloat(shipping_cost || 0),
                discount,
                coupon_id: validatedCouponId,
                courier: courier || "pending",
                courier_service: courier_service || undefined,
                status: "pending",
                expires_at: new Date(Date.now() + 30 * 60 * 1000)
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

        // Increment coupon usage if applied
        if (validatedCouponId) {
            try {
                await CouponService.useCoupon(validatedCouponId, t);
            } catch (couponErr) {
                console.error(`⚠️ Non-fatal error incrementing coupon ${validatedCouponId}:`, couponErr);
                // We don't throw error here to avoid breaking the whole checkout process.
            }
        }

        await t.commit();
        res.status(201).json({
            message: "Order berhasil dibuat",
            order_id: order.id,
            total: totalAmount,
            shipping_cost,
            courier,
            expires_at: order.expires_at
        });

    } catch (err: any) {
        if (t) await t.rollback();
        console.error("❌ Error createOrder:", err);
        res.status(500).json({ message: "Gagal membuat order", error: err.message });
    }
};

export const getOrders = async (req: Request, res: Response) => {
    try {
        const { user_id } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const { count, rows: orders } = await Orders.findAndCountAll({
            where: { user_id: user_id as string },
            include: [{
                model: OrderItems,
                as: "items"
            }],
            order: [["created_at", "DESC"]],
            limit,
            offset
        });

        for (const order of orders) {
            if (order.status === "pending") {
                try {
                    const transaction = await Transaction.findOne({ where: { order_id: order.id } });
                    if (transaction && transaction.invoice_number) {
                        const status = await DokuService.checkTransactionStatus(transaction.invoice_number);
                        if (status === "SUCCESS") {
                            const transactionDB = await db.transaction();
                            try {
                                order.status = "paid";
                                transaction.status = "success";
                                await order.save({ transaction: transactionDB });
                                await transaction.save({ transaction: transactionDB });
                                const items = await OrderItems.findAll({ where: { order_id: order.id }, transaction: transactionDB });
                                const itemData = items.map(item => ({ product_id: item.product_id, variant_id: item.variant_id, quantity: item.quantity }));
                                await deductStockForOrder(itemData, transactionDB);
                                await incrementSoldCount(itemData, transactionDB);
                                await transactionDB.commit();
                            } catch (e) {
                                await transactionDB.rollback();
                                console.error("⚠️ Failed sync deduct stock in getOrders:", e);
                            }
                        }
                    }
                } catch (e) {
                    console.error("⚠️ Failed sync in getOrders:", e);
                }
            }
        }

        const formattedOrders = await Promise.all(orders.map(async (order: any) => {
            const orderJson = order.toJSON();
            const itemsWithProducts = await Promise.all(orderJson.items.map(async (item: any) => {
                const product = await Products.findByPk(item.product_id, {
                    attributes: ['id', 'name', 'slug', 'front_image', 'type', 'weight_gr']
                });

                let variant: any = null;
                if (item.variant_id) { variant = await ProductVariants.findByPk(item.variant_id); }

                const existingReview = await Reviews.findOne({
                    where: { user_id: user_id, product_id: item.product_id, order_id: order.id, variant_id: item.variant_id || null }
                });

                let reviewData: any = null;
                if (existingReview) {
                    const reviewJson = existingReview.toJSON() as any;
                    let images: string[] = [];
                    try { images = JSON.parse(reviewJson.images || "[]"); } catch (e) { }
                    reviewData = { id: reviewJson.id, rating: reviewJson.rating, comment: reviewJson.comment, images, created_at: reviewJson.created_at };
                }

                return { ...item, product: product ? product.toJSON() : null, variant: variant ? variant.toJSON() : null, review: reviewData };
            }));

            let invoiceNumber: string | null = null;
            const transaction = await Transaction.findOne({ where: { order_id: order.id } });
            if (transaction) {
                invoiceNumber = transaction.invoice_number;
            } else {
                const dateStr = new Date(order.created_at).toISOString().slice(0, 10).replace(/-/g, "");
                const shortId = order.id.split("-")[0].toUpperCase();
                invoiceNumber = `INV/${dateStr}/${shortId}`;
            }

            return { ...orderJson, items: itemsWithProducts, invoiceNumber, total_amount: parseFloat(order.total_amount), shipping_cost: parseFloat(order.shipping_cost), discount: parseFloat(order.discount), expires_at: order.expires_at };
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
        if (!order) { await t.rollback(); return res.status(404).json({ message: "Order tidak ditemukan" }); }

        const previousStatus = order.status;
        order.status = status as any;
        await order.save({ transaction: t });
        await OrderStatusHistory.create({ order_id: order.id, status, note: note || null }, { transaction: t });

        if ((status === "paid" || status === "processing") && 
            (previousStatus === "pending" || previousStatus === "cancelled")) {
            const items = await OrderItems.findAll({ where: { order_id: order.id }, transaction: t });
            const itemData = items.map(item => ({ product_id: item.product_id, variant_id: item.variant_id, quantity: item.quantity }));
            await deductStockForOrder(itemData, t);
            await incrementSoldCount(itemData, t);
        } else if (status === "cancelled" && 
                   (previousStatus === "paid" || previousStatus === "processing" || previousStatus === "shipped" || previousStatus === "delivered" || previousStatus === "pending")) {
            const items = await OrderItems.findAll({ where: { order_id: order.id }, transaction: t });
            const itemData = items.map(item => ({ product_id: item.product_id, variant_id: item.variant_id, quantity: item.quantity }));
            await restoreStockForOrder(itemData, t);

            // Restore coupon usage if order is cancelled
            if (order.coupon_id) {
                const couponIds = order.coupon_id.split(",").filter(id => id.trim() !== "");
                for (const couponId of couponIds) {
                    await CouponService.restoreCoupon(couponId.trim(), t);
                }
            }
        }

        await t.commit();
        res.json({ message: `Status order berhasil diupdate ke "${status}"` });
    } catch (err: any) {
        if (t) await t.rollback();
        console.error("❌ Gagal update status order:", err);
        res.status(500).json({ message: "Gagal update status order", error: err.message });
    }
};

export const updateOrder = async (req: Request, res: Response) => {
    const t = await db.transaction();
    try {
        const { id } = req.params;
        const { address_id, courier, shipping_service, shipping_cost, original_shipping_cost, discount, total_amount, coupon_id } = req.body;
        
        const order = await Orders.findByPk(id as string, { transaction: t });
        if (!order) {
            await t.rollback();
            return res.status(404).json({ message: "Order tidak ditemukan" });
        }

        // Track if a coupon is being added for the first time
        const wasCouponSet = !!order.coupon_id;
        const isNewCouponBody = !!coupon_id;

        if (address_id !== undefined) order.address_id = address_id;
        if (courier !== undefined) order.courier = courier;
        if (shipping_service !== undefined) order.courier_service = shipping_service;
        if (shipping_cost !== undefined) order.shipping_cost = parseFloat(shipping_cost);
        if (original_shipping_cost !== undefined) order.original_shipping_cost = parseFloat(original_shipping_cost);
        if (discount !== undefined) order.discount = parseFloat(discount);
        if (total_amount !== undefined) order.total_amount = parseFloat(total_amount);
        
        if (coupon_id !== undefined) {
            order.coupon_id = coupon_id;
        }

        await order.save({ transaction: t });

        // If coupon(s) newly added during update, increment usage
        if (!wasCouponSet && isNewCouponBody) {
            const couponIds = coupon_id.split(",").filter((id: string) => id.trim() !== "");
            for (const singleId of couponIds) {
                try {
                    await CouponService.useCoupon(singleId.trim(), t);
                } catch (couponErr) {
                    console.error(`⚠️ Failed to increment coupon ${singleId} during update:`, couponErr);
                }
            }
        }

        await t.commit();
        res.json({ message: "Order berhasil diupdate", order: order.toJSON() });
    } catch (err: any) {
        if (t) await t.rollback();
        console.error("❌ Error updateOrder:", err);
        res.status(500).json({ message: "Gagal update order", error: err.message });
    }
};

export const getOrderDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const cleanId = id.replace(/ /g, '-').replace(/%20/g, '-');
        let whereClause: any = { id: cleanId };
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);

        if (!isUuid) {
            const tx = await Transaction.findOne({ where: { invoice_number: id } });
            if (tx) { whereClause = { id: tx.order_id }; }
            else { return res.status(404).json({ message: "Order tidak ditemukan (Invalid ID format)" }); }
        }

        const order = await Orders.findOne({
            where: whereClause,
            include: [
                { model: Users, as: "user", attributes: ["id", "name", "email"] },
                { model: Address, as: "address" },
                { model: OrderStatusHistory, as: "order_status_history" },
            ],
        });

        if (!order) return res.status(404).json({ message: "Order tidak ditemukan" });

        if (order.status === "pending") {
            try {
                const transaction = await Transaction.findOne({ where: { order_id: order.id } });
                if (transaction && transaction.invoice_number) {
                    const status = await DokuService.checkTransactionStatus(transaction.invoice_number);
                    if (status === "SUCCESS") {
                        const transactionDB = await db.transaction();
                        try {
                            transaction.status = "success"; await transaction.save({ transaction: transactionDB });
                            order.status = "paid"; await order.save({ transaction: transactionDB });
                            const items = await OrderItems.findAll({ where: { order_id: order.id }, transaction: transactionDB });
                            const itemData = items.map(item => ({ product_id: item.product_id, variant_id: item.variant_id, quantity: item.quantity }));
                            await deductStockForOrder(itemData, transactionDB);
                            await incrementSoldCount(itemData, transactionDB);
                            await transactionDB.commit();
                        } catch (e) {
                            await transactionDB.rollback();
                            console.error("⚠️ Failed sync deduct stock in getOrderDetails:", e);
                        }
                    }
                }
            } catch (checkErr) { console.error("⚠️ Failed to check DOKU status:", checkErr); }
        }

        // DEEP SQL FETCH for items to ensure consistency
        const rawItems: any = await db.query(
            `SELECT oi.*, p.name as product_name, p.type as product_type, p.front_image 
             FROM order_items oi 
             LEFT JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id = :orderId`,
            { replacements: { orderId: order.id }, type: (db as any).QueryTypes?.SELECT || "SELECT" }
        );

        const items = (Array.isArray(rawItems) ? rawItems : []).map((item: any) => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
            product: { id: item.product_id, name: item.product_name, type: item.product_type, front_image: item.front_image }
        }));

        const orderJson = order.toJSON() as any;
        let invoiceNumber: string | null = null;
        const transaction = await Transaction.findOne({ where: { order_id: order.id } });
        if (transaction) { invoiceNumber = transaction.invoice_number; }
        else {
            const dateStr = new Date(order.created_at).toISOString().slice(0, 10).replace(/-/g, "");
            const shortId = order.id.split("-")[0].toUpperCase();
            invoiceNumber = `INV/${dateStr}/${shortId}`;
        }

        let shippingAddress: any = null;
        const orderWithAddress = order as any;
        if (orderWithAddress.address) {
            shippingAddress = { recipient: orderWithAddress.address.recipient, phone: orderWithAddress.address.phone, addressLine: orderWithAddress.address.address, city: orderWithAddress.address.regencies, province: orderWithAddress.address.province, postalCode: orderWithAddress.address.postal_code };
        }

        res.json({ 
            ...orderJson, 
            items, 
            invoiceNumber, 
            shippingAddress, 
            biteship_order_id: order.biteship_order_id,
            tracking_number: order.tracking_number,
            shipping_cost: parseFloat(order.shipping_cost as any), 
            total_amount: parseFloat(order.total_amount as any) 
        });
    } catch (err: any) {
        console.error("❌ Error getOrderDetails:", err);
        res.status(500).json({ message: "Gagal mengambil detail order", error: err.message });
    }
};

export const shipOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { tracking_number } = req.body;
        if (!tracking_number) return res.status(400).json({ message: "Nomor Resi wajib diisi" });
        const order = await Orders.findByPk(id as string);
        if (!order) return res.status(404).json({ message: "Order tidak ditemukan" });

        order.status = "shipped";
        order.tracking_number = tracking_number;
        await order.save();
        await OrderStatusHistory.create({ order_id: order.id, status: "shipped", note: `Pesanan dikirim. Resi: ${tracking_number}` });
        await NotificationService.createNotification({ user_id: order.user_id, title: "🚚 Paket Sedang Dikirim", message: `Pesanan #${order.id} sedang dalam perjalanan. Resi: ${tracking_number}`, type: "info", category: "transaction", status: "ongoing", actionUrl: `/orders/${order.id}`, metadata: { order_id: order.id, tracking_number } });
        res.json({ message: "Order berhasil dikirim (Shipped)", order: order.toJSON() });
    } catch (err: any) {
        console.error("❌ Error shipOrder:", err);
        res.status(500).json({ message: "Gagal update status pengiriman", error: err.message });
    }
};

export const completeOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const order = await Orders.findByPk(id as string);
        if (!order) return res.status(404).json({ message: "Order tidak ditemukan" });
        order.status = "delivered";
        await order.save();
        await OrderStatusHistory.create({ order_id: order.id, status: "delivered", note: "Pesanan diterima oleh pelanggan" });
        await NotificationService.createNotification({ user_id: order.user_id, title: "✅ Pesanan Telah Diterima", message: `Terima kasih! Pesanan #${order.id} telah selesai. Jangan lupa beri ulasan ya!`, type: "success", category: "transaction", status: "completed", actionUrl: `/orders/${order.id}`, metadata: { order_id: order.id } });
        res.json({ message: "Pesanan selesai (Diterima)" });
    } catch (err: any) {
        console.error("❌ Error completeOrder:", err);
        res.status(500).json({ message: "Gagal menyelesaikan pesanan", error: err.message });
    }
};

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        res.setHeader('Cache-Control', 'no-store');

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const status = req.query.status as string;
        const searchQuery = req.query.q as string;
        const paymentMethod = req.query.payment_method as string;
        const dateFrom = req.query.date_from as string;
        const dateTo = req.query.date_to as string;

        // Build where clause for Orders
        const whereClause: any = {};
        if (status && status !== "all") {
            whereClause.status = status;
        }

        if (paymentMethod && paymentMethod !== "all") {
            whereClause.payment_method = paymentMethod;
        }

        if (dateFrom || dateTo) {
            whereClause.created_at = {};
            if (dateFrom) {
                whereClause.created_at[Op.gte] = new Date(dateFrom);
            }
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                whereClause.created_at[Op.lte] = toDate;
            }
        }

        // Build include options
        const includeOptions: any[] = [
            {
                model: Users,
                as: "user",
                attributes: ["id", "name", "email", "no_telp"],
            },
            {
                model: Address,
                as: "address",
            },
            {
                model: Transaction,
                as: "transactions",
                attributes: ["invoice_number", "status"],
            },
            {
                model: OrderItems,
                as: "items",
                include: [
                    {
                        model: Products,
                        as: "product",
                        attributes: ["id", "name", "type", "front_image", "sku"],
                    }
                ]
            }
        ];

        // Advanced Search (across multiple models)
        if (searchQuery) {
            whereClause[Op.or] = [
                // Search by Invoice Number (Transaction model)
                { '$transactions.invoice_number$': { [Op.iLike]: `%${searchQuery}%` } },
                // Search by Customer Name
                { '$user.name$': { [Op.iLike]: `%${searchQuery}%` } },
                // Search by Customer Email
                { '$user.email$': { [Op.iLike]: `%${searchQuery}%` } },
                // Search by Order ID (direct)
                { id: { [Op.iLike]: `%${searchQuery}%` } }
            ];
            // If searching in included models, we need to ensure they are joined properly
            // Sequelize might need 'required: false' or careful placement if using $ syntax
        }

        const { count, rows: orders } = await Orders.findAndCountAll({
            where: whereClause,
            include: includeOptions,
            limit: limit,
            offset: offset,
            order: [["created_at", "DESC"]],
            distinct: true, 
            subQuery: false 
        });

        // OPTIMIZED: Calculate aggregate stats using SQL aggregation instead of manual fetching
        const [statusStats, revenueStats] = await Promise.all([
            // Status counts
            Orders.findAll({
                where: whereClause,
                attributes: [
                    'status',
                    [db.fn('COUNT', db.col('id')), 'count']
                ],
                group: ['status'],
                raw: true
            }) as any,
            // Revenue stats
            Orders.findAll({
                attributes: [
                    [db.fn('SUM', db.col('total_amount')), 'grossRevenue'],
                    [db.fn('SUM', db.literal("CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END")), 'netRevenue']
                ],
                // Only count revenue for valid statuses
                // grossRevenue includes paid, processing, shipped, delivered
                where: {
                    ...whereClause,
                    status: ['paid', 'processing', 'shipped', 'delivered']
                },
                raw: true
            }) as any

        ]);

        // Format stats for dashboard
        const statusMap = statusStats.reduce((acc: any, curr: any) => {
            acc[curr.status] = parseInt(curr.count);
            return acc;
        }, {});

        const stats = {
            totalOrders: count,
            grossRevenue: parseFloat(revenueStats[0]?.grossRevenue || 0),
            netRevenue: parseFloat(revenueStats[0]?.netRevenue || 0),
            statusCounts: {
                pending: statusMap['pending'] || 0,
                paid: statusMap['paid'] || 0,
                processing: statusMap['processing'] || 0,
                shipped: statusMap['shipped'] || 0,
                delivered: statusMap['delivered'] || 0,
                cancelled: statusMap['cancelled'] || 0,
            }
        };


        const formattedOrders = orders.map((order: any) => {
            const orderJson = order.toJSON();
            const tx = orderJson.transactions && orderJson.transactions.length > 0 ? orderJson.transactions[0] : null;

            let invoiceNumber = tx?.invoice_number;
            if (!invoiceNumber) {
                const dateStr = new Date(order.created_at).toISOString().slice(0, 10).replace(/-/g, "");
                const shortId = order.id.split("-")[0].toUpperCase();
                invoiceNumber = `INV/${dateStr}/${shortId}`;
            }

            const items = (orderJson.items || []).map((item: any) => ({
                id: item.id,
                quantity: item.quantity,
                price: parseFloat(item.price),
                productName: item.product?.name || "Produk PE Skin",
                productType: item.product?.type || "single",
                productSku: item.product?.sku || "",
                product: item.product
            }));

            return {
                id: order.id,
                orderNumber: invoiceNumber,
                status: order.status,
                date: order.created_at,
                customerName: order.user?.name || "Guest",
                customerEmail: order.user?.email || "",
                customerPhone: order.user?.no_telp || order.address?.phone || "",
                customerAddress: order.address ? `${order.address.address}, ${order.address.regencies || ''}, ${order.address.province || ''}` : "",
                total_amount: parseFloat(order.total_amount),
                shipping_cost: parseFloat(order.shipping_cost),
                original_shipping_cost: parseFloat(order.original_shipping_cost || order.shipping_cost),
                discount: parseFloat(order.discount || 0),
                payment_method: (order as any).payment_method || "bank_transfer",
                biteship_order_id: order.biteship_order_id,
                tracking_number: order.tracking_number,
                items
            };
        });

        res.json({
            count,
            rows: formattedOrders,
            stats,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (err: any) {
        console.error("❌ Error in getAllOrders:", err);
        res.status(500).json({ message: "Gagal mengambil semua orders", error: err.message });
    }
};
