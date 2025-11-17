// src/dao/user.dao.js
import mongoose from 'mongoose';
import { UserModel } from '../db/models/user.model.js';

function escapeRegex(str = '') {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default class UserDao {
  constructor() {}

  async getAll() {
    return UserModel.find().lean();
  }

  async getByID(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return UserModel.findById(id).lean();
  }

  async create(user) {
    const {
      first_name,
      last_name,
      email,
      age,
      password,
      carts = [],
      role
    } = user;

    try {
      const doc = await UserModel.create({
        first_name,
        last_name,
        email,
        age,
        password,
        carts,
        role
      });
      return doc.toObject();
    } catch (err) {
      if (err && err.code === 11000 && err.keyPattern && err.keyPattern.email) {
        const e = new Error('Email ya registrado');
        e.code = 11000;
        throw e;
      }
      throw err;
    }
  }

  async delete(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const res = await UserModel.findByIdAndDelete(id);
    return !!res;
  }

  async findByFirstName(first_name) {
    if (!first_name) return null;
    const re = new RegExp(`^${escapeRegex(first_name)}$`, 'i');
    return UserModel.findOne({ first_name: re }).lean();
  }

  async findByEmail(email) {
    if (!email) return null;
    return UserModel.findOne({ email: String(email).trim().toLowerCase() }).lean();
  }

  async updateById(id, patch) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const updated = await UserModel.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true
    }).lean();
    return updated || null;
  }

  async addCartToUser(userId, cartId) {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(cartId)) {
      throw new Error('IDs inválidos');
    }
    const updated = await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { carts: cartId } },
      { new: true }
    ).lean();
    return updated;
  }

  async getCarts(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) return null;
    return UserModel.findById(userId).populate('carts').lean();
  }
}
