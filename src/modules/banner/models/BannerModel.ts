import { DataTypes, Model } from "sequelize";
import db from "../../../config/database";

interface BannerAttributes {
    id?: number;
    section: "main" | "carousel" | "tiles" | "popup" | "welcome" | "promo_mobile" | "promo_desktop" | "gallery_carousel" | "gallery_single" | "bundle";
    image_url: string;
    alt_text: string;
    redirect_url?: string;
    sort_order?: number;
    is_active?: boolean;
}

class Banners extends Model<BannerAttributes> implements BannerAttributes {
    public id!: number;
    public section!: "main" | "carousel" | "tiles" | "popup" | "welcome" | "promo_mobile" | "promo_desktop" | "gallery_carousel" | "gallery_single" | "bundle";
    public image_url!: string;
    public alt_text!: string;
    public redirect_url!: string;
    public sort_order!: number;
    public is_active!: boolean;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Banners.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    section: {
        type: DataTypes.ENUM("main", "carousel", "tiles", "popup", "welcome", "promo_mobile", "promo_desktop", "gallery_carousel", "gallery_single", "bundle"),
        allowNull: false
    },
    image_url: { type: DataTypes.TEXT, allowNull: false },
    alt_text: { type: DataTypes.STRING, allowNull: false },
    redirect_url: { type: DataTypes.STRING, allowNull: true },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
    sequelize: db,
    tableName: "banners",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});

export default Banners;
