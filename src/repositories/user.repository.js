import bcrypt from 'bcrypt';
import { userDao } from '../dao/index.js';
export default class UserRepository {
    constructor() {
        this.dao = userDao || new userDao();
    }

    async getAll() {
        return this.dao.getAll();
    }

    async getById(id) {
        return this.dao.getByID(id);
    }

    async findByEmail(email) {
        return this.dao.findByEmail(email);
    }

    async createUser(payload) {
        const existing = await this.dao.findByEmail(payload.email);
        if (existing) {
            throw new Error('Email ya registrado');
        }
        const hashed = await bcrypt.hash(payload.password, 10);
        const userToCreate = { ...payload, password: hashed };
        const created = await this.dao.create(userToCreate);
        if (created && created.password) {
            delete created.password;
        }
        return created;
    }

    async updateUser(id, patch) {
        if ('password' in patch) {
            patch.password = await bcrypt.hash(patch.password, 10);
        }
        const updated = await this.dao.updateById(id, patch);
        if (updated && updated.password) {
            delete updated.password;
        }
        return updated;
    }

    async deleteUser(id) {
        return this.dao.delete(id);
    }

    async addCartToUser(userId, cartId) {
        return this.dao.addCartToUser(userId, cartId);
    }

    async getCarts(userId) {
        return this.dao.getCarts(userId);
    }
}
