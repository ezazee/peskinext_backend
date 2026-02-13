import db from "../config/database";
import Coupons from "../modules/coupon/models/CouponModel";

const seed = async () => {
    try {
        await db.authenticate();
        console.log("Connected to DB for seeding coupons...");

        const vouchers = [
            {
                id: "PEBARU20",
                title: "Voucher Pengguna Baru",
                subtitle: "Potongan Rp 20.000",
                type: "promo" as const,
                discount_type: "fixed" as const,
                discount_value: 20000,
                min_purchase: 100000,
                usage_limit: 50,
                is_enabled: true,
                expired_at: new Date("2026-12-31"),
            },
            {
                id: "PESKIN10",
                title: "Diskon SkinPro 10%",
                subtitle: "Hemat 10% s/d Rp 50rb",
                type: "promo" as const,
                discount_type: "percent" as const,
                discount_value: 10,
                min_purchase: 50000,
                max_discount: 50000,
                usage_limit: null, // Unlimited
                is_enabled: true,
                expired_at: new Date("2026-12-31"),
            },
            {
                id: "FREEONGKIR",
                title: "Gratis Ongkir",
                subtitle: "Potongan Ongkir Rp 20.000",
                type: "shipping" as const,
                discount_type: "fixed" as const,
                discount_value: 20000,
                min_purchase: 150000,
                usage_limit: null, // Unlimited
                is_enabled: true,
                expired_at: new Date("2026-12-31"),
            }
        ];

        for (const v of vouchers) {
            const existing = await Coupons.findByPk(v.id);
            if (existing) {
                console.log(`Voucher ${v.id} already exists, skipping...`);
                continue;
            }
            await Coupons.create(v);
            console.log(`Voucher ${v.id} seeded successfully!`);
        }

        console.log("Seeding coupons completed!");
    } catch (e) {
        console.error("Error seeding coupons:", e);
    }
};

seed();
