import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";

interface UserAttributes {
    id: string;
    firstName?: string;
    lastName?: string;
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

    reset_password_token?: string;
    reset_password_expires?: Date;
    created_at?: Date;
    updated_at?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id" | "status" | "role"> { }

class Users extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: string;
    public firstName!: string;
    public lastName!: string;
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

    public reset_password_token!: string;
    public reset_password_expires!: Date;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Users.init(
    {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        firstName: { type: DataTypes.STRING, field: "first_name" },
        lastName: { type: DataTypes.STRING, field: "last_name" },
        name: { type: DataTypes.STRING, field: "name" },
        slug: { type: DataTypes.STRING, field: "slug" },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true },
            field: "email"
        },
        no_telp: { type: DataTypes.STRING(20), field: "no_telp" },
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
        reset_password_token: { type: DataTypes.STRING },
        reset_password_expires: { type: DataTypes.DATE },

    },
    {
        sequelize: db,
        tableName: "users",
        freezeTableName: true,
        timestamps: true,
        // underscored: true, // Removed to rely on explicit field mapping
        createdAt: "created_at",
        updatedAt: "updated_at",
        indexes: [
            { unique: true, fields: ["email"] },
        ],
        hooks: {
            beforeCreate: (user: Users) => {
                if (user.name) {
                    const slugify = require("slugify");
                    user.slug = slugify(user.name, { lower: true, strict: true });
                }
            }
        }
    }
);

export default Users;
