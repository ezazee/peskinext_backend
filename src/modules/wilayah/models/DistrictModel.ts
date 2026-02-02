import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";
import Regencies from "./RegencyModel";

interface DistrictAttributes {
    id: number;
    code: string;
    name: string;
    regency_code: string;
}

interface DistrictCreationAttributes extends Optional<DistrictAttributes, "id"> { }

class Districts extends Model<DistrictAttributes, DistrictCreationAttributes> implements DistrictAttributes {
    public id!: number;
    public code!: string;
    public name!: string;
    public regency_code!: string;
}

Districts.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        code: { type: DataTypes.STRING, unique: true, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        regency_code: { type: DataTypes.STRING, allowNull: false },
    },
    {
        sequelize: db,
        tableName: "districts",
        timestamps: false,
        freezeTableName: true,
    }
);

Regencies.hasMany(Districts, { foreignKey: "regency_code", sourceKey: "code" });
Districts.belongsTo(Regencies, { foreignKey: "regency_code", targetKey: "code" });

export default Districts;
