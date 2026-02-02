import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";
import Posts from "./PostModel";

interface PostImageAttributes {
    id: number;
    post_id: number;
    image_url: string;
    alt_text?: string;
    created_at?: Date;
    updated_at?: Date;
}

interface PostImageCreationAttributes extends Optional<PostImageAttributes, "id"> { }

class PostImages extends Model<PostImageAttributes, PostImageCreationAttributes> implements PostImageAttributes {
    public id!: number;
    public post_id!: number;
    public image_url!: string;
    public alt_text!: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

PostImages.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        post_id: { type: DataTypes.INTEGER, allowNull: false },
        image_url: { type: DataTypes.STRING, allowNull: false },
        alt_text: { type: DataTypes.STRING, allowNull: true },
    },
    {
        sequelize: db,
        tableName: "post_images",
        timestamps: true,
        underscored: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

Posts.hasMany(PostImages, { foreignKey: "post_id", as: "images" });
PostImages.belongsTo(Posts, { foreignKey: "post_id" });

export default PostImages;
