import { Request, Response } from "express";
import * as SettingService from "./SettingService";

export const getSettings = async (req: Request, res: Response) => {
    try {
        const settings = await SettingService.getSettings();
        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const settingsData = req.body;
        if (!settingsData || typeof settingsData !== "object") {
            return res.status(400).json({
                success: false,
                message: "Invalid settings data"
            });
        }
        
        await SettingService.updateSettings(settingsData);
        const updated = await SettingService.getSettings();
        
        res.status(200).json({
            success: true,
            message: "Settings updated successfully",
            data: updated
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const seedSettings = async (req: Request, res: Response) => {
    try {
        await SettingService.seedInitialSettings();
        res.status(200).json({
            success: true,
            message: "Settings seeded successfully"
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
