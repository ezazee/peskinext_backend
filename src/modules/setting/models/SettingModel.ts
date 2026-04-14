import { DataTypes, Model } from "sequelize";
import db from "../../../config/database";

interface SettingAttributes {
    id?: number;
    key: string;
    value: string;
    group: string;
}

class GeneralSettings extends Model<SettingAttributes> implements SettingAttributes {
    public id!: number;
    public key!: string;
    public value!: string;
    public group!: string;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

GeneralSettings.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    key: { type: DataTypes.STRING, allowNull: false, unique: true },
    value: { type: DataTypes.TEXT, allowNull: true },
    group: { type: DataTypes.STRING, defaultValue: "general" }
}, {
    sequelize: db,
    tableName: "general_settings",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});

export default GeneralSettings;
