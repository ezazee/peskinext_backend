import express from "express";
import FlashSaleController from "./FlashSaleController";
import { requireAdminAuth } from "../../middlewares/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Product - Storefront
 *     description: Akses data produk dan promo (Flash Sale) untuk pembeli.
 *   - name: Product - Admin
 *     description: Pengelolaan data produk, stok, varian, dan promo (Khusus Admin).
 */

// --- PUBLIC / STOREFRONT ---

/**
 * @swagger
 * /flash-sales/active:
 *   get:
 *     summary: Ambil Flash Sale Aktif
 *     description: Mengambil data kampanye Flash Sale yang sedang berjalan saat ini beserta daftar produknya.
 *     tags: [Product - Storefront]
 *     responses:
 *       200:
 *         description: Data Flash Sale aktif ditemukan.
 */
router.get("/active", FlashSaleController.getActive);

// --- ADMIN MANAGEMENT ---

/**
 * @swagger
 * /flash-sales/admin/all:
 *   get:
 *     summary: Daftar Semua Flash Sale (Admin)
 *     description: Mengambil seluruh riwayat kampanye Flash Sale (yang akan datang, aktif, maupun selesai).
 *     tags: [Product - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar Flash Sale berhasil diambil.
 */
router.get("/admin/all", requireAdminAuth(), FlashSaleController.getAllAdmin);

/**
 * @swagger
 * /flash-sales/admin/{id}:
 *   get:
 *     summary: Detail Flash Sale (Admin)
 *     description: Melihat informasi rinci sebuah kampanye Flash Sale berdasarkan ID.
 *     tags: [Product - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Data detail Flash Sale ditemukan.
 */
router.get("/admin/:id", requireAdminAuth(), FlashSaleController.getById);

/**
 * @swagger
 * /flash-sales/admin:
 *   post:
 *     summary: Buat Flash Sale Baru (Admin)
 *     description: Administrator membuat jadwal kampanye Flash Sale baru dengan menentukan waktu mulai/selesai serta produk & varian yang didiskon.
 *     tags: [Product - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, start_time, end_time, items]
 *             properties:
 *               name: { type: string, example: "Promo Gajian" }
 *               start_time: { type: string, format: date-time }
 *               end_time: { type: string, format: date-time }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id: { type: string }
 *                     variant_id: { type: integer }
 *                     discount_price: { type: number }
 *                     stock: { type: integer }
 *     responses:
 *       201:
 *         description: Kampanye Flash Sale berhasil dibuat.
 */
router.post("/admin", requireAdminAuth(), FlashSaleController.create);

/**
 * @swagger
 * /flash-sales/admin/{id}:
 *   put:
 *     summary: Perbarui Flash Sale (Admin)
 *     description: Mengatur ulang waktu atau produk pada kampanye Flash Sale yang sudah ada.
 *     tags: [Product - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Flash Sale berhasil diperbarui.
 */
router.put("/admin/:id", requireAdminAuth(), FlashSaleController.update);

/**
 * @swagger
 * /flash-sales/admin/{id}:
 *   delete:
 *     summary: Hapus Flash Sale (Admin)
 *     description: Membatalkan atau menghapus kampanye Flash Sale dari sistem.
 *     tags: [Product - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Flash Sale berhasil dihapus.
 */
router.delete("/admin/:id", requireAdminAuth(), FlashSaleController.delete);

export default router;
