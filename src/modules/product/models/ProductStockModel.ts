import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";
import ProductVariants from "./ProductVariantModel";

interface ProductStockAttributes {
    id: string;
    product_id?: string; // Sometimes used directly with product (legacy support in deleteProduct?)
    variant_id: number;
    channel: "default" | "website" | "pos" | "tiktok" | "shopee";
    qty: number;
    tanggal_masuk: Date;
    tanggal_expired: Date;
    status: "expired" | "noexpired";
    created_at?: Date;
    updated_at?: Date;
}

interface ProductStockCreationAttributes extends Optional<ProductStockAttributes, "id" | "channel" | "qty" | "status"> { }

class ProductStocks extends Model<ProductStockAttributes, ProductStockCreationAttributes> implements ProductStockAttributes {
    public id!: string;
    public product_id!: string;
    public variant_id!: number;
    public channel!: "default" | "website" | "pos" | "tiktok" | "shopee";
    public qty!: number;
    public tanggal_masuk!: Date;
    public tanggal_expired!: Date;
    public status!: "expired" | "noexpired";
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

ProductStocks.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        variant_id: { type: DataTypes.INTEGER, allowNull: false },
        // product_id is checked in controller but not in original model definition explicitly shown as a column, 
        // but migration might exist. Adding optional product_id just in case, or skipping if not in list.
        // Original model (ProductVariantStocksModel.js) did NOT have product_id.
        // However, controller lines 168: product_id: product.id is used in bulkCreate.
        // So it MUST be in the database. I will add it.
        product_id: { type: DataTypes.UUID, allowNull: true },

        channel: {
            type: DataTypes.ENUM("default", "website", "pos", "tiktok", "shopee"),
            defaultValue: "default",
        },
        qty: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        tanggal_masuk: { type: DataTypes.DATE, allowNull: false },
        tanggal_expired: { type: DataTypes.DATE, allowNull: false },
        status: {
            type: DataTypes.ENUM("expired", "noexpired"),
            allowNull: true,
            defaultValue: "noexpired",
        },
    },
    {
        sequelize: db,
        tableName: "product_variant_stocks",
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

ProductVariants.hasMany(ProductStocks, { foreignKey: "variant_id", as: "stocks" });
ProductStocks.belongsTo(ProductVariants, { foreignKey: "variant_id" });

export default ProductStocks;
