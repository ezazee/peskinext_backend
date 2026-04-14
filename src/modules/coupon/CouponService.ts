import { Op } from "sequelize";
import Coupons from "./models/CouponModel";

export const getAllCoupons = async (isAdmin: boolean = false) => {
    const where: any = {};
    if (!isAdmin) {
        where.is_enabled = true;
        where.is_public = true;
        
        // Auto-hide expired
        where[Op.or] = [
            { expired_at: null },
            { expired_at: { [Op.gt]: new Date() } }
        ];

        // Auto-hide sold out
        where[Op.and] = [
            {
                [Op.or]: [
                    { usage_limit: null },
                    { usage_limit: { [Op.gt]: { [Op.col]: 'usage_count' } } }
                ]
            }
        ];
    }

    const coupons = await Coupons.findAll({
        where,
        order: [['created_at', 'DESC']]
    });

    // Format to match frontend
    return coupons.map(c => {
        const cJson = c.toJSON() as any;
        const now = new Date();
        const expiredAt = c.expired_at ? new Date(c.expired_at) : null;
        const isExpired = expiredAt && expiredAt < now;
        const isSoldOut = c.usage_limit !== null && c.usage_count >= c.usage_limit;

        let status = "RUNNING";
        if (!c.is_enabled) status = "PAUSED";
        else if (isExpired) status = "EXPIRED";
        else if (isSoldOut) status = "SOLD_OUT";

        return {
            id: c.id, 
            title: c.title,
            subtitle: c.subtitle,
            type: c.type,
            discount_type: c.discount_type,
            discount_value: Number(c.discount_value),
            min_purchase: Number(c.min_purchase),
            max_discount: Number(c.max_discount),
            is_enabled: c.is_enabled,
            is_public: c.is_public,
            usage_limit: c.usage_limit,
            usage_count: c.usage_count,
            remaining_quota: c.usage_limit ? Math.max(0, c.usage_limit - c.usage_count) : null,
            status,
            savingLabel: cJson.discount_type === 'percent' ? `Hemat ${cJson.discount_value}%` : `Hemat Rp${Number(cJson.discount_value).toLocaleString('id-ID')}`,
            expired_at: c.expired_at,
            conditions: c.conditions,
            created_at: c.created_at
        };
    });
};

export const createCoupon = async (data: any) => {
    // Check if code already exists
    const existing = await Coupons.findByPk(data.id);
    if (existing) throw new Error("Kode kupon sudah digunakan");

    return await Coupons.create(data);
};

export const updateCoupon = async (id: string, data: any) => {
    const coupon = await Coupons.findByPk(id);
    if (!coupon) throw new Error("Kupon tidak ditemukan");

    return await coupon.update(data);
};

export const deleteCoupon = async (id: string) => {
    const coupon = await Coupons.findByPk(id);
    if (!coupon) throw new Error("Kupon tidak ditemukan");

    await coupon.destroy();
    return true;
};

export const getCouponById = async (id: string) => {
    const coupon = await Coupons.findByPk(id);
    if (!coupon) throw new Error("Kupon tidak ditemukan");
    return coupon;
};

export const useCoupon = async (id: string, transaction?: any) => {
    const coupon = await Coupons.findByPk(id, { transaction });
    if (!coupon) {
        console.warn(`⚠️ Coupon ${id} not found for usage tracking.`);
        return;
    }
    coupon.usage_count = (coupon.usage_count || 0) + 1;
    await coupon.save({ transaction });
};

export const restoreCoupon = async (id: string, transaction?: any) => {
    const coupon = await Coupons.findByPk(id, { transaction });
    if (!coupon) return;
    if (coupon.usage_count > 0) {
        coupon.usage_count -= 1;
        await coupon.save({ transaction });
    }
};

export const checkCoupon = async (code: string, total: number = 0, regionTag?: string, isManual: boolean = false) => {
    const coupon = await Coupons.findOne({ where: { id: code, is_enabled: true } });
    if (!coupon) throw new Error("Kupon tidak ditemukan atau tidak aktif");

    // Logic: Public vouchers should only be selected from the list, not typed manually
    if (isManual && coupon.is_public) {
        throw new Error("Voucher ini tersedia di daftar Voucher & Promo, silakan pilih langsung dari sana.");
    }

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
            expired_at: coupon.expired_at,
            conditions: coupon.conditions
        }
    };
};
