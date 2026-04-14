import express from "express";
import * as BannerController from "./BannerController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Content & Support
 *   description: Artikel blog, FAQ, Banner, Data Wilayah, Notifikasi, dan Pengaturan Sistem.
 */

/**
 * @swagger
 * /banners:
 *   get:
 *     summary: Ambil Semua Banner Storefront
 *     description: Mengambil daftar semua banner aktif yang dikelompokkan berdasarkan bagian (Main Hero, Carousel, dan Tiles).
 *     tags: [Content & Support]
 *     responses:
 *       200:
 *         description: Daftar banner berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 main:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer }
 *                       src: { type: string, description: "URL Gambar Desktop" }
 *                       mobileSrc: { type: string, description: "URL Gambar Mobile" }
 *                       alt: { type: string }
 *                       redirect: { type: string }
 *                 carousel:
 *                   type: array
 *                   items:
 *                     type: object
 *                 tiles:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get("/banners", BannerController.getBanners);

/**
 * @swagger
 * /banners:
 *   post:
 *     summary: Buat Banner Baru (Admin)
 *     description: Administrator menambahkan gambar banner baru untuk promosi di halaman depan.
 *     tags: [Content & Support]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [section, image_url, alt_text]
 *             properties:
 *               section:
 *                 type: string
 *                 enum: [main, carousel, tiles]
 *               image_url: { type: string }
 *               alt_text: { type: string }
 *               sort_order: { type: integer }
 *               redirect_url: { type: string, description: "Link tujuan saat banner diklik." }
 *               is_active: { type: boolean }
 *     responses:
 *       201:
 *         description: Banner berhasil dibuat.
 */
router.post("/banners", BannerController.createBanner);

/**
 * @swagger
 * /banners/{id}:
 *   delete:
 *     summary: Hapus Banner (Admin)
 *     description: Menghapus banner tertentu dari website.
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
 *         description: Banner berhasil dihapus.
 */
router.delete("/banners/:id", BannerController.deleteBanner);

/**
 * @swagger
 * /banners/seed-popup:
 *   get:
 *     summary: Inisialisasi Banner Popup (Testing)
 *     description: Menambahkan data banner popup percobaan ke dalam sistem.
 *     tags: [Content & Support]
 *     responses:
 *       200:
 *         description: Data popup berhasil di-seed.
 */
router.get("/banners/seed-popup", BannerController.seedPopup);

export default router;
