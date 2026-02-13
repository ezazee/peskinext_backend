import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";

interface CouponAttributes {
    id: string;
    title: string;
    subtitle?: string;
    type: "shipping" | "promo";
    discount_type: "percent" | "fixed";
    discount_value: number;
    min_purchase?: number;
    max_discount?: number;
    is_enabled?: boolean;
    is_public?: boolean;
    conditions?: any;
    usage_limit?: number | null; // null means unlimited
    usage_count?: number;
    expired_at?: Date;
    created_at?: Date;
    updated_at?: Date;
}

interface CouponCreationAttributes extends Optional<CouponAttributes, "subtitle" | "min_purchase" | "max_discount" | "is_enabled" | "is_public" | "conditions" | "usage_limit" | "usage_count"> { }

class Coupons extends Model<CouponAttributes, CouponCreationAttributes> implements CouponAttributes {
    public id!: string;
    public title!: string;
    public subtitle!: string;
    public type!: "shipping" | "promo";
    public discount_type!: "percent" | "fixed";
    public discount_value!: number;
    public min_purchase!: number;
    public max_discount!: number;
    public is_enabled!: boolean;
    public is_public!: boolean;
    public conditions!: any;
    public usage_limit!: number | null;
    public usage_count!: number;
    public expired_at!: Date;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Coupons.init(
    {
        id: { type: DataTypes.STRING, primaryKey: true }, // e.g. "promo-12"
        title: { type: DataTypes.STRING, allowNull: false },
        subtitle: { type: DataTypes.STRING },
        type: { type: DataTypes.ENUM("shipping", "promo"), allowNull: false },

        // Backend logic fields
        discount_type: { type: DataTypes.ENUM("percent", "fixed"), allowNull: false },
        discount_value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },

        min_purchase: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
        max_discount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },

        is_enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
        is_public: { type: DataTypes.BOOLEAN, defaultValue: true },
        conditions: { type: DataTypes.JSON }, // JSON for flexible rules

        usage_limit: { type: DataTypes.INTEGER, allowNull: true },
        usage_count: { type: DataTypes.INTEGER, defaultValue: 0 },

        expired_at: { type: DataTypes.DATE },
    },
    {
        sequelize: db,
        tableName: "coupons",
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default Coupons;
