import express from "express";
import * as AuthController from "./AuthController";
import { requireAdminAuth, requireUserAuth } from "../../middlewares/authMiddleware";
import passport from "passport";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Sistem masuk (login), daftar (register), dan keamanan akun.
 */

/**
 * @swagger
 * /auth/admin/login:
 *   post:
 *     summary: Login Admin
 *     description: Digunakan oleh administrator untuk masuk ke Dashboard. Mengembalikan token akses (JWT).
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@peskinpro.id
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login Berhasil. Mengembalikan data user dan token.
 *       401:
 *         description: Email atau kata sandi salah.
 */
router.post("/admin/login", AuthController.adminLogin);

/**
 * @swagger
 * /auth/user/login:
 *   post:
 *     summary: Login Pelanggan
 *     description: Digunakan oleh pembeli untuk masuk ke akun mereka di Storefront.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: customer@email.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login Berhasil.
 */
router.post("/user/login", AuthController.userLogin);

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Daftar Akun Baru
 *     description: Membuat akun pelanggan baru di sistem PESkinPro.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, email, password, phone]
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pendaftaran berhasil.
 *       400:
 *         description: Data tidak valid atau email sudah terdaftar.
 */
router.post("/register", AuthController.register);

/**
 * @swagger
 * /token/refresh:
 *   post:
 *     summary: Perbarui Token (Refresh Token)
 *     description: Memperbarui access token yang sudah kadaluarsa menggunakan refresh token yang tersimpan di cookie.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token baru berhasil dibuat.
 *       403:
 *         description: Refresh token tidak valid atau sudah kadaluarsa.
 */
router.post("/token/refresh", AuthController.refreshToken);

/**
 * @swagger
 * /admin/logout:
 *   post:
 *     summary: Keluar (Logout) Admin
 *     description: Menghapus sesi admin dan membersihkan cookie authentication.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout berhasil.
 */
router.post("/admin/logout", AuthController.adminLogout);

/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: Keluar (Logout) Pelanggan
 *     description: Menghapus sesi pelanggan dan membersihkan cookie authentication.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout berhasil.
 */
router.post("/user/logout", AuthController.userLogout);

/**
 * @swagger
 * /admin/me:
 *   get:
 *     summary: Ambil Profil Saya (Admin)
 *     description: Mengambil data profil administrator yang sedang login saat ini.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data profil admin berhasil diambil.
 *       401:
 *         description: Sesi berakhir atau tidak memiliki ijin.
 */
router.get("/admin/me", requireAdminAuth(), AuthController.getMe);

// Google OAuth
/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Login dengan Google
 *     description: Mengarahkan pengguna ke halaman login Google untuk otentikasi.
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect ke Google.
 */
router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Callback Google OAuth
 *     description: Menangani kembalian dari Google setelah pengguna login. Menghasilkan token dan mengarahkan kembali ke website.
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Kembali ke website dengan membawa token.
 */
router.get(
    "/auth/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:3000"}/login` }),
    AuthController.googleCallback
);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Minta Reset Kata Sandi
 *     description: Mengirimkan email berisi link reset kata sandi ke alamat email pengguna.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email reset berhasil dikirim.
 */
router.post("/forgot-password", AuthController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset Kata Sandi Baru
 *     description: Mengubah kata sandi lama menjadi baru menggunakan token yang didapat dari email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kata sandi berhasil diubah.
 */
router.post("/reset-password", AuthController.resetPassword);

export default router;
