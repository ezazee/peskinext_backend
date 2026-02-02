import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";
import Users from "../../user/models/UserModel";
import Address from "../../user/models/AddressModel";
import OrderItems from "./OrderItemModel";

interface OrderAttributes {
    id: string;
    user_id: string;
    address_id: string;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    total_amount: number;
    shipping_cost: number;
    discount: number;
    courier: string;
    created_at?: Date;
    updated_at?: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, "id"> { }

class Orders extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
    public id!: string;
    public user_id!: string;
    public address_id!: string;
    public status!: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    public total_amount!: number;
    public shipping_cost!: number;
    public discount!: number;
    public courier!: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Orders.init(
    {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        user_id: { type: DataTypes.UUID, allowNull: false },
        address_id: { type: DataTypes.UUID, allowNull: false },
        status: {
            type: DataTypes.ENUM("pending", "processing", "shipped", "delivered", "cancelled"),
            defaultValue: "pending",
        },
        total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        shipping_cost: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        discount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
        courier: { type: DataTypes.STRING, allowNull: false },
    },
    {
        sequelize: db,
        tableName: "orders",
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

Users.hasMany(Orders, { foreignKey: "user_id", as: "orders" });
Orders.belongsTo(Users, { foreignKey: "user_id", as: "user" });

Address.hasMany(Orders, { foreignKey: "address_id", as: "orders" });
Orders.belongsTo(Address, { foreignKey: "address_id", as: "address" });

export default Orders;
