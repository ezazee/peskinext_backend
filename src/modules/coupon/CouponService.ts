import Coupons from "./models/CouponModel";

export const getAllCoupons = async () => {
    const coupons = await Coupons.findAll({
        where: { is_enabled: true, is_public: true }
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

export const checkCoupon = async (code: string, total: number = 0, regionTag?: string) => {
    const coupon = await Coupons.findOne({ where: { id: code, is_enabled: true } });
    if (!coupon) throw new Error("Kupon tidak ditemukan atau tidak aktif");

    const cJson = coupon.toJSON() as any;

    // 1. Check Expiration
    if (cJson.expired_at && new Date(cJson.expired_at) < new Date()) {
        throw new Error("Kupon sudah kadaluarsa");
    }

    // 2. Check Usage Limit
    if (cJson.usage_limit !== null && cJson.usage_count >= cJson.usage_limit) {
        throw new Error("Kuota penggunaan kupon sudah habis");
    }

    // 3. Check Min Purchase
    if (total < Number(cJson.min_purchase)) {
        throw new Error(`Minimal pembelian untuk kupon ini adalah Rp${Number(cJson.min_purchase).toLocaleString('id-ID')}`);
    }

    // 4. Check Regions
    const conditions = cJson.conditions || {};
    if (conditions.regions && conditions.regions.length > 0) {
        if (!regionTag) {
            throw new Error(`Kupon ini hanya berlaku di wilayah: ${conditions.regions.join(", ")}`);
        }
        const isRegionMatch = conditions.regions.includes(regionTag);
        if (!isRegionMatch) {
            throw new Error(`Kupon ini tidak dapat digunakan di wilayah Anda (${regionTag}). Hanya berlaku untuk: ${conditions.regions.join(", ")}`);
        }
    }

    // 5. Calculate Discount
    let discount = 0;
    if (cJson.discount_type === 'percent') {
        discount = (total * Number(cJson.discount_value)) / 100;
        if (cJson.max_discount > 0 && discount > Number(cJson.max_discount)) {
            discount = Number(cJson.max_discount);
        }
    } else {
        discount = Number(cJson.discount_value);
    }

    return {
        valid: true,
        discount: Math.floor(discount),
        voucher: {
            id: coupon.id,
            title: coupon.title,
            subtitle: coupon.subtitle,
            type: coupon.type,
            savingLabel: cJson.discount_type === 'percent' ? `Hemat ${cJson.discount_value}%` : `Hemat Rp${Number(cJson.discount_value).toLocaleString('id-ID')}`,
            validTo: coupon.expired_at,
            conditions: coupon.conditions
        }
    };
};
