import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";
import ProductVariants from "./ProductVariantModel";

interface ProductVariantPriceAttributes {
    id: string;
    variant_id: number;
    channel: "default" | "website" | "pos" | "tiktok" | "shopee" | "tokopedia";
    price: number;
    price_strikethrough?: number;
    created_at?: Date;
    updated_at?: Date;
}

interface ProductVariantPriceCreationAttributes extends Optional<ProductVariantPriceAttributes, "id" | "channel"> { }

class ProductVariantPrices extends Model<ProductVariantPriceAttributes, ProductVariantPriceCreationAttributes> implements ProductVariantPriceAttributes {
    public id!: string;
    public variant_id!: number;
    public channel!: "default" | "website" | "pos" | "tiktok" | "shopee" | "tokopedia";
    public price!: number;
    public price_strikethrough!: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

ProductVariantPrices.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        variant_id: { type: DataTypes.INTEGER, allowNull: false },
        channel: {
            type: DataTypes.ENUM("default", "website", "pos", "tiktok", "shopee", "tokopedia"),
            defaultValue: "default",
        },
        price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        price_strikethrough: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    },
    {
        sequelize: db,
        tableName: "product_variant_prices",
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

ProductVariants.hasMany(ProductVariantPrices, { foreignKey: "variant_id", as: "prices" });
ProductVariantPrices.belongsTo(ProductVariants, { foreignKey: "variant_id" });

export default ProductVariantPrices;
