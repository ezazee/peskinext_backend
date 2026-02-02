import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";

interface ProductAttributes {
    id: string;
    name: string;
    slug: string;
    category?: string;
    description?: string;
    front_image?: string;
    back_image?: string;
    longdescription?: string; // Missing in original model definition but present in controller (lines 94, 126)
    effect?: string;
    ingredients?: string;
    howtouse?: string;
    sku?: string;
    type?: "single" | "bundle";
    is_flash_sale?: boolean;
    is_event?: boolean;
    weight_gr?: number;
    sold_count?: number;
    created_at?: Date;
    updated_at?: Date;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, "id"> { }

class Products extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
    public id!: string;
    public name!: string;
    public slug!: string;
    public category!: string;
    public description!: string;
    public front_image!: string;
    public back_image!: string;
    public longdescription!: string;
    public effect!: string;
    public ingredients!: string;
    public howtouse!: string;
    public sku!: string;
    public type!: "single" | "bundle";
    public is_flash_sale!: boolean;
    public is_event!: boolean;
    public weight_gr!: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Products.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: { type: DataTypes.STRING, allowNull: false },
        slug: { type: DataTypes.STRING, unique: true },
        category: { type: DataTypes.STRING },
        description: { type: DataTypes.TEXT },
        front_image: { type: DataTypes.STRING },
        back_image: { type: DataTypes.STRING },
        longdescription: { type: DataTypes.TEXT }, // Added based on controller usage
        effect: { type: DataTypes.TEXT },
        ingredients: { type: DataTypes.TEXT },
        howtouse: { type: DataTypes.TEXT },
        sku: { type: DataTypes.STRING },
        type: {
            type: DataTypes.ENUM("single", "bundle"),
            defaultValue: "single"
        },
        is_flash_sale: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_event: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        weight_gr: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        },
        sold_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    },
    {
        sequelize: db,
        tableName: "products",
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default Products;
