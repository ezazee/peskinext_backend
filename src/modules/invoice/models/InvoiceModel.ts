import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";
import Orders from "../../order/models/OrderModel";

interface InvoiceAttributes {
    id: number;
    order_id: string;
    invoice_number: string;
    issue_date?: Date;
    due_date?: Date;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    status: "unpaid" | "paid" | "cancelled";
    created_at?: Date;
    updated_at?: Date;
}

interface InvoiceCreationAttributes extends Optional<InvoiceAttributes, "id"> { }

class Invoices extends Model<InvoiceAttributes, InvoiceCreationAttributes> implements InvoiceAttributes {
    public id!: number;
    public order_id!: string;
    public invoice_number!: string;
    public issue_date!: Date;
    public due_date!: Date;
    public subtotal!: number;
    public tax!: number;
    public discount!: number;
    public total!: number;
    public status!: "unpaid" | "paid" | "cancelled";
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Invoices.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        order_id: { type: DataTypes.UUID, allowNull: false },
        invoice_number: { type: DataTypes.STRING, unique: true, allowNull: false },
        issue_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        due_date: { type: DataTypes.DATE },
        subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        tax: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
        discount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
        total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        status: {
            type: DataTypes.ENUM("unpaid", "paid", "cancelled"),
            defaultValue: "unpaid",
        },
    },
    {
        sequelize: db,
        tableName: "invoices",
        timestamps: true,
        freezeTableName: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

Orders.hasOne(Invoices, { foreignKey: "order_id", onDelete: "CASCADE" });
Invoices.belongsTo(Orders, { foreignKey: "order_id" });

export default Invoices;
