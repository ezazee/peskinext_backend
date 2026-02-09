import express from "express";
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    seedTestNotifications
} from "./NotificationController";
import { requireUserAuth } from "../../middlewares/authMiddleware";

const router = express.Router();

router.get("/", requireUserAuth(), getNotifications);
router.get("/unread", requireUserAuth(), getUnreadCount);
router.put("/read-all", requireUserAuth(), markAllAsRead);
router.put("/:id/read", requireUserAuth(), markAsRead);

// 🧪 Testing endpoint - seed dummy notifications
router.post("/seed-test", requireUserAuth(), seedTestNotifications);

export default router;
