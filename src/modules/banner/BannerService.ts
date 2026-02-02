import Banners from "./models/BannerModel";

export const getAllBanners = async () => {
    // Fetch all active banners ordered by sort_order
    const banners = await Banners.findAll({
        where: { is_active: true },
        order: [["sort_order", "ASC"], ["created_at", "DESC"]]
    });

    // Group by section for easier frontend consumption
    const main = banners.filter(b => b.section === "main").map(b => ({
        id: b.id,
        src: b.image_url,
        // If we stored mobile url in redirect_url temporarily or just send same img
        mobileSrc: b.redirect_url || b.image_url,
        alt: b.alt_text,
        redirect: b.redirect_url
    }));

    const carousel = banners.filter(b => b.section === "carousel").map(b => ({
        id: b.id,
        src: b.image_url,
        alt: b.alt_text,
        redirect: b.redirect_url
    }));

    const tiles = banners.filter(b => b.section === "tiles").map(b => ({
        id: b.id,
        src: b.image_url,
        alt: b.alt_text,
        redirect: b.redirect_url
    }));

    return { main, carousel, tiles };
};

export const createBanner = async (data: any) => {
    return await Banners.create(data);
};
