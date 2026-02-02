import express from "express";
import * as UserController from "./UserController";
import { requireAdminAuth, requireUserAuth } from "../../middlewares/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get All Users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Admin access required
 */
router.get("/users", requireAdminAuth(), UserController.getUsers);

/**
 * @swagger
 * /user/me:
 *   put:
 *     summary: Update Current User Profile
 *     tags: [User]
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
 *               avatarUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get Current User Profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Unauthorized
 */
router.get("/user/me", requireUserAuth(), UserController.getSelf);

router.put("/user/me", requireUserAuth(), UserController.updateProfile);

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register New User
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, confPassword]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confPassword:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Validation error
 */
router.post("/register", UserController.register);

/**
 * @swagger
 * /user/create:
 *   post:
 *     summary: Create User (Admin)
 *     tags: [User]
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
 *     responses:
 *       201:
 *         description: User created successfully
 *       403:
 *         description: Admin access required
 */
router.post("/user/create", requireAdminAuth(), UserController.createUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete User
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User UUID
 *     responses:
 *       200:
 *         description: User deleted
 *       403:
 *         description: Admin access required
 */
router.delete("/users/:id", requireAdminAuth(), UserController.deleteUser);

export default router;
