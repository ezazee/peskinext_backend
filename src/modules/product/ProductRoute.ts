import express from "express";
import * as ProductController from "./ProductController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Product - Storefront
 *     description: Akses data produk untuk pembeli (Halaman Utama, Detail Produk).
 *   - name: Product - Admin
 *     description: Pengelolaan data produk, stok, dan varian (Khusus Admin).
 */

// --- STOREFRONT ENDPOINTS ---

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Ambil Semua Produk
 *     description: Mengambil daftar semua produk yang aktif untuk ditampilkan di website depan.
 *     tags: [Product - Storefront]
 *     responses:
 *       200:
 *         description: Daftar produk berhasil diambil.
 */
router.get("/products", ProductController.getAllProducts);

/**
 * @swagger
 * /products/{productId}:
 *   get:
 *     summary: Detail Produk
 *     description: Mengambil informasi lengkap sebuah produk berdasarkan ID atau Slug.
 *     tags: [Product - Storefront]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data produk ditemukan.
 */
router.get("/products/:productId", ProductController.getProductDetail);

/**
 * @swagger
 * /products/calculate:
 *   post:
 *     summary: Hitung Harga Produk
 *     description: Menghitung harga total berdasarkan varian yang dipilih dan jumlah (qty). Digunakan sebelum masuk ke checkout.
 *     tags: [Product - Storefront]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, variantId, qty]
 *             properties:
 *               productId: { type: string }
 *               variantId: { type: integer }
 *               qty: { type: integer }
 *     responses:
 *       200:
 *         description: Hasil perhitungan harga.
 */
router.post("/products/calculate", ProductController.calculatePrice);

// --- ADMIN ENDPOINTS ---

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Buat Produk Baru
 *     description: Menambahkan produk baru ke dalam katalog (Khusus Admin).
 *     tags: [Product - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category, price, weight]
 *             properties:
 *               name: { type: string }
 *               category: { type: string }
 *               price: { type: number }
 *               weight: { type: number }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Produk berhasil dibuat.
 */
router.post("/products", ProductController.createProduct);

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update Data Produk
 *     description: Mengubah informasi produk yang sudah ada.
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
 *         description: Data produk berhasil diupdate.
 */
router.patch("/products/:id", ProductController.updateProduct);

/**
 * @swagger
 * /products/{productId}:
 *   delete:
 *     summary: Hapus Produk
 *     description: Menghapus produk dari database secara permanen.
 *     tags: [Product - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Produk berhasil dihapus.
 */
router.delete("/products/:productId", ProductController.deleteProduct);

// --- STOCK MANAGEMENT ---

/**
 * @swagger
 * /stock:
 *   post:
 *     summary: Tambah Stok (Admin)
 *     description: Menambah jumlah stok untuk varian produk tertentu.
 *     tags: [Product - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               variant_id: { type: integer }
 *               quantity: { type: integer }
 *     responses:
 *       201:
 *         description: Stok berhasil ditambahkan.
 */
router.post("/stock", ProductController.addStock);

/**
 * @swagger
 * /stock/{productId}:
 *   get:
 *     summary: Lihat Stok Produk (Admin)
 *     description: Melihat riwayat atau sisa stok dari suatu produk.
 *     tags: [Product - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Data stok berhasil diambil.
 */
router.get("/stock/:productId", ProductController.getProductStock);

/**
 * @swagger
 * /stock/{id}:
 *   patch:
 *     summary: Edit Catatan Stok (Admin)
 *     description: Mengubah data histori stok yang sudah tercatat.
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
 *         description: Stok berhasil diupdate.
 */
router.patch("/stock/:id", ProductController.updateStock);

/**
 * @swagger
 * /stock/{variantId}/{stockId}:
 *   delete:
 *     summary: Hapus Riwayat Stok (Admin)
 *     description: Menghapus salah satu catatan perubahan stok.
 *     tags: [Product - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: stockId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Catatan stok berhasil dihapus.
 */
router.delete("/stock/:variantId/:stockId", ProductController.deleteStock);

/**
 * @swagger
 * /products/transfer:
 *   post:
 *     summary: Transfer Stok (Admin)
 *     description: Memindahkan stok dari satu varian ke varian lain.
 *     tags: [Product - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transfer stok berhasil.
 */
router.post("/products/transfer", ProductController.transferStock);

// --- VARIANT MANAGEMENT ---

/**
 * @swagger
 * /variant/{variantId}:
 *   get:
 *     summary: Ambil Detail Varian (Admin)
 *     description: "Melihat informasi rinci sebuah varian produk (misal: ukuran, warna, harga spesifik)."
 *     tags: [Product - Admin]
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Data varian berhasil ditemukan.
 */
router.get("/variant/:variantId", ProductController.getVariant);

/**
 * @swagger
 * /variant:
 *   post:
 *     summary: Tambah Varian Produk (Admin)
 *     description: "Membuat varian baru untuk suatu produk (misal: Saku 50ml, Saku 100ml)."
 *     tags: [Product - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id: { type: string }
 *               variant_name: { type: string }
 *               weight: { type: number }
 *     responses:
 *       201:
 *         description: Varian berhasil ditambahkan.
 */
router.post("/variant", ProductController.addVariant);

/**
 * @swagger
 * /variant/{productId}/{variantId}:
 *   delete:
 *     summary: Hapus Varian (Admin)
 *     description: Menghapus varian dari produk tertentu.
 *     tags: [Product - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Varian berhasil dihapus.
 */
router.delete("/variant/:productId/:variantId", ProductController.deleteVariant);

/**
 * @swagger
 * /variant/{variantId}:
 *   patch:
 *     summary: Perbarui Varian (Admin)
 *     description: Mengubah informasi nama atau data lain pada varian.
 *     tags: [Product - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Varian berhasil diupdate.
 */
router.patch("/variant/:variantId", ProductController.updateVariant);

export default router;
