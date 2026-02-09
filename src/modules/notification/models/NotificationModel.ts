import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";
import User from "../../user/models/UserModel";

interface NotificationAttributes {
    id: number;
    user_id: string; // Relation to User
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    category: "transaction" | "promo" | "system";
    is_read: boolean;
    metadata?: any;
    created_at?: Date;
    updated_at?: Date;
}

interface NotificationCreationAttributes extends Optional<NotificationAttributes, "id" | "is_read" | "metadata" | "created_at" | "updated_at"> { }

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
    public id!: number;
    public user_id!: string;
    public title!: string;
    public message!: string;
    public type!: "info" | "success" | "warning" | "error";
    public category!: "transaction" | "promo" | "system";
    public is_read!: boolean;
    public metadata!: any;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Notification.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM("info", "success", "warning", "error"),
            defaultValue: "info",
        },
        category: {
            type: DataTypes.ENUM("transaction", "promo", "system"),
            defaultValue: "system",
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        metadata: {
            type: DataTypes.JSONB, // Use JSONB for Postgres
            allowNull: true,
        },
    },
    {
        sequelize: db,
        tableName: "notifications",
        underscored: true,
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

// Association
Notification.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Notification, { foreignKey: "user_id", as: "notifications" });

export default Notification;
