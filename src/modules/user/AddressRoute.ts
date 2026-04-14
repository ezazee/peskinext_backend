import express from "express";
import * as AddressController from "./AddressController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User - Customer
 *   description: Pengelolaan profil pelanggan dan alamat pengiriman.
 */

/**
 * @swagger
 * /address:
 *   post:
 *     summary: Tambah Alamat Baru
 *     description: Menyimpan alamat pengiriman baru untuk pelanggan.
 *     tags: [User - Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipient_name, phone_number, address_line, province_id, city_id, district_id]
 *             properties:
 *               recipient_name:
 *                 type: string
 *                 example: "Budi Santoso"
 *               phone_number:
 *                 type: string
 *                 example: "08123456789"
 *               address_line:
 *                 type: string
 *                 description: Detail alamat (Jalan, No Rumah).
 *               province_id:
 *                 type: integer
 *               city_id:
 *                 type: integer
 *               district_id:
 *                 type: integer
 *               postal_code:
 *                 type: string
 *               is_default:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Alamat berhasil ditambahkan.
 */
router.post("/address", AddressController.createAddress);

/**
 * @swagger
 * /addresses/{user_id}:
 *   get:
 *     summary: Daftar Alamat Pelanggan
 *     description: Mengambil semua daftar alamat yang dimiliki oleh seorang pengguna berdasarkan ID-nya.
 *     tags: [User - Customer]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID pengguna.
 *     responses:
 *       200:
 *         description: Daftar alamat berhasil ditemukan.
 */
router.get("/addresses/:user_id", AddressController.getAddresses);

/**
 * @swagger
 * /address/{id}:
 *   put:
 *     summary: Perbarui Alamat
 *     description: Mengubah detail informasi pada alamat yang sudah ada.
 *     tags: [User - Customer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID unik alamat.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipient_name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               address_line:
 *                 type: string
 *               province_id:
 *                 type: integer
 *               city_id:
 *                 type: integer
 *               district_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Alamat berhasil diperbarui.
 */
router.put("/address/:id", AddressController.updateAddress);

/**
 * @swagger
 * /address/{id}:
 *   delete:
 *     summary: Hapus Alamat
 *     description: Menghapus alamat pengiriman dari daftar pelanggan.
 *     tags: [User - Customer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Alamat berhasil dihapus.
 */
router.delete("/address/:id", AddressController.deleteAddress);

/**
 * @swagger
 * /address/{id}/default:
 *   put:
 *     summary: Setel Alamat Utama
 *     description: Menjadikan salah satu alamat sebagai alamat pengiriman utama (default).
 *     tags: [User - Customer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Alamat berhasil disetel sebagai utama.
 */
router.put("/address/:id/default", AddressController.setDefaultAddress);

export default router;
