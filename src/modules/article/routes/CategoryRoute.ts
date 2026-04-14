import express from "express";
import * as CategoryController from "../controllers/CategoryController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Content & Support
 *   description: Artikel blog, FAQ, Banner, Data Wilayah, dan Pengaturan Sistem.
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Ambil Semua Kategori Artikel
 *     description: "Mengambil daftar semua kategori blog yang tersedia (misal: Skincare, Lifestyle, Promo)."
 *     tags: [Content & Support]
 *     responses:
 *       200:
 *         description: Daftar kategori berhasil diambil.
 */
router.get("/categories", CategoryController.getCategories);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Buat Kategori Baru (Admin)
 *     description: Menambahkan kategori artikel blog baru ke dalam sistem.
 *     tags: [Content & Support]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Tips Kecantikan"
 *     responses:
 *       201:
 *         description: Kategori berhasil dibuat.
 */
router.post("/categories", CategoryController.createCategory);

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Perbarui Kategori (Admin)
 *     description: Mengubah nama kategori artikel yang sudah ada.
 *     tags: [Content & Support]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kategori berhasil diperbarui.
 */
router.patch("/categories/:id", CategoryController.updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Hapus Kategori (Admin)
 *     description: Menghapus kategori artikel blog. Pastikan tidak ada artikel yang terhubung ke kategori ini sebelum menghapus.
 *     tags: [Content & Support]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kategori berhasil dihapus.
 */
router.delete("/categories/:id", CategoryController.deleteCategory);

export default router;
