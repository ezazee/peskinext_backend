import express from "express";
import * as UserController from "./UserController";
import { requireAdminAuth, requireUserAuth, requireAuth } from "../../middlewares/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: User - Customer
 *     description: Pengelolaan profil pelanggan dan alamat pengiriman.
 *   - name: User - Admin
 *     description: Manajemen data pengguna dan hak akses (Khusus Admin).
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Ambil Semua Pengguna (Admin)
 *     description: Mengambil daftar semua pengguna di sistem, termasuk admin dan pelanggan.
 *     tags: [User - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar pengguna berhasil diambil.
 *       403:
 *         description: Hanya Admin yang bisa mengakses ini.
 */
router.get("/users", requireAdminAuth(), UserController.getUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Ambil Detail Pengguna (Admin)
 *     description: Melihat informasi rinci seorang pengguna berdasarkan ID (UUID).
 *     tags: [User - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Pengguna (UUID)
 *     responses:
 *       200:
 *         description: Data detail pengguna ditemukan.
 *       404:
 *         description: Pengguna tidak ditemukan.
 */
router.get("/users/:id", requireAdminAuth(), UserController.getUserDetail);

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Lihat Profil Saya (Pelanggan)
 *     description: Mengambil data profil milik pengguna yang sedang login.
 *     tags: [User - Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data profil berhasil diambil.
 *       401:
 *         description: Token tidak valid atau sesi berakhir.
 */
router.get("/user/me", requireAuth(), UserController.getSelf);

/**
 * @swagger
 * /user/me:
 *   put:
 *     summary: Perbarui Profil Saya (Pelanggan)
 *     description: Mengubah informasi profil seperti nama, email, hp, dan foto profil sendiri.
 *     tags: [User - Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: "1995-12-30"
 *               avatarUrl:
 *                 type: string
 *                 description: URL foto profil yang baru.
 *     responses:
 *       200:
 *         description: Profil berhasil diperbarui.
 *       401:
 *         description: Tidak diijinkan (Harus login).
 */
router.put("/user/me", requireAuth(), UserController.updateProfile);

/**
 * @swagger
 * /user/create:
 *   post:
 *     summary: Buat Pengguna Baru (Admin)
 *     description: Administrator dapat membuat akun baru secara manual dan menentukan role-nya.
 *     tags: [User - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, confPassword, role]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confPassword:
 *                 type: string
 *               role:
 *                 type: string
 *                 description: Contoh 'admin' atau 'customer'
 *     responses:
 *       201:
 *         description: Pengguna baru berhasil dibuat.
 */
router.post("/user/create", requireAdminAuth(), UserController.createUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Edit Data Pengguna (Admin)
 *     description: Administrator dapat mengubah data pengguna apapun berdasarkan ID.
 *     tags: [User - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data pengguna berhasil diupdate.
 */
router.put("/users/:id", requireAdminAuth(), UserController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Hapus Pengguna (Admin)
 *     description: Menghapus akun pengguna dari sistem secara permanen.
 *     tags: [User - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pengguna berhasil dihapus.
 */
router.delete("/users/:id", requireAdminAuth(), UserController.deleteUser);

/**
 * @swagger
 * /role-permissions:
 *   get:
 *     summary: Ambil Semua Ijin Role (Admin)
 *     description: Melihat daftar semua role dan ijin akses (permissions) yang ada.
 *     tags: [User - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar ijin role berhasil diambil.
 */
router.get("/role-permissions", requireAdminAuth(), UserController.getRolePermissions);

/**
 * @swagger
 * /role-permissions:
 *   put:
 *     summary: Simpan/Perbarui Ijin Role (Admin)
 *     description: Mengatur ijin akses untuk suatu role tertentu.
 *     tags: [User - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ijin role berhasil disimpan.
 */
router.put("/role-permissions", requireAdminAuth(), UserController.updateRolePermissions);

/**
 * @swagger
 * /role-permissions/{role}:
 *   delete:
 *     summary: Hapus Role (Admin)
 *     description: Menghapus role dan semua ijin akses yang terkait dengannya.
 *     tags: [User - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role berhasil dihapus.
 */
router.delete("/role-permissions/:role", requireAdminAuth(), UserController.deleteRolePermission);

export default router;
