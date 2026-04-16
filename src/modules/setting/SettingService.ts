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
    const upsertData = Object.entries(settingsData).map(([key, value]) => ({
        key,
        value,
        group: "general" // Default group if creating new
    }));

    // Use bulkCreate with updateOnDuplicate to perform all updates in ONE round-trip
    await GeneralSettings.bulkCreate(upsertData, {
        updateOnDuplicate: ["value", "group"]
    });

    return await getSettings(); // Return refreshed settings
};


/**
 * Seed initial data if keys are missing
 */
export const seedInitialSettings = async () => {
    const initialData = [
        // Identity
        { key: "store_name", value: "PE Skin Professional", group: "identity" },
        { key: "brand_description", value: "Brand skincare lokal dengan standar internasional.", group: "identity" },
        { key: "copyright_text", value: `© ${new Date().getFullYear()} PE Skin Professional. All rights reserved.`, group: "identity" },

        // SEO
        { key: "seo_title", value: "PE Skin Professional | Skincare Premium Lokal", group: "seo" },
        { key: "seo_description", value: "PE Skin Professional - Skin care lokal premium dengan standar internasional.", group: "seo" },

        // Operational
        { key: "maintenance_mode", value: "false", group: "operational" },
        { key: "announcement_active", value: "false", group: "operational" },
        { key: "announcement_text", value: "Selamat Datang di Toko Resmi PE Skin Professional!", group: "operational" },

        // Branding (Placeholders)
        { key: "logo_url", value: "", group: "branding" },
        { key: "favicon_url", value: "", group: "branding" },
        { key: "admin_primary_color", value: "#159dd8", group: "appearance" },

        // Payment (DOKU / Jokul)
        { key: "payment_doku_is_active", value: "true", group: "payment" },

        // Shipping (Biteship Origin)
        { key: "shipping_origin_name", value: "PE Skinpro ID", group: "shipping" },
        { key: "shipping_origin_phone", value: "08123456789", group: "shipping" },
        { key: "shipping_origin_address", value: "Jakarta, Indonesia", group: "shipping" },
        { key: "shipping_origin_postal_code", value: "12870", group: "shipping" },
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
