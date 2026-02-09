import { Request, Response } from "express";
import Notification from "./models/NotificationModel";
import { Op } from "sequelize";

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.sub; // From JWT middleware
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Notification.findAndCountAll({
            where: { user_id: userId },
            order: [["created_at", "DESC"]],
            limit,
            offset,
        });

        return res.status(200).json({
            success: true,
            data: rows,
            meta: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.sub;
        const count = await Notification.count({
            where: {
                user_id: userId,
                is_read: false,
            },
        });

        return res.status(200).json({
            success: true,
            data: { count },
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.sub;
        const notificationId = req.params.id;

        const notification = await Notification.findOne({
            where: { id: notificationId, user_id: userId },
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        await notification.update({ is_read: true });

        return res.status(200).json({ success: true, message: "Notification marked as read" });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.sub;

        await Notification.update(
            { is_read: true },
            {
                where: {
                    user_id: userId,
                    is_read: false,
                },
            }
        );

        return res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 🧪 Testing endpoint - create dummy notifications
export const seedTestNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.sub;

        const dummyNotifications = [
            {
                user_id: userId,
                title: "🎉 Pesanan Berhasil Dibuat!",
                message: "Pesanan #ORD-12345 telah dikonfirmasi dan sedang diproses oleh seller",
                type: "success" as const,
                category: "transaction" as const,
                is_read: false,
                metadata: { status: "completed" }
            },
            {
                user_id: userId,
                title: "🚚 Paket Sedang Dikirim",
                message: "Pesanan Anda #ORD-12344 sedang dalam perjalanan. Estimasi tiba: 2 hari",
                type: "info" as const,
                category: "transaction" as const,
                is_read: false,
                metadata: { status: "ongoing" }
            },
            {
                user_id: userId,
                title: "🎁 Promo Spesial Hari Ini!",
                message: "Dapatkan diskon hingga 50% untuk semua produk skincare. Buruan sebelum kehabisan!",
                type: "info" as const,
                category: "promo" as const,
                is_read: false,
                metadata: { status: "ongoing" } // Promo considered ongoing/active
            },
            {
                user_id: userId,
                title: "✅ Pesanan Telah Diterima",
                message: "Terima kasih sudah berbelanja! Jangan lupa beri review untuk produk Anda",
                type: "success" as const,
                category: "transaction" as const,
                is_read: true,
                metadata: { status: "completed" }
            },
            {
                user_id: userId,
                title: "⚠️ Pembayaran Pending",
                message: "Pesanan #ORD-12343 menunggu pembayaran. Silakan selesaikan dalam 24 jam",
                type: "warning" as const,
                category: "transaction" as const,
                is_read: false,
                metadata: { status: "pending_payment" }
            },
        ];

        await Notification.bulkCreate(dummyNotifications);

        return res.status(201).json({
            success: true,
            message: `${dummyNotifications.length} test notifications created successfully`,
            data: { count: dummyNotifications.length },
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

