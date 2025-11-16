export default class UserService {
    constructor(userRepository) {
        this.userRepo = userRepository
    }

    async getAllUsers() {
        return this.userRepo.getAll()
    }

    async getUserByID(id) {
        return this.userRepo.getByID(id)
    }

    async createUser(data) {
        const { first_name, last_name, email, age, password, cart, role } = data
        return this.userRepo.createUser({
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
        return this.userRepo.delete(id)
    }

    async findByIdentifier(identifier) {
        const looksLikeEmail = identifier.includes('@')
        if (looksLikeEmail) {
            const email = identifier.trim().toLowerCase()
            return this.userRepo.findByEmail(email)
        } else {
            return null
        }
    }

    async updateProfile(id, patch) {
        return this.userRepo.updateById(id, patch)
    }


}