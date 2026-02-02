import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";
import Users from "../../user/models/UserModel";
import Products from "../../product/models/ProductModel";
import ProductVariants from "../../product/models/ProductVariantModel";

interface CartAttributes {
    id: number;
    user_id: string;
    product_id: string;
    variant_id?: number | null;
    quantity: number;
    created_at?: Date;
    updated_at?: Date;
}

interface CartCreationAttributes extends Optional<CartAttributes, "id"> { }

class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
    public id!: number;
    public user_id!: string;
    public product_id!: string;
    public variant_id!: number | null;
    public quantity!: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // associations
    public product?: Products;
    public variant?: ProductVariants;
}

Cart.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        user_id: { type: DataTypes.UUID, allowNull: false },
        product_id: { type: DataTypes.UUID, allowNull: false },
        variant_id: { type: DataTypes.INTEGER, allowNull: true },
        quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    },
    {
        sequelize: db,
        tableName: "carts",
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

Users.hasMany(Cart, { foreignKey: "user_id", as: "cart" });
Cart.belongsTo(Users, { foreignKey: "user_id", as: "user" });

Products.hasMany(Cart, { foreignKey: "product_id", as: "carts" });
Cart.belongsTo(Products, { foreignKey: "product_id", as: "product" });

ProductVariants.hasMany(Cart, { foreignKey: "variant_id", as: "carts" });
Cart.belongsTo(ProductVariants, { foreignKey: "variant_id", as: "variant" });

export default Cart;
