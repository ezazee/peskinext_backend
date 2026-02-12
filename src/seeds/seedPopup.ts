import db from "../config/database";
import Banners from "../modules/banner/models/BannerModel";

const seed = async () => {
    try {
        await db.authenticate();


        // Check if popup already exists
        const existing = await Banners.findOne({ where: { section: "popup" } });
        if (existing) {

            return;
        }

        await Banners.create({
            section: "popup",
            image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop",
            alt_text: "Promo Spesial Limited Time",
            redirect_url: "/shop",
            sort_order: 1,
            is_active: true
        });

    } catch (e) {
        console.error("Error seeding popup:", e);
    }
};

seed();
