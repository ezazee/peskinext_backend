import express from "express";
import * as CartController from "./CartController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart management
 */

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add Item to Cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, product_id, variant_id]
 *             properties:
 *               user_id:
 *                 type: integer
 *               product_id:
 *                 type: integer
 *               variant_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Item added to cart
 */
router.post("/cart", CartController.addToCart);

/**
 * @swagger
 * /cart/{user_id}:
 *   get:
 *     summary: Get Cart by User ID
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cart details
 */
router.get("/cart/:user_id", CartController.getCartByUser);

/**
 * @swagger
 * /cart/{id}:
 *   patch:
 *     summary: Update Cart Item Quantity
 *     tags: [Cart]
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
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cart item updated
 */
router.patch("/cart/:id", CartController.updateCartItem);

/**
 * @swagger
 * /cart/{id}:
 *   delete:
 *     summary: Remove Cart Item
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cart item removed
 */
router.delete("/cart/:id", CartController.removeCartItem);

export default router;
