import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";
import Orders from "../../order/models/OrderModel";

interface TransactionAttributes {
    id: number;
    order_id: string;
    invoice_number: string;
    amount: number;
    status: "pending" | "success" | "failed" | "expired";
    payment_channel?: string;
    doku_response?: any;
    created_at?: Date;
    updated_at?: Date;
}

interface TransactionCreationAttributes extends Optional<TransactionAttributes, "id"> { }

class Transactions extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
    public id!: number;
    public order_id!: string;
    public invoice_number!: string;
    public amount!: number;
    public status!: "pending" | "success" | "failed" | "expired";
    public payment_channel!: string;
    public doku_response!: any;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Transactions.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        order_id: { type: DataTypes.UUID, allowNull: false },
        invoice_number: { type: DataTypes.STRING, unique: true, allowNull: false },
        amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        status: {
            type: DataTypes.ENUM("pending", "success", "failed", "expired"),
            defaultValue: "pending",
        },
        payment_channel: { type: DataTypes.STRING, allowNull: true },
        doku_response: { type: DataTypes.JSON, allowNull: true },
    },
    {
        sequelize: db,
        tableName: "transactions",
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

Orders.hasMany(Transactions, { foreignKey: "order_id", as: "transactions" });
Transactions.belongsTo(Orders, { foreignKey: "order_id", as: "order" });

export default Transactions;
