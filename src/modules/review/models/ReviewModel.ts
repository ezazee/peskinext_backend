import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";
import Users from "../../user/models/UserModel";
import Products from "../../product/models/ProductModel";

interface ReviewAttributes {
    id: number;
    user_id: string;
    product_id: string;
    variant_id?: number;
    rating: number;
    comment?: string;
    images?: string;
    created_at?: Date;
    updated_at?: Date;
}

interface ReviewCreationAttributes extends Optional<ReviewAttributes, "id"> { }

class Reviews extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
    public id!: number;
    public user_id!: string;
    public product_id!: string;
    public variant_id!: number;
    public rating!: number;
    public comment!: string;
    public images!: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Reviews.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        user_id: { type: DataTypes.UUID, allowNull: false },
        product_id: { type: DataTypes.UUID, allowNull: false },
        variant_id: { type: DataTypes.INTEGER, allowNull: true },
        rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
        comment: { type: DataTypes.TEXT },
        images: { type: DataTypes.TEXT }, // JSON stringified array of URLs
    },
    {
        sequelize: db,
        tableName: "reviews",
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

Users.hasMany(Reviews, { foreignKey: "user_id", as: "reviews" });
Reviews.belongsTo(Users, { foreignKey: "user_id", as: "user" });

Products.hasMany(Reviews, { foreignKey: "product_id", as: "reviews" });
Reviews.belongsTo(Products, { foreignKey: "product_id", as: "product" });

export default Reviews;
