import Notification from "./models/NotificationModel";

interface CreateNotificationParams {
    user_id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    category: "transaction" | "promo" | "system";
    status?: "pending_payment" | "completed" | "ongoing" | "cancelled"; // Add status for filtering
    actionUrl?: string; // Optional action URL
    metadata?: any;
}

export const createNotification = async (params: CreateNotificationParams) => {
    try {
        const notification = await Notification.create({
            user_id: params.user_id,
            title: params.title,
            message: params.message,
            type: params.type,
            category: params.category,
            is_read: false,
            metadata: {
                ...params.metadata,
                status: params.status, // Save status in metadata
                actionUrl: params.actionUrl
            }
        });
        return notification;
    } catch (error) {
        console.error("❌ Failed to create notification:", error);
        // Don't throw error to avoid breaking main transaction flow
        return null;
    }
};
