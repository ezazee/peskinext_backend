import Banners from "./models/BannerModel";

export const getAllBanners = async () => {
    // Fetch all active banners ordered by sort_order
    const banners = await Banners.findAll({
        where: { is_active: true },
        order: [["sort_order", "ASC"], ["created_at", "DESC"]]
    });

    const mapBanner = (b: any) => ({
        id: b.id,
        src: b.image_url,
        // If we want to support mobile specifically, we check if there's a convention 
        // but for now let's just send the data as is.
        alt: b.alt_text,
        href: b.redirect_url,
        section: b.section
    });

    const main = banners.filter(b => b.section === "main" || b.section === "promo_desktop").map(mapBanner);
    const carousel = banners.filter(b => b.section === "carousel" || b.section === "gallery_carousel").map(mapBanner);
    const tiles = banners.filter(b => b.section === "tiles" || b.section === "gallery_single").map(mapBanner);
    const popup = banners.filter(b => b.section === "popup" || b.section === "welcome").map(mapBanner);
    const welcome = banners.filter(b => b.section === "welcome").map(mapBanner);

    const promo_mobile = banners.filter(b => b.section === "promo_mobile").map(mapBanner);
    const promo_desktop = banners.filter(b => b.section === "promo_desktop").map(mapBanner);
    const bundle = banners.filter(b => b.section === "bundle").map(mapBanner);
    const gallery_carousel = banners.filter(b => b.section === "gallery_carousel").map(mapBanner);
    const gallery_single = banners.filter(b => b.section === "gallery_single").map(mapBanner);

    return {
        main,
        carousel,
        tiles,
        popup,
        welcome,
        promo_mobile,
        promo_desktop,
        bundle,
        gallery_carousel,
        gallery_single
    };
};

export const createBanner = async (data: any) => {
    return await Banners.create(data);
};

export const deleteBanner = async (id: number) => {
    return await Banners.destroy({ where: { id } });
};

export const updateBanner = async (id: number, data: any) => {
    return await Banners.update(data, { where: { id } });
};
