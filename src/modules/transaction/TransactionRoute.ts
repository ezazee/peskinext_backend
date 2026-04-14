import express from "express";
import * as TransactionController from "./TransactionController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Order & Checkout
 *   description: Proses pembelian dari keranjang hingga pembayaran, pengiriman, dan riwayat transaksi.
 */

/**
 * @swagger
 * /transactions/callback:
 *   post:
 *     summary: Callback Status Pembayaran (Sistem)
 *     description: Endpoint otomatis yang dipanggil oleh Payment Gateway (DOKU/Midtrans) untuk memberitahu sistem bahwa pembayaran pelanggan sudah lunas atau kadaluarsa.
 *     tags: [Order & Checkout]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order:
 *                 type: object
 *                 properties:
 *                   invoice_number: { type: string }
 *               transaction:
 *                 type: object
 *                 properties:
 *                   status: { type: string, description: "Status pembayaran (SUCCESS, FAILED, EXPIRED)" }
 *     responses:
 *       200:
 *         description: Data callback berhasil diproses oleh sistem.
 */
router.post("/transactions/callback", TransactionController.handlePaymentCallback);

/**
 * @swagger
 * /transactions/{orderId}:
 *   get:
 *     summary: Cek Status Transaksi
 *     description: Mengambil detail informasi transaksi pembayaran berdasarkan ID Pesanan.
 *     tags: [Order & Checkout]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string }
 *         description: UUID Pesanan.
 *     responses:
 *       200:
 *         description: Detail transaksi ditemukan.
 */
router.get("/transactions/:orderId", TransactionController.getTransaction);

export default router;
