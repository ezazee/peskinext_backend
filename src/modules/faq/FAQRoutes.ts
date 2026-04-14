import express from "express";
import FAQController from "./FAQController";
import { requireAdminAuth } from "../../middlewares/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Content & Support
 *   description: Artikel blog, FAQ, Banner, Data Wilayah, dan Pengaturan Sistem.
 */

/**
 * @swagger
 * /faqs:
 *   get:
 *     summary: Ambil Semua FAQ (Publik)
 *     description: Mengambil daftar semua Pertanyaan yang Sering Diajukan (FAQ) yang berstatus 'published' untuk ditampilkan di Halaman Bantuan Storefront.
 *     tags: [Content & Support]
 *     responses:
 *       200:
 *         description: Daftar FAQ berhasil diambil.
 */
router.get("/faqs", FAQController.getAll);

/**
 * @swagger
 * /admin/faqs:
 *   get:
 *     summary: Kelola Semua FAQ (Admin)
 *     description: Mengambil seluruh daftar FAQ termasuk yang masih berstatus draft (Khusus Admin).
 *     tags: [Content & Support]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar semua FAQ untuk manajemen konten.
 */
router.get("/admin/faqs", requireAdminAuth(), FAQController.getAllAdmin);

/**
 * @swagger
 * /faqs/{id}:
 *   get:
 *     summary: Detail Satu FAQ
 *     description: Mengambil detail informasi (pertanyaan, jawaban, kategori) dari satu FAQ berdasarkan ID.
 *     tags: [Content & Support]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Data FAQ ditemukan.
 */
router.get("/faqs/:id", FAQController.getOne);

/**
 * @swagger
 * /faqs:
 *   post:
 *     summary: Buat FAQ Baru (Admin)
 *     description: Menambahkan Tanya Jawab baru ke dalam sistem Help Hub.
 *     tags: [Content & Support]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question, answer, category]
 *             properties:
 *               question: { type: string, example: "Bagaimana cara melacak pesanan?" }
 *               answer: { type: string, example: "Anda bisa mengeceknya di halaman Profile > Pesanan." }
 *               category: { type: string, example: "Pengiriman" }
 *               order: { type: number, description: "Urutan tampilan" }
 *               status: { type: string, enum: [published, draft] }
 *     responses:
 *       201:
 *         description: FAQ berhasil dibuat.
 */
router.post("/faqs", requireAdminAuth(), FAQController.create);

/**
 * @swagger
 * /faqs/{id}:
 *   put:
 *     summary: Perbarui FAQ (Admin)
 *     description: Mengubah isi pertanyaan atau jawaban pada FAQ yang sudah ada.
 *     tags: [Content & Support]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: FAQ berhasil diperbarui.
 */
router.put("/faqs/:id", requireAdminAuth(), FAQController.update);

/**
 * @swagger
 * /faqs/{id}:
 *   delete:
 *     summary: Hapus FAQ (Admin)
 *     description: Menghapus FAQ dari sistem help hub.
 *     tags: [Content & Support]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: FAQ berhasil dihapus.
 */
router.delete("/faqs/:id", requireAdminAuth(), FAQController.delete);

export default router;
