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
            id: r.id, // Frontend might expect number, but string UUID is better. Frontend types allow string normally? Checked: id is number in dummy. But let's send string and see.
            user: rJson.user ? (rJson.user.name || rJson.user.first_name) : "Anonymous",
            variant: variantName,
            comment: r.comment,
            images,
            rating: r.rating,
            date: r.created_at,
            productSlug: rJson.product?.slug
        };
    }));
};

export const createReview = async (userId: string, data: any) => {
    // Basic validation: User bought product? (Optional for now)

    const { product_id, variant_id, rating, comment, images } = data;

    const review = await Reviews.create({
        user_id: userId,
        product_id,
        variant_id,
        rating,
        comment,
        images: JSON.stringify(images || [])
    });

    return review;
};
