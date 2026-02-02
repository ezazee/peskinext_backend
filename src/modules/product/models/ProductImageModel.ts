import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";
import Products from "./ProductModel";

interface ProductImageAttributes {
    id: string;
    product_id: string;
    image_url: string;
    alt_text?: string;
    created_at?: Date;
    updated_at?: Date;
}

interface ProductImageCreationAttributes extends Optional<ProductImageAttributes, "id"> { }

class ProductImages extends Model<ProductImageAttributes, ProductImageCreationAttributes> implements ProductImageAttributes {
    public id!: string;
    public product_id!: string;
    public image_url!: string;
    public alt_text!: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

ProductImages.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        product_id: { type: DataTypes.UUID, allowNull: false },
        image_url: { type: DataTypes.STRING, allowNull: false },
        alt_text: { type: DataTypes.STRING, allowNull: true },
    },
    {
        sequelize: db,
        tableName: "product_images",
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

Products.hasMany(ProductImages, { foreignKey: "product_id", as: "images" });
ProductImages.belongsTo(Products, { foreignKey: "product_id" });

export default ProductImages;
