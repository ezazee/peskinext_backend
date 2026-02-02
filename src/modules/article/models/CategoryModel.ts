import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";

interface CategoryAttributes {
    id: number;
    name: string;
    slug: string;
    parent_id?: number | null;
    created_at?: Date;
    updated_at?: Date;
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, "id"> { }

class Categories extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
    public id!: number;
    public name!: string;
    public slug!: string;
    public parent_id!: number | null;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    public subcategories?: Categories[];
}

Categories.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        slug: { type: DataTypes.STRING, allowNull: false, unique: true },
        parent_id: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
        sequelize: db,
        tableName: "categories",
        timestamps: true,
        underscored: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

Categories.hasMany(Categories, { as: "subcategories", foreignKey: "parent_id" });
Categories.belongsTo(Categories, { as: "parent", foreignKey: "parent_id" });

export default Categories;
