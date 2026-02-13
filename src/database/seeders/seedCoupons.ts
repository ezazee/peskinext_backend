import Coupons from "../../modules/coupon/models/CouponModel";

// Data for seeding
const vouchers = [
    {
        id: "PESKINJABO",
        title: "Promo Jabodetabek",
        subtitle: "Khusus wilayah Jabodetabek",
        type: "promo",
        discount_type: "fixed",
        discount_value: 25000,
        min_purchase: 150000,
        is_enabled: true,
        conditions: { regions: ["Jabodetabek"] }
    },
    {
        id: "PEBARU20",
        title: "Voucher Pengguna Baru",
        subtitle: "Potongan Rp 20.000",
        type: "promo",
        discount_type: "fixed",
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
        type: "promo",
        discount_type: "percent",
        discount_value: 10,
        min_purchase: 50000,
        max_discount: 50000,
        usage_limit: null,
        is_enabled: true,
        expired_at: new Date("2026-12-31"),
    },
    {
        id: "FREEONGKIR",
        title: "Gratis Ongkir",
        subtitle: "Potongan Ongkir Rp 20.000",
        type: "shipping",
        discount_type: "fixed",
        discount_value: 20000,
        min_purchase: 150000,
        usage_limit: null,
        is_enabled: true,
        conditions: { regions: ["Jabodetabek"] },
        expired_at: new Date("2026-12-31"),
    },
    {
        id: "ship-ongkir-10",
        title: "Gratis Ongkir s/d Rp10.000",
        subtitle: "Tanpa minimum belanja, khusus Jabodetabek",
        type: "shipping",
        discount_type: "fixed",
        discount_value: 10000,
        is_enabled: true,
        conditions: { regions: ["Jabodetabek"] },
    },
    {
        id: "promo-12",
        title: "Diskon 12% semua produk",
        subtitle: "Maks diskon Rp30.000 • Tanpa minimum belanja",
        type: "promo",
        discount_type: "percent",
        discount_value: 12,
        max_discount: 30000,
        is_enabled: true,
    }
];

export const seedCoupons = async () => {
    console.log("Seeding Coupons...");
    try {
        await Coupons.sync({ alter: true });
        // We use alter true to add missing columns, then we can upsert or reseed.
        // Truncate only if you want to start fresh every time, which is usually fine for seeders.
        await Coupons.destroy({ truncate: true, cascade: true });

        for (const v of vouchers) {
            await Coupons.create({
                id: v.id,
                title: v.title,
                subtitle: v.subtitle,
                type: v.type as any,
                discount_type: v.discount_type as any,
                discount_value: v.discount_value,
                min_purchase: v.min_purchase || 0,
                max_discount: v.max_discount || 0,
                usage_limit: v.usage_limit ?? null,
                usage_count: 0,
                is_enabled: v.is_enabled !== false,
                is_public: !["PEBARU20", "PESKIN10"].includes(v.id), // Private codes
                conditions: v.conditions,
                expired_at: v.expired_at || new Date("2026-12-31")
            } as any);
        }
        console.log("✅ Coupons Seeded successfully");
    } catch (error) {
        console.error("❌ Failed to seed coupons:", error);
    }
};

if (require.main === module) {
    seedCoupons();
}
