import express from "express";
import * as SettingController from "./SettingController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Content & Support
 *   description: Artikel blog, FAQ, Banner, Data Wilayah, dan Pengaturan Sistem.
 */

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Ambil Pengaturan Umum
 *     description: Mengambil data konfigurasi website seperti Nama Brand, Logo, Alamat Toko, Email Support, dan Nomor WhatsApp.
 *     tags: [Content & Support]
 *     responses:
 *       200:
 *         description: Pengaturan berhasil diambil.
 */
router.get("/settings", SettingController.getSettings);

/**
 * @swagger
 * /settings:
 *   patch:
 *     summary: Update Pengaturan (Admin)
 *     description: Mengubah konfigurasi sistem atau informasi brand (Khusus Admin).
 *     tags: [Content & Support]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brand_name: { type: string }
 *               contact_email: { type: string }
 *               whatsapp_number: { type: string }
 *     responses:
 *       200:
 *         description: Pengaturan berhasil diperbarui.
 */
router.patch("/settings", SettingController.updateSettings);

/**
 * @swagger
 * /settings/seed:
 *   post:
 *     summary: Reset Pengaturan ke Default (Admin)
 *     description: Menghapus pengaturan saat ini dan mengembalikannya ke nilai awal (seed) pabrikan.
 *     tags: [Content & Support]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pengaturan berhasil di-reset.
 */
router.post("/settings/seed", SettingController.seedSettings);

export default router;
