import { Request, Response } from "express";
import Provinces from "./models/ProvinceModel";
import Regencies from "./models/RegencyModel";
import Districts from "./models/DistrictModel";
import Villages from "./models/VillageModel";

export const getProvinces = async (req: Request, res: Response) => {
    try {
        const provinces = await Provinces.findAll();
        res.json(provinces);
    } catch (err: any) {
        console.error("❌ getProvinces error:", err);
        res.status(500).json({ message: "Failed to fetch provinces" });
    }
};

export const getRegencies = async (req: Request, res: Response) => {
    try {
        const { province_code } = req.params;
        const regencies = await Regencies.findAll({ where: { province_code: province_code as string } });
        res.json(regencies);
    } catch (err: any) {
        console.error("❌ getRegencies error:", err);
        res.status(500).json({ message: "Failed to fetch regencies" });
    }
};

export const getDistricts = async (req: Request, res: Response) => {
    try {
        const { regency_code } = req.params;
        const districts = await Districts.findAll({ where: { regency_code: regency_code as string } });
        res.json(districts);
    } catch (err: any) {
        console.error("❌ getDistricts error:", err);
        res.status(500).json({ message: "Failed to fetch districts" });
    }
};

export const getVillages = async (req: Request, res: Response) => {
    try {
        const { district_code } = req.params;
        const villages = await Villages.findAll({ where: { district_code: district_code as string } });
        res.json(villages);
    } catch (err: any) {
        console.error("❌ getVillages error:", err);
        res.status(500).json({ message: "Failed to fetch villages" });
    }
};
