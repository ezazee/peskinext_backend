import express from "express";
import * as AddressController from "./AddressController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Address
 *   description: Address management
 */

/**
 * @swagger
 * /addres:
 *   post:
 *     summary: Create New Address
 *     tags: [Address]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               recipient_name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               address_line:
 *                 type: string
 *     responses:
 *       201:
 *         description: Address created
 */
router.post("/addres", AddressController.createAddress);

/**
 * @swagger
 * /addres/{user_id}:
 *   get:
 *     summary: Get Addresses by User ID
 *     tags: [Address]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of addresses
 */
router.get("/addres/:user_id", AddressController.getAddresses);

/**
 * @swagger
 * /addres/{id}:
 *   patch:
 *     summary: Update Address
 *     tags: [Address]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipient_name:
 *                 type: string
 *               address_line:
 *                 type: string
 *     responses:
 *       200:
 *         description: Address updated
 */
router.patch("/addres/:id", AddressController.updateAddress);

/**
 * @swagger
 * /addres/{id}:
 *   delete:
 *     summary: Delete Address
 *     tags: [Address]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Address deleted
 */
router.delete("/addres/:id", AddressController.deleteAddress);

/**
 * @swagger
 * /addres/{id}/set-default:
 *   patch:
 *     summary: Set Address as Default
 *     tags: [Address]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Address set as default
 */
router.patch("/addres/:id/set-default", AddressController.setDefaultAddress);

export default router;
