import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";

interface UserAttributes {
    id: string;
    first_name?: string;
    last_name?: string;
    name?: string;
    slug?: string;
    email: string;
    no_telp?: string;
    email_verified_at?: Date;
    password?: string;
    status: "active" | "inactive" | "banned";
    images?: string;
    role: "user" | "admin" | "writter" | "management" | "affiliate" | "finance";
    birth_date?: string;
    is_google?: boolean;
    refresh_token?: string; // Sesuai Auth Controller (refreshToken)
    remember_token?: string;
    created_at?: Date;
    updated_at?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id" | "status" | "role"> { }

class Users extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: string;
    public first_name!: string;
    public last_name!: string;
    public name!: string;
    public slug!: string;
    public email!: string;
    public no_telp!: string;
    public email_verified_at!: Date;
    public password!: string;
    public status!: "active" | "inactive" | "banned";
    public images!: string;
    public role!: "user" | "admin" | "writter" | "management" | "affiliate" | "finance";
    public birth_date!: string;
    public is_google!: boolean;
    public refresh_token!: string;
    public remember_token!: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Users.init(
    {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        first_name: { type: DataTypes.STRING },
        last_name: { type: DataTypes.STRING },
        name: { type: DataTypes.STRING },
        slug: { type: DataTypes.STRING },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true }
        },
        no_telp: { type: DataTypes.STRING(20) },
        email_verified_at: { type: DataTypes.DATE },
        password: { type: DataTypes.STRING },
        status: {
            type: DataTypes.ENUM("active", "inactive", "banned"),
            defaultValue: "active"
        },
        images: { type: DataTypes.TEXT },
        role: {
            type: DataTypes.ENUM("user", "admin", "writter", "management", "affiliate", "finance"),
            defaultValue: "user"
        },
        birth_date: { type: DataTypes.DATEONLY },
        is_google: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        refresh_token: { type: DataTypes.TEXT },
        remember_token: { type: DataTypes.STRING },
    },
    {
        sequelize: db,
        tableName: "users",
        freezeTableName: true,
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        indexes: [
            { unique: true, fields: ["email"] },
        ]
    }
);

export default Users;
