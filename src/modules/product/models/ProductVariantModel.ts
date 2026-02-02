import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";
import Products from "./ProductModel";

interface ProductVariantAttributes {
    id: number;
    product_id: string;
    variant_name: string;
    weight?: string;
    created_at?: Date;
    updated_at?: Date;
}

interface ProductVariantCreationAttributes extends Optional<ProductVariantAttributes, "id"> { }

class ProductVariants extends Model<ProductVariantAttributes, ProductVariantCreationAttributes> implements ProductVariantAttributes {
    public id!: number;
    public product_id!: string;
    public variant_name!: string;
    public weight!: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

ProductVariants.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        product_id: { type: DataTypes.UUID, allowNull: false },
        variant_name: { type: DataTypes.STRING, allowNull: false },
        weight: { type: DataTypes.STRING, allowNull: true },
    },
    {
        sequelize: db,
        tableName: "product_variants",
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

Products.hasMany(ProductVariants, { foreignKey: "product_id", as: "variants" });
ProductVariants.belongsTo(Products, { foreignKey: "product_id" });

export default ProductVariants;
