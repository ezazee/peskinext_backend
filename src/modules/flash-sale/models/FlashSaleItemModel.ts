import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";
import FlashSale from "./FlashSaleModel";
import Products from "../../product/models/ProductModel";

interface FlashSaleItemAttributes {
    id: string;
    flash_sale_id: string;
    product_id: string;
    variant_id: number;
    flash_sale_price: number;
    stock_limit?: number;
    sold_count?: number;
    created_at?: Date;
    updated_at?: Date;
}

interface FlashSaleItemCreationAttributes extends Optional<FlashSaleItemAttributes, "id" | "stock_limit" | "sold_count"> { }

class FlashSaleItem extends Model<FlashSaleItemAttributes, FlashSaleItemCreationAttributes> implements FlashSaleItemAttributes {
    public id!: string;
    public flash_sale_id!: string;
    public product_id!: string;
    public variant_id!: number;
    public flash_sale_price!: number;
    public stock_limit!: number;
    public sold_count!: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

FlashSaleItem.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        flash_sale_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "flash_sales",
                key: "id"
            }
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "products",
                key: "id"
            }
        },
        variant_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "product_variants",
                key: "id"
            }
        },
        flash_sale_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        stock_limit: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        sold_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    },
    {
        sequelize: db,
        tableName: "flash_sale_items",
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

// Define associations
FlashSale.hasMany(FlashSaleItem, { foreignKey: "flash_sale_id", as: "items" });
FlashSaleItem.belongsTo(FlashSale, { foreignKey: "flash_sale_id", as: "campaign" });
FlashSaleItem.belongsTo(Products, { foreignKey: "product_id", as: "product" });
FlashSaleItem.belongsTo(require("../../product/models/ProductVariantModel").default, { foreignKey: "variant_id", as: "variant" });

export default FlashSaleItem;
