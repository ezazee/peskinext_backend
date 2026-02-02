import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";
import Orders from "./OrderModel";

interface OrderStatusHistoryAttributes {
    id: number;
    order_id: string;
    status: string;
    note?: string;
    created_at?: Date;
    updated_at?: Date;
}

interface OrderStatusHistoryCreationAttributes extends Optional<OrderStatusHistoryAttributes, "id"> { }

class OrderStatusHistory extends Model<OrderStatusHistoryAttributes, OrderStatusHistoryCreationAttributes> implements OrderStatusHistoryAttributes {
    public id!: number;
    public order_id!: string;
    public status!: string;
    public note!: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

OrderStatusHistory.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        order_id: { type: DataTypes.UUID, allowNull: false },
        status: { type: DataTypes.STRING, allowNull: false },
        note: { type: DataTypes.TEXT, allowNull: true },
    },
    {
        sequelize: db,
        tableName: "order_status_histories",
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

Orders.hasMany(OrderStatusHistory, { foreignKey: "order_id", as: "history" });
OrderStatusHistory.belongsTo(Orders, { foreignKey: "order_id" });

export default OrderStatusHistory;
