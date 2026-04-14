import GeneralSettings from "./models/SettingModel";

export const getSettings = async () => {
    const settings = await GeneralSettings.findAll();
    // Convert array to key-value object
    return settings.reduce((acc: any, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {});
};

export const updateSettings = async (settingsData: Record<string, string>) => {
    const results: any[] = [];
    for (const [key, value] of Object.entries(settingsData)) {
        // Upsert logic: find if exists, update or create
        const [setting, created] = await GeneralSettings.findOrCreate({
            where: { key },
            defaults: { key, value, group: "general" }
        });

        if (!created) {
            setting.value = value;
            await setting.save();
        }
        results.push(setting);
    }
    return results;
};

/**
 * Seed initial data if keys are missing
 */
export const seedInitialSettings = async () => {
    const initialData = [
        // Identity
        { key: "brand_description", value: "Brand skincare lokal dengan standar internasional. Menggabungkan teknologi Jerman dan kekayaan alam untuk solusi kulit sehat, aman, dan terjangkau.", group: "identity" },
        { key: "copyright_text", value: `© ${new Date().getFullYear()} PT Kilau Berlian Nusantara. All rights reserved.`, group: "identity" },
        { key: "store_name", value: "PE Skin Professional", group: "identity" },

        // Socials
        { key: "social_instagram", value: "https://instagram.com/peskinpro", group: "social" },
        { key: "social_tiktok", value: "https://tiktok.com/@peskinpro", group: "social" },
        { key: "social_shopee", value: "https://shopee.co.id/peskinpro", group: "social" },
        { key: "contact_whatsapp", value: "6281234567890", group: "social" },

        // SEO
        { key: "seo_title", value: "PE Skin Professional | Skincare Premium Lokal", group: "seo" },
        { key: "seo_description", value: "PE Skin Professional - Skin care lokal premium dengan standar internasional.", group: "seo" },
        { key: "seo_keywords", value: "skincare, pe skin pro, kecantikan, wajah sehat", group: "seo" },

        // Operational
        { key: "maintenance_mode", value: "false", group: "operational" },
        { key: "announcement_active", value: "false", group: "operational" },
        { key: "announcement_text", value: "Promo Special Ramadan! Dapatkan diskon hingga 50% untuk produk kecantikan pilihan.", group: "operational" },

        // Branding & Media
        { key: "logo_url", value: "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=200&auto=format&fit=crop", group: "branding" },
        { key: "logo_footer_url", value: "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=200&auto=format&fit=crop", group: "branding" },
        { key: "favicon_url", value: "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=32&auto=format&fit=crop", group: "branding" },
        { key: "maintenance_icon_url", value: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop", group: "branding" },
        { key: "auth_bg_url", value: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1200&auto=format&fit=crop", group: "branding" },

        // Branding & Theme (New)
        { key: "admin_primary_color", value: "#159dd8", group: "appearance" },
        { key: "admin_secondary_color", value: "#0a4b67", group: "appearance" },
        { key: "admin_logo_url", value: "/logo/logo.png", group: "appearance" },
        { key: "marketplace_primary_color", value: "#1D9AD2", group: "appearance" },
        { key: "marketplace_secondary_color", value: "#045880", group: "appearance" },
        { key: "marketplace_tertiary_color", value: "#E8F5FA", group: "appearance" },

        // Payment (DOKU / Jokul)
        { key: "payment_doku_is_active", value: "true", group: "payment" },

        // Shipping (Biteship Origin)
        { key: "shipping_origin_name", value: "PE Skinpro ID", group: "shipping" },
        { key: "shipping_origin_phone", value: "08123456789", group: "shipping" },
        { key: "shipping_origin_address", value: "Jl. Dukuh Patra II No.75, RT.1/RW.13, Menteng Dalam, Kec. Tebet, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12870", group: "shipping" },
        { key: "shipping_origin_postal_code", value: "12870", group: "shipping" },
        { key: "shipping_origin_postal_code", value: "12870", group: "shipping" },
        { key: "shipping_auto_update_shipped", value: "true", group: "shipping" },
        { key: "shipping_auto_complete_delivered", value: "true", group: "shipping" },

        // About Page Content
        { key: "about_hero_title", value: "Aura of Confidence.", group: "about" },
        { key: "about_hero_subtitle", value: "Since 2014 — A Decade of Excellence", group: "about" },
        { key: "about_hero_description", value: "Menghadirkan harmoni sempurna antara presisi teknologi Jerman dan kemurnian bahan natural vegan.", group: "about" },
        { key: "about_hero_image_url", value: "/images/about/hero.png", group: "about" },
        { key: "about_vision_small_title", value: "Chapter I: The Vision", group: "about" },
        { key: "about_vision_heading", value: "Standar Baru Kecantikan Modern.", group: "about" },
        { key: "about_vision_description", value: "PE Skin Professional lahir dari kegelisahan akan sulitnya mendapatkan skincare berkualitas tinggi dengan harga yang jujur. Kami percaya bahwa setiap inci kulit Anda berhak mendapatkan perawatan terbaik tanpa kompromi.", group: "about" },
        { key: "about_vision_image_url", value: "/images/about/botanical.png", group: "about" },
        { key: "about_vision_quote", value: "Alam memberikan segalanya, sains menjadikannya sempurna.", group: "about" },
        { key: "about_science_small_title", value: "Chapter II: Science", group: "about" },
        { key: "about_science_heading", value: "Teknologi yang Teruji Klinis.", group: "about" },
        { key: "about_science_description", value: "Setiap tetes produk PE Skin mengandung formula yang telah melalui riset mendalam. Kami mengadopsi standar laboratorium Jerman untuk memastikan setiap bahan aktif bekerja optimal pada lapisan kulit terdalam tanpa efek samping berbahaya.", group: "about" },
        { key: "about_science_image_url", value: "/images/about/lab.png", group: "about" },
        { key: "about_science_stat1_value", value: "100%", group: "about" },
        { key: "about_science_stat1_label", value: "Dermatologically Tested", group: "about" },
        { key: "about_science_stat2_value", value: "GMP", group: "about" },
        { key: "about_science_stat2_label", value: "Standard Certification", group: "about" },
        { key: "about_commitment_title", value: "Janji Kami Kepada Anda", group: "about" },
        { key: "about_commitment_subtitle", value: "Lebih dari sekadar produk, ini adalah komitmen jangka panjang untuk kesehatan kulit Anda.", group: "about" },
        { key: "about_commitment_card1_title", value: "Clean Beauty", group: "about" },
        { key: "about_commitment_card1_desc", value: "Bebas dari merkuri, paraben, dan bahan kimia berbahaya lainnya.", group: "about" },
        { key: "about_commitment_card2_title", value: "Vegan Formula", group: "about" },
        { key: "about_commitment_card2_desc", value: "100% bahan nabati tanpa keterlibatan hewan dalam seluruh proses.", group: "about" },
        { key: "about_commitment_card3_title", value: "Innovation", group: "about" },
        { key: "about_commitment_card3_desc", value: "Update berkelanjutan mengikuti inovasi terbaru industri kecantikan.", group: "about" },
        { key: "about_commitment_card4_title", value: "Result Driven", group: "about" },
        { key: "about_commitment_card4_desc", value: "Fokus pada hasil nyata yang mencerahkan dan memperbaiki tekstur kulit.", group: "about" },
        { key: "about_cta_title", value: "Siap Untuk Kulit", group: "about" },
        { key: "about_cta_highlight", value: "Impian Anda?", group: "about" },
    ];

    // Remove the early exit if count > 0 to allow adding NEW keys to existing databases
    for (const item of initialData) {
        const [setting, created] = await GeneralSettings.findOrCreate({
            where: { key: item.key },
            defaults: item
        });

        // IF key exists but value is empty OR is a broken local path (starts with /)
        if (!created && (
            setting.value === "" ||
            setting.value === null ||
            (setting.value.startsWith("/") && !item.key.includes("logo") && !item.key.includes("icon"))
        )) {
            setting.value = item.value;
            await setting.save();
        }
    }
    console.log("Initial settings checked/seeded.");
};
