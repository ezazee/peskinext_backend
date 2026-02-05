import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";
import Users from "./UserModel";

interface AddressAttributes {
    id: string;
    user_id: string;
    label: string;
    recipient?: string;
    phone?: string;
    address: string;
    province?: string;
    regencies?: string;
    districts?: string;
    villages?: string;
    postal_code?: string;
    is_default: boolean;
    created_at?: Date;
    updated_at?: Date;
}

interface AddressCreationAttributes extends Optional<AddressAttributes, "id"> { }

class Address extends Model<AddressAttributes, AddressCreationAttributes> implements AddressAttributes {
    public id!: string;
    public user_id!: string;
    public label!: string;
    public recipient!: string;
    public phone!: string;
    public address!: string;
    public province!: string;
    public regencies!: string;
    public districts!: string;
    public villages!: string;
    public postal_code!: string;
    public is_default!: boolean;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Address.init(
    {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        user_id: { type: DataTypes.UUID, allowNull: false },
        label: { type: DataTypes.STRING, allowNull: false },
        recipient: { type: DataTypes.STRING },
        phone: { type: DataTypes.STRING },
        address: { type: DataTypes.TEXT, allowNull: false },
        province: { type: DataTypes.STRING },
        regencies: { type: DataTypes.STRING },
        districts: { type: DataTypes.STRING },
        villages: { type: DataTypes.STRING },
        postal_code: { type: DataTypes.STRING },
        is_default: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        sequelize: db,
        tableName: "addresses",
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

Users.hasMany(Address, { foreignKey: "user_id", as: "addresses" });
Address.belongsTo(Users, { foreignKey: "user_id", as: "user" });

export default Address;
