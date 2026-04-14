import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";

interface FlashSaleAttributes {
    id: string;
    name: string;
    description?: string;
    start_time: Date;
    end_time: Date;
    is_active: boolean;
    status: "active" | "inactive" | "expired";
    bg_type?: "color" | "image";
    bg_color?: string;
    bg_image_desktop?: string;
    bg_image_mobile?: string;
    created_at?: Date;
    updated_at?: Date;
}

interface FlashSaleCreationAttributes extends Optional<FlashSaleAttributes, "id" | "is_active" | "status"> { }

class FlashSale extends Model<FlashSaleAttributes, FlashSaleCreationAttributes> implements FlashSaleAttributes {
    public id!: string;
    public name!: string;
    public description!: string;
    public start_time!: Date;
    public end_time!: Date;
    public is_active!: boolean;
    public status!: "active" | "inactive" | "expired";
    public bg_type!: "color" | "image";
    public bg_color!: string;
    public bg_image_desktop!: string;
    public bg_image_mobile!: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

FlashSale.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT },
        start_time: { type: DataTypes.DATE, allowNull: false },
        end_time: { type: DataTypes.DATE, allowNull: false },
        is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
        status: {
            type: DataTypes.ENUM("active", "inactive", "expired"),
            defaultValue: "active"
        },
        bg_type: {
            type: DataTypes.ENUM("color", "image"),
            defaultValue: "color"
        },
        bg_color: { type: DataTypes.STRING },
        bg_image_desktop: { type: DataTypes.TEXT },
        bg_image_mobile: { type: DataTypes.TEXT }
    },
    {
        sequelize: db,
        tableName: "flash_sales",
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default FlashSale;
