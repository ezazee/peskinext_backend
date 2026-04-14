import { Request, Response } from "express";
import * as UserService from "./UserService";

export const getUsers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 100;
        const role = req.query.role as string;

        const result = await UserService.getAllUsers(page, limit, role);
        return res.json(result);
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const getUserDetail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await UserService.getUserById(id as string);
        if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
        return res.json({ user });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).json({ message: "User ID tidak valid" });

        // Assuming req.user is populated by middleware
        const requestorId = (req.user as any)?.sub as string;

        await UserService.deleteUserById(id as string, requestorId);
        return res.json({ message: "User berhasil dihapus" });
    } catch (error: any) {
        const status = error.message === "User tidak ditemukan" ? 404 :
            error.message.includes("Tidak boleh") ? 403 : 500;
        return res.status(status).json({ message: error.message });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        await UserService.createUser(req.body);
        return res.status(201).json({ message: "Tambah User berhasil" });
    } catch (error: any) {
        const status = error.message === "Email sudah terdaftar" ? 400 : 500;
        return res.status(status).json({ message: error.message });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedUser = await UserService.updateUser(id as string, req.body);
        return res.json({ message: "User updated successfully", user: updatedUser });
    } catch (error: any) {
        console.error(error);
        const status = error.message === "User tidak ditemukan" ? 404 : 400;
        return res.status(status).json({ message: error.message });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        await UserService.createUser({ ...req.body, role: "user" });
        return res.status(201).json({ message: "Registrasi berhasil" });
    } catch (error: any) {
        const status = error.message === "Email sudah terdaftar" ? 400 : 500;
        return res.status(status).json({ message: error.message });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.sub;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });



        const updatedUser = await UserService.updateUser(userId, req.body);
        return res.json({ message: "Profile updated", user: updatedUser });
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
};

export const getSelf = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.sub;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const user = await UserService.getUserById(userId);

        if (!user) return res.status(404).json({ message: "User not found" });

        return res.json({ user });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const getRolePermissions = async (req: Request, res: Response) => {
    try {
        const result = await UserService.getAllRolePermissions();
        return res.json(result);
    } catch (error: any) {
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const updateRolePermissions = async (req: Request, res: Response) => {
    try {
        const { role, permissions, name, color } = req.body;
        if (!role) return res.status(400).json({ message: "Role wajib diisi" });
        const result = await UserService.updateRolePermissions(role, permissions, name, color);
        return res.json({ message: "Izin peran berhasil diperbarui", data: result });
    } catch (error: any) {
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const deleteRolePermission = async (req: Request, res: Response) => {
    try {
        const { role } = req.params;
        if (!role) return res.status(400).json({ message: "Role ID wajib diisi" });
        await UserService.deleteRolePermission(role);
        return res.json({ message: "Peran berhasil dihapus" });
    } catch (error: any) {
        return res.status(400).json({ message: error.message || "Gagal menghapus peran" });
    }
};
