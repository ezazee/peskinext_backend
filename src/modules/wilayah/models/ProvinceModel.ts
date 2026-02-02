import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";

interface ProvinceAttributes {
    id: number;
    code: string;
    name: string;
}

interface ProvinceCreationAttributes extends Optional<ProvinceAttributes, "id"> { }

class Provinces extends Model<ProvinceAttributes, ProvinceCreationAttributes> implements ProvinceAttributes {
    public id!: number;
    public code!: string;
    public name!: string;
}

Provinces.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        code: { type: DataTypes.STRING, unique: true, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
    },
    {
        sequelize: db,
        tableName: "provinces",
        timestamps: false,
        freezeTableName: true,
    }
);

export default Provinces;
