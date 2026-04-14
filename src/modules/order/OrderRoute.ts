import express from "express";
import * as OrderController from "./OrderController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Order & Checkout
 *     description: Proses pembelian dari keranjang hingga pembayaran dan pengiriman.
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Buat Pesanan Baru (Checkout)
 *     description: Mengubah isi keranjang menjadi pesanan resmi. Menghitung total biaya termasuk ongkir dan diskon.
 *     tags: [Order & Checkout]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, courier, shipping_cost, shipping_service]
 *             properties:
 *               user_id: { type: string }
 *               courier: { type: string, example: "jne" }
 *               shipping_service: { type: string, example: "REG" }
 *               shipping_cost: { type: number, example: 15000 }
 *               coupon_id: { type: string, description: "Opsional jika pakai voucher" }
 *     responses:
 *       201:
 *         description: Pesanan berhasil dibuat.
 */
router.post("/orders", OrderController.createOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Ambil Semua Pesanan (Admin)
 *     description: Melihat seluruh daftar pesanan dari semua pelanggan (Khusus Admin).
 *     tags: [Order & Checkout]
 *     responses:
 *       200:
 *         description: Daftar pesanan berhasil diambil.
 */
router.get("/orders", OrderController.getAllOrders);

/**
 * @swagger
 * /orders/{user_id}:
 *   get:
 *     summary: Riwayat Pesanan Saya (Pelanggan)
 *     description: Mengambil daftar pesanan milik pelanggan tertentu berdasarkan ID-nya.
 *     tags: [Order & Checkout]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Daftar riwayat pesanan ditemukan.
 */
router.get("/orders/:user_id", OrderController.getOrders);

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Perbarui Data Pesanan (Admin)
 *     description: "Mengubah informasi pada pesanan yang sudah ada (misal: ganti alamat, kurir, atau penyesuaian nominal)."
 *     tags: [Order & Checkout]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Pesanan berhasil diperbarui.
 */
router.put("/orders/:id", OrderController.updateOrder);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update Status Pesanan (Admin/Sistem)
 *     description: "Mengubah status pesanan (misal: dari 'Pending' ke 'Processing')."
 *     tags: [Order & Checkout]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, example: "processing" }
 *               note: { type: string, description: "Catatan tambahan" }
 *     responses:
 *       200:
 *         description: Status pesanan berhasil diupdate.
 */
router.patch("/orders/:id/status", OrderController.updateOrderStatus);

/**
 * @swagger
 * /orders/detail/{id}:
 *   get:
 *     summary: Lihat Detail Pesanan Lengkap
 *     description: Mengambil informasi sangat rinci tentang satu pesanan, termasuk item yang dibeli, status pembayaran, dan data pengiriman.
 *     tags: [Order & Checkout]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detail pesanan ditemukan.
 */
router.get("/orders/detail/:id", OrderController.getOrderDetails);

/**
 * @swagger
 * /orders/{id}/ship:
 *   put:
 *     summary: Input Resi Pengiriman (Admin)
 *     description: Memasukkan nomor resi kurir dan mengubah status pesanan menjadi 'Shipped' (Dikirim).
 *     tags: [Order & Checkout]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tracking_number]
 *             properties:
 *               tracking_number: { type: string, example: "JNE123456789" }
 *     responses:
 *       200:
 *         description: Nomor resi berhasil disimpan.
 */
router.put("/orders/:id/ship", OrderController.shipOrder);

/**
 * @swagger
 * /orders/{id}/complete:
 *   put:
 *     summary: Konfirmasi Pesanan Selesai
 *     description: Menandakan bahwa barang sudah diterima oleh pelanggan. Status berubah menjadi 'Completed'.
 *     tags: [Order & Checkout]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Pesanan dinyatakan selesai.
 */
router.put("/orders/:id/complete", OrderController.completeOrder);

export default router;
