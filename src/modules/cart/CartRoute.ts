import express from "express";
import * as CartController from "./CartController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Order & Checkout
 *   description: Proses pembelian dari keranjang hingga pembayaran.
 */

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Tambah ke Keranjang
 *     description: Menambahkan produk dengan varian tertentu ke dalam keranjang belanja milik pelanggan.
 *     tags: [Order & Checkout]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, product_id, variant_id]
 *             properties:
 *               user_id: { type: string, description: "UUID pengguna" }
 *               product_id: { type: string }
 *               variant_id: { type: integer }
 *               quantity: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Berhasil ditambahkan ke keranjang.
 */
router.post("/cart", CartController.addToCart);

/**
 * @swagger
 * /cart/{user_id}:
 *   get:
 *     summary: Lihat Keranjang
 *     description: Mengambil semua daftar belanjaan yang ada di dalam keranjang pengguna berdasarkan ID-nya.
 *     tags: [Order & Checkout]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Data keranjang berhasil diambil.
 */
router.get("/cart/:user_id", CartController.getCartByUser);

/**
 * @swagger
 * /cart/{id}:
 *   patch:
 *     summary: Update Jumlah Item
 *     description: Mengubah jumlah (kuantitas) barang yang ada di dalam keranjang.
 *     tags: [Order & Checkout]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID unik item di dalam keranjang.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity: { type: integer }
 *     responses:
 *       200:
 *         description: Jumlah barang berhasil diperbarui.
 */
router.patch("/cart/:id", CartController.updateCartItem);

/**
 * @swagger
 * /cart/{id}:
 *   delete:
 *     summary: Hapus dari Keranjang
 *     description: Mengeluarkan satu jenis barang dari keranjang belanja.
 *     tags: [Order & Checkout]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Barang berhasil dihapus dari keranjang.
 */
router.delete("/cart/:id", CartController.removeCartItem);

export default router;
