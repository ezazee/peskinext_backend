import Coupons from "./models/CouponModel";

export const getAllCoupons = async () => {
    const coupons = await Coupons.findAll({
        where: { is_enabled: true }
    });

    // Format to match frontend
    return coupons.map(c => {
        const cJson = c.toJSON() as any;
        return {
            id: c.id, // String ID e.g. "promo-10"
            title: c.title,
            subtitle: c.subtitle,
            type: c.type,
            enabled: c.is_enabled,
            savingLabel: cJson.discount_type === 'percent' ? `Hemat ${cJson.discount_value}%` : `Hemat Rp${Number(cJson.discount_value).toLocaleString('id-ID')}`,
            validTo: c.expired_at,
            conditions: c.conditions
        };
    });
};

export const checkCoupon = async (code: string) => {
    const coupon = await Coupons.findOne({ where: { id: code, is_enabled: true } });
    if (!coupon) throw new Error("Kupon tidak ditemukan atau tidak aktif");
    return coupon;
};
