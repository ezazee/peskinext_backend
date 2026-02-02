import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";
import Provinces from "./ProvinceModel";

interface RegencyAttributes {
    id: number;
    code: string;
    name: string;
    province_code: string;
}

interface RegencyCreationAttributes extends Optional<RegencyAttributes, "id"> { }

class Regencies extends Model<RegencyAttributes, RegencyCreationAttributes> implements RegencyAttributes {
    public id!: number;
    public code!: string;
    public name!: string;
    public province_code!: string;
}

Regencies.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        code: { type: DataTypes.STRING, unique: true, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        province_code: { type: DataTypes.STRING, allowNull: false },
    },
    {
        sequelize: db,
        tableName: "regencies",
        timestamps: false,
        freezeTableName: true,
    }
);

Provinces.hasMany(Regencies, { foreignKey: "province_code", sourceKey: "code" });
Regencies.belongsTo(Provinces, { foreignKey: "province_code", targetKey: "code" });

export default Regencies;
