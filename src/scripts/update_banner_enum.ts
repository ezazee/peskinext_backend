import db from "../config/database";

const updateEnum = async () => {
    try {


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

            } catch (e: any) {

            }
        }


        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

updateEnum();
