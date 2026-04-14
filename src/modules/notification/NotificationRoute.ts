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

/**
 * @swagger
 * tags:
 *   name: Content & Support
 *   description: Artikel blog, FAQ, Banner, Data Wilayah, Notifikasi, dan Pengaturan Sistem.
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Daftar Notifikasi Saya
 *     description: Mengambil semua pesan notifikasi masuk (tentang pesanan, promo, dll) untuk pengguna yang sedang login.
 *     tags: [Content & Support]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar notifikasi berhasil diambil.
 */
router.get("/", requireUserAuth(), getNotifications);

/**
 * @swagger
 * /notifications/unread:
 *   get:
 *     summary: Jumlah Notifikasi Belum Dibaca
 *     description: Mengambil angka total notifikasi yang masih berstatus 'unread'. Digunakan untuk badge lonceng di UI.
 *     tags: [Content & Support]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan jumlah pesan yang belum dibaca.
 */
router.get("/unread", requireUserAuth(), getUnreadCount);

/**
 * @swagger
 * /notifications/read-all:
 *   put:
 *     summary: Baca Semua Notifikasi
 *     description: Mengubah status semua notifikasi milik pengguna menjadi 'read' (sudah dibaca).
 *     tags: [Content & Support]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Semua notifikasi berhasil ditandai sudah dibaca.
 */
router.use("/read-all", requireUserAuth()); // Ensure auth middleware for remaining
router.put("/read-all", markAllAsRead);

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     summary: Tandai Satu Notifikasi Sudah Dibaca
 *     description: Mengubah status satu pesan notifikasi spesifik menjadi 'read'.
 *     tags: [Content & Support]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Notifikasi berhasil ditandai sudah dibaca.
 */
router.put("/:id/read", markAsRead);

/**
 * @swagger
 * /notifications/seed-test:
 *   post:
 *     summary: Buat Notifikasi Percobaan (Testing)
 *     description: Mengisi data notifikasi palsu untuk keperluan pengujian tampilan di frontend.
 *     tags: [Content & Support]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Data percobaan berhasil dibuat.
 */
router.post("/seed-test", seedTestNotifications);

export default router;
