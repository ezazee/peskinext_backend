import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";

interface FAQAttributes {
    id: number;
    question: string;
    answer: string;
    category: string;
    order: number;
    helpful: number;
    not_helpful: number;
    status: "published" | "draft";
    created_at?: Date;
    updated_at?: Date;
}

interface FAQCreationAttributes extends Optional<FAQAttributes, "id" | "helpful" | "not_helpful" | "order" | "status"> { }

class FAQs extends Model<FAQAttributes, FAQCreationAttributes> implements FAQAttributes {
    public id!: number;
    public question!: string;
    public answer!: string;
    public category!: string;
    public order!: number;
    public helpful!: number;
    public not_helpful!: number;
    public status!: "published" | "draft";
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

FAQs.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        question: { type: DataTypes.TEXT, allowNull: false },
        answer: { type: DataTypes.TEXT, allowNull: false },
        category: { type: DataTypes.STRING, allowNull: false },
        order: { type: DataTypes.INTEGER, defaultValue: 0 },
        helpful: { type: DataTypes.INTEGER, defaultValue: 0 },
        not_helpful: { type: DataTypes.INTEGER, defaultValue: 0 },
        status: { type: DataTypes.ENUM("published", "draft"), defaultValue: "published" },
    },
    {
        sequelize: db,
        tableName: "faqs",
        timestamps: true,
        underscored: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default FAQs;
