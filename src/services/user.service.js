export default class UserService {
    constructor(userDao) {
        this.userDao = userDao
    }

    async getAllUsers() {
        return this.userDao.getAll()
    }

    async getUserByID(id) {
        return this.userDao.getByID(id)
    }

    async createUser(data) {
        const { first_name, last_name, email, age, password, cart, role } = data
        return this.userDao.create({
            first_name,
            last_name,
            email,
            age,
            password,
            cart,
            role: role || 'user'
        })
    }

    async deleteUser(id) {
        return this.userDao.delete(id)
    }

    async findByIdentifier(identifier) {
        const looksLikeEmail = identifier.includes('@')
        if (looksLikeEmail) {
            const email = identifier.trim().toLowerCase()
            return this.userDao.findByEmail(email)
        } else {
            return null
        }
    }

    async updateProfile(id, patch) {
        return this.userDao.updateById(id, patch)
    }


}