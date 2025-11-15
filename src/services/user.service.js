export default class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository
    }

    async getAllUsers() {
        return this.userRepository.getAll()
    }

    async getUserByID(id) {
        return this.userRepository.getByID(id)
    }

    async createUser(data) {
        const { first_name, last_name, email, age, password, cart, role } = data
        return this.userRepository.create({
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
        return this.userRepository.delete(id)
    }

    async findByIdentifier(identifier) {
        const looksLikeEmail = identifier.includes('@')
        if (looksLikeEmail) {
            const email = identifier.trim().toLowerCase()
            return this.userRepository.findByEmail(email)
        } else {
            return null
        }
    }

    async updateProfile(id, patch) {
        return this.userRepository.updateById(id, patch)
    }


}