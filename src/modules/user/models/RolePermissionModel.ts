import { DataTypes, Model } from "sequelize";
import db from "../../../config/database";

interface RolePermissionAttributes {
    role: string;
    name?: string;
    permissions: string[] | null;
    color?: string;
    created_at?: Date;
    updated_at?: Date;
}

class RolePermissions extends Model<RolePermissionAttributes> implements RolePermissionAttributes {
    public role!: string;
    public name!: string;
    public permissions!: string[] | null;
    public color!: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

RolePermissions.init(
    {
        role: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        permissions: {
            type: DataTypes.JSON,
            allowNull: true
        },
        color: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        sequelize: db,
        tableName: "role_permissions",
        freezeTableName: true,
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default RolePermissions;
