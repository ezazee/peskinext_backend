import { DataTypes, Model, Optional, BelongsToManySetAssociationsMixin } from "sequelize";
import db from "../../../config/database";
import Categories from "./CategoryModel";
import Tags from "./TagModel";
import Users from "../../user/models/UserModel";

interface PostAttributes {
    id: number;
    title: string;
    slug: string;
    content: string;
    category_id?: number | null;
    user_id: string;
    created_at?: Date;
    updated_at?: Date;
}

interface PostCreationAttributes extends Optional<PostAttributes, "id"> { }

class Posts extends Model<PostAttributes, PostCreationAttributes> implements PostAttributes {
    public id!: number;
    public title!: string;
    public slug!: string;
    public content!: string;
    public category_id!: number | null;
    public user_id!: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    public setTags!: BelongsToManySetAssociationsMixin<Tags, number>;
}

Posts.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        title: { type: DataTypes.STRING, allowNull: false },
        slug: { type: DataTypes.STRING, allowNull: false, unique: true },
        content: { type: DataTypes.TEXT, allowNull: true },
        category_id: { type: DataTypes.INTEGER, allowNull: true },
        user_id: { type: DataTypes.UUID, allowNull: false },
    },
    {
        sequelize: db,
        tableName: "posts",
        timestamps: true,
        underscored: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

Posts.belongsTo(Categories, { foreignKey: "category_id" });
Categories.hasMany(Posts, { foreignKey: "category_id" });

Posts.belongsTo(Users, { foreignKey: "user_id", as: "author" });
Users.hasMany(Posts, { foreignKey: "user_id" });

const PostTags = db.define("post_tags", {}, { timestamps: false, freezeTableName: true });
Posts.belongsToMany(Tags, { through: PostTags, foreignKey: "post_id" });
Tags.belongsToMany(Posts, { through: PostTags, foreignKey: "tag_id" });

export { Posts, PostTags };
export default Posts;
