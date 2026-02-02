import express from "express";
import * as ProductController from "./ProductController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Product management
 */

// product
/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create New Product
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category, price, weight]
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               weight:
 *                 type: number
 *     responses:
 *       201:
 *         description: Product created
 */
router.post("/products", ProductController.createProduct);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get All Products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: List of products
 */
router.get("/products", ProductController.getAllProducts);

/**
 * @swagger
 * /products/{productId}:
 *   get:
 *     summary: Get Product Detail
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product detail
 */
router.get("/products/:productId", ProductController.getProductDetail);

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update Product
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product updated
 */
router.patch("/products/:id", ProductController.updateProduct);

/**
 * @swagger
 * /products/{productId}:
 *   delete:
 *     summary: Delete Product
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 */
router.delete("/products/:productId", ProductController.deleteProduct);

// stock product
/**
 * @swagger
 * /stock:
 *   post:
 *     summary: Add Stock
 *     tags: [Product]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               variant_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Stock added
 */
router.post("/stock", ProductController.addStock);

/**
 * @swagger
 * /stock/{productId}:
 *   get:
 *     summary: Get Product Stock
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stock details
 */
router.get("/stock/:productId", ProductController.getProductStock);

/**
 * @swagger
 * /stock/{id}:
 *   patch:
 *     summary: Update Stock
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Stock updated
 */
router.patch("/stock/:id", ProductController.updateStock);

/**
 * @swagger
 * /stock/{variantId}/{stockId}:
 *   delete:
 *     summary: Delete Stock
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: stockId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stock deleted
 */
router.delete("/stock/:variantId/:stockId", ProductController.deleteStock);

// variant product
/**
 * @swagger
 * /variant/{variantId}:
 *   get:
 *     summary: Get Variant Detail
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Variant detail
 */
router.get("/variant/:variantId", ProductController.getVariant);

/**
 * @swagger
 * /variant:
 *   post:
 *     summary: Add Variant
 *     tags: [Product]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *               variant_name:
 *                 type: string
 *               weight:
 *                 type: number
 *     responses:
 *       201:
 *         description: Variant added
 */
router.post("/variant", ProductController.addVariant);

/**
 * @swagger
 * /variant/{productId}/{variantId}:
 *   delete:
 *     summary: Delete Variant
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Variant deleted
 */
router.delete("/variant/:productId/:variantId", ProductController.deleteVariant);

/**
 * @swagger
 * /variant/{variantId}:
 *   patch:
 *     summary: Update Variant
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               variant_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Variant updated
 */
router.patch("/variant/:variantId", ProductController.updateVariant);

export default router;
