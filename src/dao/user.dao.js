import { UserModel } from '../db/models/user.model.js';

export default class UserDao {
    constructor() {}

    async getAll() {
        return UserModel.find().lean();
    }
    
    async getByID(id) {
        return UserModel.findById(id).lean();
    }

    async create(user) {
        const { 
            first_name,
            last_name,
            email,
            age,
            password,
            cart,
            role 
        } = user;
        const doc = await UserModel.create({ first_name, last_name, email, age, password, cart, role });
        return doc.toObject();
    }

    async delete(id) {
        const res = await UserModel.findByIdAndDelete(id);
        return !!res;
    }

    async findByFirstName(first_name) {
        return UserModel.findOne({ first_name: new RegExp(`^${first_name}$`, 'i') });
    }

    async findByEmail(email) {
        return UserModel.findOne({ email });
    }

    async updateById(id, patch) {
        return UserModel.findByIdAndUpdate(id, patch, { new: true }).lean();
    }

}