import express from "express";
import * as CouponController from "./CouponController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Order & Checkout
 *   description: Proses pembelian dari keranjang hingga pembayaran, pengiriman, dan penggunaan voucher.
 */

/**
 * @swagger
 * /vouchers:
 *   get:
 *     summary: Daftar Semua Voucher Aktif
 *     description: Mengambil semua kupon atau voucher yang tersedia dan masih bisa digunakan oleh pelanggan.
 *     tags: [Order & Checkout]
 *     responses:
 *       200:
 *         description: Daftar voucher berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string, description: "Kode Voucher" }
 *                   title: { type: string }
 *                   subtitle: { type: string }
 *                   type: { type: string, enum: [shipping, promo] }
 *                   savingLabel: { type: string }
 *                   validTo: { type: string, format: date-time }
 */
router.get("/vouchers", CouponController.getCoupons);

/**
 * @swagger
 * /vouchers/{id}:
 *   get:
 *     summary: Detail Voucher by ID
 *     description: Mengambil informasi rinci sebuah voucher berdasarkan kode uniknya.
 *     tags: [Order & Checkout]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Data voucher ditemukan.
 */
router.get("/vouchers/:id", CouponController.getCouponById);

/**
 * @swagger
 * /vouchers:
 *   post:
 *     summary: Buat Voucher Baru (Admin)
 *     description: Administrator dapat membuat voucher promo atau ongkir baru.
 *     tags: [Order & Checkout]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, title, type]
 *             properties:
 *               code: { type: string, example: "PROMO50" }
 *               title: { type: string }
 *               type: { type: string, enum: [shipping, promo] }
 *               discount_value: { type: number }
 *     responses:
 *       201:
 *         description: Voucher berhasil dibuat.
 */
router.post("/vouchers", CouponController.createCoupon);

/**
 * @swagger
 * /vouchers/{id}:
 *   patch:
 *     summary: Perbarui Voucher (Admin)
 *     description: Mengubah data voucher yang sudah ada.
 *     tags: [Order & Checkout]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Voucher berhasil diperbarui.
 */
router.patch("/vouchers/:id", CouponController.updateCoupon);

/**
 * @swagger
 * /vouchers/{id}:
 *   delete:
 *     summary: Hapus Voucher (Admin)
 *     description: Menghapus voucher dari sistem.
 *     tags: [Order & Checkout]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Voucher berhasil dihapus.
 */
router.delete("/vouchers/:id", CouponController.deleteCoupon);

/**
 * @swagger
 * /vouchers/check:
 *   post:
 *     summary: Periksa Validitas Voucher
 *     description: Mengecek apakah sebuah kode voucher bisa digunakan untuk keranjang belanja saat ini. Menghitung jumlah potongan harga.
 *     tags: [Order & Checkout]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, total, items]
 *             properties:
 *               code: { type: string, example: "SKINCARENEW" }
 *               total: { type: number, description: "Total belanja awal" }
 *               items: { type: array, items: { type: object } }
 *     responses:
 *       200:
 *         description: Voucher valid. Mengembalikan nilai diskon.
 *       400:
 *         description: Voucher tidak valid (expired, kuota habis, atau syarat tidak terpenuhi).
 */
router.post("/vouchers/check", CouponController.checkCoupon);

export default router;
