import db from "../config/database";

const updateEnum = async () => {
    try {
        console.log("Updating enum_banners_section...");

        const values = [
            'welcome',
            'promo_mobile',
            'promo_desktop',
            'gallery_carousel',
            'gallery_single',
            'bundle'
        ];

        for (const value of values) {
            try {
                await db.query(`ALTER TYPE "enum_banners_section" ADD VALUE IF NOT EXISTS '${value}';`);
                console.log(`Added value: ${value}`);
            } catch (e: any) {
                console.log(`Error adding ${value} (might already exist): ${e.message}`);
            }
        }

        console.log("Enum update completed.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

updateEnum();
