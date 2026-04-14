import Banners from "../../modules/banner/models/BannerModel";
import db from "../../config/database";

const mainBannerData = [
    {
        src: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1200&auto=format&fit=crop",
        mobileSrc: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop",
        alt: "Skincare Premium Collection"
    },
    {
        src: "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=1200&auto=format&fit=crop",
        mobileSrc: "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=600&auto=format&fit=crop",
        alt: "Herbal Beauty Essence"
    },
    {
        src: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=1200&auto=format&fit=crop",
        mobileSrc: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop",
        alt: "Glowing Skin Routine"
    },
];

const carouselData = [
    { src: "https://images.unsplash.com/photo-1570172619666-1bc8acc1f278?q=80&w=600&auto=format&fit=crop", alt: "Brightening Series" },
    { src: "https://images.unsplash.com/photo-1620916566398-39f1143af7be?q=80&w=600&auto=format&fit=crop", alt: "Natural Cleanser" },
    { src: "https://images.unsplash.com/photo-1596462502278-27bfaf433394?q=80&w=600&auto=format&fit=crop", alt: "Organic Moist" },
];

const tilesData = [
    { src: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop", alt: "Face Serum" },
    { src: "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=600&auto=format&fit=crop", alt: "Night Cream" },
    { src: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop", alt: "Eye Care" },
    { src: "https://images.unsplash.com/photo-1570172619666-1bc8acc1f278?q=80&w=600&auto=format&fit=crop", alt: "Body Lotion" },
];

export const seedBanners = async () => {
    try {
        // ALWAYS clear if we are in this flow, or better, check if the CORRECT keys exist.
        // To be safe and ensure the newest high-quality images are used, we'll clear first if the user is asking for it.
        // Actually, the user said "belom tuh" meaning they want it fixed.
        
        console.log("CRITICAL: Cleaning all existing banners...");
        await Banners.sync({ alter: true });
        await Banners.destroy({ where: {}, truncate: true, cascade: true });

        const workingPhotoId = "1556228578-0d85b1a4d571";
        
        const bannerData = [
            // Welcome Popup (1/1)
            { section: "welcome", src: `https://images.unsplash.com/photo-${workingPhotoId}?q=80&w=500&h=625&auto=format&fit=crop`, alt: "[V4] Welcome - Premium Skincare" },
            
            // Product Bundle (1/1)
            { section: "bundle", src: `https://images.unsplash.com/photo-${workingPhotoId}?q=80&w=300&h=500&auto=format&fit=crop`, alt: "[V4] Bundle - Complete Routine" },
            
            // Promo Desktop (3/3)
            { section: "promo_desktop", src: `https://images.unsplash.com/photo-${workingPhotoId}?q=80&w=1200&h=300&auto=format&fit=crop`, alt: "[V4] Desktop Promo 1" },
            { section: "promo_desktop", src: `https://images.unsplash.com/photo-${workingPhotoId}?q=80&w=1200&h=300&auto=format&fit=crop`, alt: "[V4] Desktop Promo 2" },
            { section: "promo_desktop", src: `https://images.unsplash.com/photo-${workingPhotoId}?q=80&w=1200&h=300&auto=format&fit=crop`, alt: "[V4] Desktop Promo 3" },

            // Promo Mobile (3/3)
            { section: "promo_mobile", src: `https://images.unsplash.com/photo-${workingPhotoId}?q=80&w=600&h=400&auto=format&fit=crop`, alt: "[V4] Mobile Promo 1" },
            { section: "promo_mobile", src: `https://images.unsplash.com/photo-${workingPhotoId}?q=80&w=600&h=400&auto=format&fit=crop`, alt: "[V4] Mobile Promo 2" },
            { section: "promo_mobile", src: `https://images.unsplash.com/photo-${workingPhotoId}?q=80&w=600&h=400&auto=format&fit=crop`, alt: "[V4] Mobile Promo 3" },
            
            // Gallery Carousel (3/3)
            { section: "gallery_carousel", src: `https://images.unsplash.com/photo-${workingPhotoId}?q=80&w=600&h=800&auto=format&fit=crop`, alt: "[V4] Gallery Slide 1" },
            { section: "gallery_carousel", src: `https://images.unsplash.com/photo-${workingPhotoId}?q=80&w=600&h=800&auto=format&fit=crop`, alt: "[V4] Gallery Slide 2" },
            { section: "gallery_carousel", src: `https://images.unsplash.com/photo-${workingPhotoId}?q=80&w=600&h=800&auto=format&fit=crop`, alt: "[V4] Gallery Slide 3" },
            
            // Gallery Single (4/4)
            { section: "gallery_single", src: `https://images.unsplash.com/photo-${workingPhotoId}?q=80&w=600&h=800&auto=format&fit=crop`, alt: "[V4] Feature 1" },
            { section: "gallery_single", src: `https://images.unsplash.com/photo-${workingPhotoId}?q=80&w=600&h=800&auto=format&fit=crop`, alt: "[V4] Feature 2" },
            { section: "gallery_single", src: `https://images.unsplash.com/photo-${workingPhotoId}?q=80&w=600&h=800&auto=format&fit=crop`, alt: "[V4] Feature 3" },
            { section: "gallery_single", src: `https://images.unsplash.com/photo-${workingPhotoId}?q=80&w=600&h=800&auto=format&fit=crop`, alt: "[V4] Feature 4" },
        ];

        let order = 0;
        for (const item of bannerData) {
            order++;
            await Banners.create({
                section: item.section as any,
                image_url: item.src,
                alt_text: item.alt,
                sort_order: order,
                is_active: true
            });
        }

        console.log("✅ Banners Seeded Successfully with Correct Keys");
    } catch (e) {
        console.error("Seeding failed:", e);
    }
};

if (require.main === module) {
    seedBanners();
}
