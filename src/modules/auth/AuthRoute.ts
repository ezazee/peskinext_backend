import express from "express";
import * as AuthController from "./AuthController";
import { requireAdminAuth, requireUserAuth } from "../../middlewares/authMiddleware";
import passport from "passport";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

/**
 * @swagger
 * /auth/admin/login:
 *   post:
 *     summary: Admin Login
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/admin/login", AuthController.adminLogin);

/**
 * @swagger
 * /auth/user/login:
 *   post:
 *     summary: User Login
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/user/login", AuthController.userLogin);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: User Register
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
 *         description: Register successful
 *       400:
 *         description: Validation error or User exists
 */
router.post("/register", AuthController.register);

/**
 * @swagger
 * /token/refresh:
 *   post:
 *     summary: Refresh Access Token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token generated
 *       403:
 *         description: Invalid or expired refresh token
 */
router.post("/token/refresh", AuthController.refreshToken);

/**
 * @swagger
 * /admin/logout:
 *   post:
 *     summary: Admin Logout
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/admin/logout", AuthController.adminLogout);

/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: User Logout
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/user/logout", AuthController.userLogout);

/**
 * @swagger
 * /admin/me:
 *   get:
 *     summary: Get Current Admin Profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile data
 *       401:
 *         description: Unauthorized
 */
router.get("/admin/me", requireAdminAuth(), AuthController.getMe);

// router.get("/user/me", requireUserAuth(), AuthController.getMe); // MOVED TO UserRoute

// Google OAuth
/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth Login
 *     tags: [Auth]
 *     description: Redirects user to Google Login page.
 *     responses:
 *       302:
 *         description: Redirects to Google
 */
router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth Callback
 *     tags: [Auth]
 *     description: Handles the return from Google, generates tokens, and redirects to frontend.
 *     responses:
 *       302:
 *         description: Redirects to Frontend with token
 *       401:
 *         description: Authentication failed
 */
router.get(
    "/auth/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:3000"}/login` }),
    AuthController.googleCallback
);

export default router;
