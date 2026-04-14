import Users from "./models/UserModel";
import RolePermissions from "./models/RolePermissionModel";
import bcrypt from "bcrypt";
import slugify from "slugify";

export const getAllUsers = async (page: number, limit: number, role?: string) => {
    const offset = (page - 1) * limit;
    
    const whereClause: any = {};
    if (role) {
        whereClause.role = role;
    }

    const { count, rows } = await Users.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [["name", "ASC"]],
    });

    // Get global role distribution
    const roleStats = await Users.findAll({
        attributes: ['role', [Users.sequelize!.fn('COUNT', Users.sequelize!.col('role')), 'count']],
        group: ['role'],
        raw: true
    });

    // Get global status distribution
    const statusStats = await Users.findAll({
        attributes: ['status', [Users.sequelize!.fn('COUNT', Users.sequelize!.col('status')), 'count']],
        group: ['status'],
        raw: true
    });

    return {
        total: count,
        perPage: limit,
        page,
        totalPages: Math.ceil(count / limit),
        data: rows,
        stats: {
            roles: roleStats,
            status: statusStats
        }
    };
};

export const getUserById = async (id: string) => {
    return await Users.findByPk(id, {
        include: [{ association: "addresses" }]
    });
};

export const deleteUserById = async (id: string, requestorId?: string) => {
    const user = await Users.findByPk(id);
    if (!user) throw new Error("User tidak ditemukan");

    if (requestorId && requestorId === id) {
        throw new Error("Tidak boleh menghapus akun sendiri");
    }

    try {
        await user.destroy();
        return true;
    } catch (error: any) {
        if (error.name === "SequelizeForeignKeyConstraintError") {
            throw new Error("User tidak bisa dihapus karena sudah memiliki histori pesanan. Silakan ubah status menjadi Inactive saja.");
        }
        throw error;
    }
};

export const createUser = async (data: any) => {
    const { firstName, lastName, name, email, password, role } = data;

    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) throw new Error("Email sudah terdaftar");

    const hashedPassword = await bcrypt.hash(password, 10);
    const slug = slugify(name, { lower: true, strict: true });

    const newUser = await Users.create({
        firstName,
        lastName,
        slug,
        name,
        email,
        password: hashedPassword,
        role: role || "user",
        permissions: data.permissions || null,
        status: "active"
    });

    return newUser;
};

export const updateUser = async (id: string, data: any) => {


    const user = await Users.findByPk(id);
    if (!user) throw new Error("User tidak ditemukan");

    // Prevent email duplication if changed
    if (data.email && data.email !== user.email) {
        const exists = await Users.findOne({ where: { email: data.email } });
        if (exists) throw new Error("Email sudah digunakan user lain");
    }

    // Map fields
    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    if (data.phone) user.no_telp = data.phone;
    if (data.no_telp) user.no_telp = data.no_telp;
    if (data.birthDate) user.birth_date = data.birthDate;
    if (data.birth_date) user.birth_date = data.birth_date;
    if (data.images) user.images = data.images;
    if (data.avatarUrl) {
        user.images = data.avatarUrl;
    }
    if (data.role) user.role = data.role;
    if (data.status) user.status = data.status;

    // Handle password update if provided
    if (data.password && data.password.trim() !== "") {
        user.password = await bcrypt.hash(data.password, 10);
    }



    await user.save();

    return user;
};


export const getAllRolePermissions = async () => {
    return await RolePermissions.findAll();
};

export const updateRolePermissions = async (role: string, permissions: string[], name?: string, color?: string) => {
    let rp = await RolePermissions.findByPk(role);
    if (!rp) {
        rp = await RolePermissions.create({ role, permissions, name, color });
    } else {
        rp.permissions = permissions;
        if (name) rp.name = name;
        if (color) rp.color = color;
        await rp.save();
    }
    return rp;
};

export const deleteRolePermission = async (role: string) => {
    // Prevent deleting core roles
    const protectedRoles = ["super_admin", "admin", "user"];
    if (protectedRoles.includes(role)) {
        throw new Error("Peran sistem tidak boleh dihapus");
    }

    // Check if role is in use
    const userCount = await Users.count({ where: { role } });
    if (userCount > 0) {
        throw new Error(`Peran ini masih digunakan oleh ${userCount} pengguna`);
    }

    const rp = await RolePermissions.findByPk(role);
    if (!rp) throw new Error("Peran tidak ditemukan");

    await rp.destroy();
    return true;
};
