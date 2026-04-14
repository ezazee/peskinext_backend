import express from "express";
import * as TagController from "../controllers/TagController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Content & Support
 *   description: Artikel blog, FAQ, Banner, Data Wilayah, dan Pengaturan Sistem.
 */

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Ambil Semua Tag Artikel
 *     description: "Mengambil daftar semua label/tag yang digunakan untuk mengelompokkan artikel blog (misal: #skincare, #tips, #promo)."
 *     tags: [Content & Support]
 *     responses:
 *       200:
 *         description: Daftar tag berhasil diambil.
 */
router.get("/tags", TagController.getTags);

/**
 * @swagger
 * /tags/{id}:
 *   get:
 *     summary: Detail Tag by ID
 *     description: Mengambil informasi sebuah tag berdasarkan ID uniknya.
 *     tags: [Content & Support]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Data tag berhasil ditemukan.
 */
router.get("/tags/:id", TagController.getTagById);

/**
 * @swagger
 * /tags/{id}:
 *   patch:
 *     summary: Perbarui Tag (Admin)
 *     description: Mengubah nama atau slug dari sebuah tag yang sudah ada.
 *     tags: [Content & Support]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tag berhasil diperbarui.
 */
router.patch("/tags/:id", TagController.updateTag);

/**
 * @swagger
 * /tags/{id}:
 *   delete:
 *     summary: Hapus Tag (Admin)
 *     description: Menghapus label/tag dari sistem secara permanen.
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
 *         description: Tag berhasil dihapus.
 */
router.delete("/tags/:id", TagController.deleteTag);

export default router;
