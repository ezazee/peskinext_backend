import express from "express";
import * as PostController from "../controllers/PostController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Content & Support
 *   description: Artikel blog, FAQ, Banner, Data Wilayah, dan Pengaturan Sistem.
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Ambil Semua Artikel (Blog)
 *     description: Mengambil daftar semua artikel blog yang sudah dipublikasikan di website.
 *     tags: [Content & Support]
 *     responses:
 *       200:
 *         description: Daftar artikel berhasil diambil.
 */
router.get("/posts", PostController.getAllPosts);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Detail Artikel by ID
 *     description: Mengambil isi lengkap sebuah artikel berdasarkan ID uniknya.
 *     tags: [Content & Support]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Data artikel berhasil ditemukan.
 */
router.get("/posts/:id", PostController.getPostById);

/**
 * @swagger
 * /posts/slug/{slug}:
 *   get:
 *     summary: Detail Artikel by Slug
 *     description: Mengambil isi lengkap sebuah artikel berdasarkan slug (URL-friendly name). Digunakan oleh website storefront.
 *     tags: [Content & Support]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data artikel berhasil ditemukan.
 */
router.get("/posts/slug/:slug", PostController.getPostBySlug);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Buat Artikel Baru (Admin)
 *     description: Administrator dapat mempublikasikan artikel blog baru.
 *     tags: [Content & Support]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title: { type: string }
 *               content: { type: string, description: "Isi artikel dalam format HTML atau string." }
 *               image_url: { type: string, description: "URL gambar utama artikel." }
 *               category_id: { type: integer }
 *               author_id: { type: integer }
 *     responses:
 *       201:
 *         description: Artikel berhasil dibuat.
 */
router.post("/posts", PostController.createPost);

/**
 * @swagger
 * /posts/{id}:
 *   patch:
 *     summary: Perbarui Artikel (Admin)
 *     description: Mengubah isi atau judul artikel yang sudah ada.
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
 *         description: Artikel berhasil diperbarui.
 */
router.patch("/posts/:id", PostController.updatePost);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Hapus Artikel (Admin)
 *     description: Menghapus artikel blog dari sistem.
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
 *         description: Artikel berhasil dihapus.
 */
router.delete("/posts/:id", PostController.deletePost);

export default router;
