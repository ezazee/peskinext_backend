import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";

interface TagAttributes {
    id: number;
    name: string;
    slug: string;
    created_at?: Date;
    updated_at?: Date;
}

interface TagCreationAttributes extends Optional<TagAttributes, "id"> { }

class Tags extends Model<TagAttributes, TagCreationAttributes> implements TagAttributes {
    public id!: number;
    public name!: string;
    public slug!: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Tags.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false, unique: true },
        slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    },
    {
        sequelize: db,
        tableName: "tags",
        timestamps: true,
        underscored: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default Tags;
