import Users from "./models/UserModel";
import bcrypt from "bcrypt";
import slugify from "slugify";

export const getAllUsers = async (page: number, limit: number) => {
    const offset = (page - 1) * limit;
    const { count, rows } = await Users.findAndCountAll({
        limit,
        offset,
        order: [["name", "ASC"]],
    });

    return {
        total: count,
        perPage: limit,
        page,
        totalPages: Math.ceil(count / limit),
        data: rows,
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

    await user.destroy();
    return true;
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

    await user.save();

    return user;
};
