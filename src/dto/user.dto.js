export function userToDto(user) {
    if (!user) {
        return null
    } else {
        return {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            carts: user.carts ?? []
        };
    }
}