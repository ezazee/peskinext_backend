import express from "express";
import * as PaymentController from "./PaymentController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Order & Checkout
 *   description: Proses pembelian dari keranjang hingga pembayaran, pengiriman, dan riwayat transaksi.
 */

/**
 * @swagger
 * /payment/create:
 *   post:
 *     summary: Buat Sesi Pembayaran (Midtrans/DOKU)
 *     description: Mengirimkan data pesanan ke Payment Gateway untuk mendapatkan link atau token pembayaran.
 *     tags: [Order & Checkout]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order_id]
 *             properties:
 *               order_id: { type: string, description: "UUID Pesanan" }
 *     responses:
 *       200:
 *         description: Sesi pembayaran berhasil dibuat.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 payment_url: { type: string, description: "Link menuju halaman pembayaran gateway." }
 *                 token: { type: string, description: "Token pembayaran (jika menggunakan Snap/Popup)." }
 */
router.post("/payment/create", PaymentController.createPayment);

/**
 * @swagger
 * /payment/notification:
 *   post:
 *     summary: Webhook Notifikasi Pembayaran
 *     description: Endpoint otomatis yang menerima update status real-time dari Payment Gateway saat pelanggan berhasil membayar atau pembayaran expired.
 *     tags: [Order & Checkout]
 *     responses:
 *       200:
 *         description: Notifikasi berhasil diproses.
 */
router.post("/payment/notification", PaymentController.handleNotification);

export default router;
