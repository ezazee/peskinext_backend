import Reviews from "./models/ReviewModel";
import Users from "../user/models/UserModel";
import Products from "../product/models/ProductModel";
import OrderItems from "../order/models/OrderItemModel";
import ProductVariants from "../product/models/ProductVariantModel";

export const getReviewsByProduct = async (productSlug: string) => {
    const product = await Products.findOne({ where: { slug: productSlug } });
    if (!product) throw new Error("Produk tidak ditemukan");

    const reviews = await Reviews.findAll({
        where: { product_id: product.id },
        include: [
            {
                model: Users,
                as: "user",
                attributes: ["name", "first_name", "last_name", "images"]
            },
            {
                model: Products,
                as: "product",
                attributes: ["slug"]
            }
        ],
        order: [["created_at", "DESC"]]
    });

    // Format to match frontend expectations
    return Promise.all(reviews.map(async (r) => {
        const rJson = r.toJSON() as any;

        let variantName = "";
        if (r.variant_id) {
            const v = await ProductVariants.findByPk(r.variant_id);
            if (v) variantName = v.variant_name;
        }

        let images: string[] = [];
        try { images = JSON.parse(r.images); } catch (e) { }

        return {
            id: r.id,
            user: rJson.user ? (rJson.user.name || rJson.user.first_name) : "Anonymous",
            variant: variantName,
            comment: r.comment,
            images,
            rating: r.rating,
            date: r.created_at,
            productSlug: rJson.product?.slug,
            userImage: rJson.user?.images
        };
    }));
};

export const createReview = async (userId: string, data: any) => {
    const { productSlug, order_id, variant_id, rating, comment, images } = data;

    // Resolve productSlug to product_id
    const product = await Products.findOne({ where: { slug: productSlug } });
    if (!product) throw new Error("Produk tidak ditemukan");

    // Check if user already reviewed this product in this order
    if (order_id) {
        const existingReview = await Reviews.findOne({
            where: {
                user_id: userId,
                product_id: product.id,
                order_id,
                variant_id: variant_id || null
            }
        });

        if (existingReview) {
            throw new Error("Anda sudah memberikan ulasan untuk produk ini");
        }
    }

    const review = await Reviews.create({
        user_id: userId,
        product_id: product.id,
        order_id,
        variant_id,
        rating,
        comment,
        images: JSON.stringify(images || [])
    });

    return review;
};

export const getAllReviewsAdmin = async () => {
    const reviews = await Reviews.findAll({
        include: [
            {
                model: Users,
                as: "user",
                attributes: ["name", "first_name", "last_name", "images", "email"]
            },
            {
                model: Products,
                as: "product",
                attributes: ["name", "slug"]
            }
        ],
        order: [["created_at", "DESC"]]
    });

    return Promise.all(reviews.map(async (r) => {
        const rJson = r.toJSON() as any;

        let variantName = "";
        if (r.variant_id) {
            const v = await ProductVariants.findByPk(r.variant_id);
            if (v) variantName = v.variant_name;
        }

        let images: string[] = [];
        try { images = JSON.parse(r.images); } catch (e) { images = []; }

        return {
            id: r.id,
            userName: rJson.user ? (rJson.user.name || `${rJson.user.first_name} ${rJson.user.last_name}`) : "Anonymous",
            userEmail: rJson.user?.email,
            userImage: rJson.user?.images,
            productName: rJson.product?.name,
            productSlug: rJson.product?.slug,
            variant: variantName,
            comment: r.comment,
            images,
            rating: r.rating,
            date: r.created_at
        };
    }));
};

export const deleteReview = async (id: number) => {
    const review = await Reviews.findByPk(id);
    if (!review) throw new Error("Ulasan tidak ditemukan");
    return await review.destroy();
};

export const createReviewAdmin = async (data: any) => {
    const { user_id, product_id, variant_id, rating, comment, images, created_at } = data;

    if (!user_id || !product_id || !rating) {
        throw new Error("User, Product, and Rating are required");
    }

    const review = await Reviews.create({
        user_id,
        product_id,
        variant_id: variant_id || null,
        rating,
        comment,
        images: JSON.stringify(images || []),
        created_at: created_at ? new Date(created_at) : new Date()
    });

    return review;
};
