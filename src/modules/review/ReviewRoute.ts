import express from "express";
import * as ReviewController from "./ReviewController";
import { requireUserAuth, requireAdminAuth } from "../../middlewares/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Product - Storefront
 *   description: Akses data produk, promo, dan ulasan (review) untuk pembeli.
 */

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Ambil Ulasan Produk (Storefront)
 *     description: Mengambil daftar ulasan dan penilaian (rating) berdasarkan slug produk.
 *     tags: [Product - Storefront]
 *     parameters:
 *       - in: query
 *         name: slug
 *         schema: { type: string }
 *         required: true
 *         description: "Slug/URL produk (misal: 'serum-anti-aging')"
 *     responses:
 *       200:
 *         description: Daftar ulasan berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   user: { type: string, description: "Nama reviewer" }
 *                   variant: { type: string }
 *                   rating: { type: number, example: 5 }
 *                   comment: { type: string }
 *                   images: { type: array, items: { type: string }, description: "Array URL gambar lampiran" }
 *                   date: { type: string, format: date-time }
 */
router.get("/reviews", ReviewController.getReviews);

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Beri Ulasan Baru (Pelanggan)
 *     description: Menambahkan ulasan dan rating untuk produk yang sudah dibeli oleh pelanggan.
 *     tags: [Product - Storefront]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productSlug, rating, comment]
 *             properties:
 *               productSlug: { type: string }
 *               variantName: { type: string, description: "Opsional jika produk memiliki varian" }
 *               rating: { type: number, minimum: 1, maximum: 5, example: 5 }
 *               comment: { type: string }
 *               images: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Ulasan berhasil dibuat.
 */
router.post("/reviews", requireUserAuth(), ReviewController.createReview);

/**
 * @swagger
 * /admin/reviews:
 *   get:
 *     summary: Daftar Semua Ulasan (Admin)
 *     description: Mengambil seluruh ulasan dari semua produk untuk keperluan moderasi.
 *     tags: [Product - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar seluruh ulasan pelanggan.
 */
router.get("/admin/reviews", requireAdminAuth(), ReviewController.getAllReviews);

/**
 * @swagger
 * /admin/reviews:
 *   post:
 *     summary: Buat Ulasan Manual (Admin)
 *     description: "Administrator dapat memasukkan ulasan secara manual ke dalam sistem (misal: import dari marketplace lain)."
 *     tags: [Product - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Ulasan berhasil ditambahkan.
 */
router.post("/admin/reviews", requireAdminAuth(), ReviewController.createReviewByAdmin);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Hapus Ulasan (Admin)
 *     description: Menghapus ulasan yang melanggar aturan atau spam.
 *     tags: [Product - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Ulasan berhasil dihapus.
 */
router.delete("/reviews/:id", requireAdminAuth(), ReviewController.deleteReview);

export default router;
