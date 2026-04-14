import express from "express";
import * as InvoiceController from "./InvoiceController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Order & Checkout
 *   description: Proses pembelian dari keranjang hingga pembayaran, pengiriman, dan manajemen invoice.
 */

/**
 * @swagger
 * /invoices/{orderId}:
 *   get:
 *     summary: Ambil Data Invoice
 *     description: Mengambil detail informasi invoice (tagihan) berdasarkan ID Pesanan. Digunakan untuk menampilkan bukti tagihan kepada pelanggan.
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
 *         description: Data invoice ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invoice_number: { type: string, example: "INV-2024-001" }
 *                 total: { type: number }
 *                 status: { type: string, description: "Status tagihan (unpaid, paid, expired)" }
 */
router.get("/invoices/:orderId", InvoiceController.getInvoice);

export default router;
