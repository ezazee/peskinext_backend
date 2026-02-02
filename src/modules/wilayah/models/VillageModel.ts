import { DataTypes, Model, Optional } from "sequelize";
import db from "../../../config/database";
import Districts from "./DistrictModel";

interface VillageAttributes {
    id: number;
    code: string;
    name: string;
    district_code: string;
}

interface VillageCreationAttributes extends Optional<VillageAttributes, "id"> { }

class Villages extends Model<VillageAttributes, VillageCreationAttributes> implements VillageAttributes {
    public id!: number;
    public code!: string;
    public name!: string;
    public district_code!: string;
}

Villages.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        code: { type: DataTypes.STRING, unique: true, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        district_code: { type: DataTypes.STRING, allowNull: false },
    },
    {
        sequelize: db,
        tableName: "villages",
        timestamps: false,
        freezeTableName: true,
    }
);

Districts.hasMany(Villages, { foreignKey: "district_code", sourceKey: "code" });
Villages.belongsTo(Districts, { foreignKey: "district_code", targetKey: "code" });

export default Villages;
