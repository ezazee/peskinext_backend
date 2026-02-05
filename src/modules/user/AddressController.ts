import { Request, Response } from "express";
import Address from "./models/AddressModel";
import Users from "../user/models/UserModel";

export const createAddress = async (req: Request, res: Response) => {
    try {
        const { user_id, label, address, province, regencies, districts, villages, postal_code, is_default } = req.body;

        const user = await Users.findByPk(user_id);
        if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

        const count = await Address.count({ where: { user_id } });
        if (count >= 5) {
            return res.status(400).json({ message: "Maksimal 5 alamat per user" });
        }

        if (is_default === "yes" || is_default === true) {
            await Address.update({ is_default: false }, { where: { user_id } });
        }

        const newAddress = await Address.create({
            user_id,
            label,
            address,
            province,
            regencies,
            districts,
            villages,
            postal_code,
            is_default: (is_default === "yes" || is_default === true) ? true : false,
        });

        res.status(201).json({ message: "Alamat berhasil ditambahkan", data: newAddress });
    } catch (err: any) {
        console.error("❌ Error createAddress:", err);
        res.status(500).json({ message: "Gagal menambahkan alamat", error: err.message });
    }
};

export const getAddresses = async (req: Request, res: Response) => {
    try {
        const { user_id } = req.params;
        const addresses = await Address.findAll({ where: { user_id } });
        res.json(addresses);
    } catch (err: any) {
        res.status(500).json({ message: "Gagal mengambil alamat", error: err.message });
    }
};

export const updateAddress = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { label, address, province, regencies, districts, villages, postal_code, is_default } = req.body;

        const addressData = await Address.findByPk(id as string);
        if (!addressData) return res.status(404).json({ message: "Alamat tidak ditemukan" });

        if (is_default === "yes" || is_default === true) {
            await Address.update({ is_default: false }, { where: { user_id: addressData.user_id } });
        }

        await addressData.update({
            label,
            address,
            province,
            regencies,
            districts,
            villages,
            postal_code,
            is_default: (is_default === "yes" || is_default === true) ? true : addressData.is_default,
        });

        res.json({ message: "Alamat berhasil diperbarui", data: addressData });
    } catch (err: any) {
        res.status(500).json({ message: "Gagal update alamat", error: err.message });
    }
};

export const deleteAddress = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const address = await Address.findByPk(id as string);
        if (!address) return res.status(404).json({ message: "Alamat tidak ditemukan" });

        await address.destroy();
        res.json({ message: "Alamat berhasil dihapus" });
    } catch (err: any) {
        res.status(500).json({ message: "Gagal hapus alamat", error: err.message });
    }
};

export const setDefaultAddress = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const address = await Address.findByPk(id as string);
        if (!address) return res.status(404).json({ message: "Alamat tidak ditemukan" });

        await Address.update({ is_default: false }, { where: { user_id: address.user_id } });

        await address.update({ is_default: true });

        res.json({ message: "Alamat default berhasil diubah", data: address });
    } catch (err: any) {
        res.status(500).json({ message: "Gagal set default alamat", error: err.message });
    }
};
