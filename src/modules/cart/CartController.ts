import { Request, Response } from "express";
import Cart from "./models/CartModel";
import Products from "../product/models/ProductModel";
import ProductVariants from "../product/models/ProductVariantModel";
import ProductVariantPrices from "../product/models/ProductVariantPriceModel";
import Users from "../user/models/UserModel";

export const addToCart = async (req: Request, res: Response) => {
    try {
        const { user_id, product_id, variant_id, quantity } = req.body;

        if (!variant_id) {
            return res.status(400).json({ message: "variant_id wajib diisi" });
        }

        const cartItem = await Cart.findOne({
            where: { user_id, product_id, variant_id },
        });

        if (cartItem) {
            cartItem.quantity += quantity || 1;
            await cartItem.save();
            return res.json({ message: "Cart updated", data: cartItem });
        }

        const newCart = await Cart.create({
            user_id,
            product_id,
            variant_id,
            quantity: quantity || 1,
        });

        res.status(201).json({ message: "Added to cart", data: newCart });
    } catch (error: any) {
        console.error("❌ Error addToCart:", error);
        res.status(500).json({ message: "Failed to add to cart", error: error.message });
    }
};

export const getCartByUser = async (req: Request, res: Response) => {
    try {
        const { user_id } = req.params;

        const cart = await Cart.findAll({
            where: { user_id },
            include: [
                { model: Products, as: "product" },
                { model: Users, as: "user", attributes: ["id", "name", "email"] },
                {
                    model: ProductVariants,
                    as: "variant",
                    attributes: ["id", "variant_name", "weight"],
                    include: [
                        {
                            model: ProductVariantPrices,
                            as: "prices",
                            attributes: ["id", "channel", "price", "price_strikethrough"],
                        },
                    ],
                },
            ],
        });

        res.json(cart);
    } catch (error: any) {
        console.error("❌ Error getCartByUser:", error);
        res.status(500).json({ message: "Failed to fetch cart", error: error.message });
    }
};

export const updateCartItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        const cartItem = await Cart.findByPk(id);
        if (!cartItem) return res.status(404).json({ message: "Cart item not found" });

        cartItem.quantity = quantity;
        await cartItem.save();

        res.json({ message: "Cart item updated", data: cartItem });
    } catch (error: any) {
        console.error("❌ Error updateCartItem:", error);
        res.status(500).json({ message: "Failed to update cart item", error: error.message });
    }
};

export const removeCartItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const cartItem = await Cart.findByPk(id);
        if (!cartItem) return res.status(404).json({ message: "Cart item not found" });

        await cartItem.destroy();
        res.json({ message: "Cart item removed" });
    } catch (error: any) {
        console.error("❌ Error removeCartItem:", error);
        res.status(500).json({ message: "Failed to remove cart item", error: error.message });
    }
};
