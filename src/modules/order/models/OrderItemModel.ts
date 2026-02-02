import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";
import Orders from "./OrderModel";
import Products from "../../product/models/ProductModel";

interface OrderItemAttributes {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price: number;
    variant_id?: number;
    created_at?: Date;
    updated_at?: Date;
}

interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, "id"> { }

class OrderItems extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
    public id!: string;
    public order_id!: string;
    public product_id!: string;
    public quantity!: number;
    public price!: number;
    public variant_id!: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

OrderItems.init(
    {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        order_id: { type: DataTypes.UUID, allowNull: false },
        product_id: { type: DataTypes.UUID, allowNull: false },
        quantity: { type: DataTypes.INTEGER, allowNull: false },
        price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        variant_id: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
        sequelize: db,
        tableName: "order_items",
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

Orders.hasMany(OrderItems, { foreignKey: "order_id", as: "items" });
OrderItems.belongsTo(Orders, { foreignKey: "order_id" });

Products.hasMany(OrderItems, { foreignKey: "product_id", as: "order_items" });
OrderItems.belongsTo(Products, { foreignKey: "product_id" });

export default OrderItems;
