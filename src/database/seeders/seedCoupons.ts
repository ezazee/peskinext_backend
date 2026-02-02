import Coupons from "../../modules/coupon/models/CouponModel";

// Data copied from frontend/src/data/voucher.ts
const vouchers = [
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
    },
    // Add more as needed
    {
        id: "promo-05",
        title: "Diskon 5% semua produk",
        subtitle: "Maks diskon Rp10.000 • Tanpa minimum belanja",
        type: "promo",
        discount_type: "percent",
        discount_value: 5,
        max_discount: 10000,
        is_enabled: true,
    }
];

export const seedCoupons = async () => {
    console.log("Seeding Coupons...");
    await Coupons.sync({ alter: true });
    await Coupons.destroy({ truncate: true, cascade: true });

    try {
        for (const v of vouchers) {
            await Coupons.create({
                id: v.id,
                title: v.title,
                subtitle: v.subtitle,
                type: v.type as any,
                discount_type: v.discount_type as any,
                discount_value: v.discount_value,
                max_discount: v.max_discount,
                is_enabled: v.is_enabled,
                conditions: v.conditions
            } as any);
        }
        console.log("✅ Coupons Seeded");
    } catch (error) {
        console.error("❌ Failed to seed coupons:", error);
    }
};

if (require.main === module) {
    seedCoupons();
}
