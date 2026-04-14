import express from "express";
import * as ShippingController from "./ShippingController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Order & Checkout
 *   description: Proses pembelian dari keranjang hingga pembayaran dan pengiriman.
 */

/**
 * @swagger
 * /shipping/check-ongkir:
 *   post:
 *     summary: Cek Biaya Ongkir
 *     description: Menghitung estimasi biaya pengiriman dari gudang ke alamat pelanggan menggunakan RajaOngkir.
 *     tags: [Order & Checkout]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id]
 *             properties:
 *               user_id: { type: string, description: "ID Pelanggan (UUID)" }
 *     responses:
 *       200:
 *         description: Detail biaya ongkir dari berbagai kurir (JNE, POS, TIKI).
 */
router.post("/shipping/check-ongkir", ShippingController.checkOngkir);

/**
 * @swagger
 * /shipping/webhook:
 *   post:
 *     summary: Webhook Biteship
 *     description: Endpoint otomatis untuk menerima update status pengiriman real-time dari Biteship (Sistem-ke-Sistem).
 *     tags: [Order & Checkout]
 *     parameters:
 *       - in: header
 *         name: x-biteship-signature
 *         schema: { type: string }
 *         description: Tanda tangan keamanan untuk verifikasi data.
 *     responses:
 *       200:
 *         description: Webhook diterima.
 */
router.post("/shipping/webhook", ShippingController.handleWebhook);

/**
 * @swagger
 * /shipping/order/{id}:
 *   post:
 *     summary: Request Pickup (Admin)
 *     description: Memesan kurir penjemputan barang (Biteship) untuk pesanan tertentu.
 *     tags: [Order & Checkout]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID Pesanan.
 *     responses:
 *       200:
 *         description: Order pengiriman berhasil dibuat.
 */
router.post("/shipping/order/:id", ShippingController.createOrders);

/**
 * @swagger
 * /shipping/tracking/{id}:
 *   get:
 *     summary: Lacak Pengiriman
 *     description: Mengambil status perjalanan paket secara real-time berdasarkan ID Pesanan.
 *     tags: [Order & Checkout]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detail status pelacakan paket.
 */
router.get("/shipping/tracking/:id", ShippingController.getTracking);

export default router;
