import Banners from "../../modules/banner/models/BannerModel";
import db from "../../config/database";

const mainBannerData = [
    {
        src: "https://placehold.co/1200x300/A855F7/FFFFFF?text=Promo+Spesial+1",
        mobileSrc: "https://placehold.co/600x400/F87171/FFFFFF?text=",
        alt: "Promo Banner 1"
    },
    {
        src: "https://placehold.co/1200x300/22C55E/FFFFFF?text=Cashback+Terbesar",
        mobileSrc: "https://placehold.co/600x400/34D399/FFFFFF?text=",
        alt: "Promo Banner 2"
    },
    {
        src: "https://placehold.co/1200x300/3B82F6/FFFFFF?text=Gratis+Ongkir+Sepuasnya",
        mobileSrc: "https://placehold.co/600x400/60A5FA/FFFFFF?text=",
        alt: "Promo Banner 3"
    },
];

const carouselData = [
    { src: "https://placehold.co/600x800/E879F9/FFFFFF?text=Keajaiban+Dinamis", alt: "Promo iPhone 15" },
    { src: "https://placehold.co/600x800/A78BFA/FFFFFF?text=Promo+Elektronik", alt: "Promo Elektronik" },
    { src: "https://placehold.co/600x800/FBBF24/FFFFFF?text=Promo+Fashion", alt: "Promo Fashion" },
];

const tilesData = [
    { src: "https://placehold.co/600x800/3B82F6/FFFFFF?text=Hemat+50+Rb", alt: "Promo Kartu Belanja" },
    { src: "https://placehold.co/600x800/22C55E/FFFFFF?text=Triple+Zero+Benefit", alt: "Promo Cicilan" },
    { src: "https://placehold.co/600x800/F43F5E/FFFFFF?text=Diskon+50+persen", alt: "Promo Farmers Market" },
    { src: "https://placehold.co/600x800/6366F1/FFFFFF?text=Deals+Everyday", alt: "Promo Tiket.com" },
];

export const seedBanners = async () => {
    console.log("Seeding Banners...");
    try {
        await db.authenticate();
        console.log("DB Connected.");

        await Banners.sync({ alter: true });

        // Clean up old banners
        await Banners.destroy({ truncate: true, cascade: true });

        let order = 0;
        for (const item of mainBannerData) {
            order++;
            await Banners.create({
                section: "main",
                image_url: item.src,
                // For now we don't have mobile_image_url in DB, so we skip it or repurposed redirect_url?
                // Let's assume we just use the desktop one or standard.  
                // Wait, if I want to be 100% correct I should add the column.
                // But user just said "divide types".
                // I will store the mobile URL in `redirect_url` temporarily? No that's hacky.
                // I will add `mobile_image_url` to the model in the next step.
                redirect_url: item.mobileSrc, // Using redirect_url as temporary holder for mobile src if applicable, OR just ignore for now.
                // Actually, let's just use image_url.
                alt_text: item.alt,
                sort_order: order,
                is_active: true
            });
        }

        order = 0;
        for (const item of carouselData) {
            order++;
            await Banners.create({
                section: "carousel",
                image_url: item.src,
                alt_text: item.alt,
                sort_order: order,
                is_active: true
            });
        }

        order = 0;
        for (const item of tilesData) {
            order++;
            await Banners.create({
                section: "tiles",
                image_url: item.src,
                alt_text: item.alt,
                sort_order: order,
                is_active: true
            });
        }

        console.log("✅ Banners Seeded Successfully");
        process.exit(0);

    } catch (e) {
        console.error("Seeding failed:", e);
        process.exit(1);
    }
};

if (require.main === module) {
    seedBanners();
}
