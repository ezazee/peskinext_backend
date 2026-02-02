import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";

interface ShippingMethodAttributes {
    id: number;
    name: string;
    description?: string;
    created_at?: Date;
    updated_at?: Date;
}

interface ShippingMethodCreationAttributes extends Optional<ShippingMethodAttributes, "id"> { }

class ShippingMethod extends Model<ShippingMethodAttributes, ShippingMethodCreationAttributes> implements ShippingMethodAttributes {
    public id!: number;
    public name!: string;
    public description!: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

ShippingMethod.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: true },
    },
    {
        sequelize: db,
        tableName: "shipping_methods", // Guessing plural name based on pattern
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default ShippingMethod;
