// middlewares/auth.js
export function requireAuth(req, res, next) {
    if (!req.session?.user) {
        return res.redirect('/users/login?error=auth')
    }
    next()
}
export function requireGuest(req, res, next) {
    if (req.session?.user) {
        return res.redirect('/')
    }
    next()
}

export function requireRole(requiredRoles) {
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]

    return (req, res, next) => {
        const user = req.session?.user || req.user
        if (!user) {
            const wantsHTML = (req.headers.accept || '').includes('text/html')
            if (wantsHTML) {
                return res.redirect('/users/login?error=auth')
            } else {
                return res.status(401).json({ status: 'error', error: 'Unauthorized' })
            }
        }

        if (!roles.includes(user.role)) {
            const wantsHTML = (req.headers.accept || '').includes('text/html')
            if (wantsHTML) {
                return res.status(403).send('Forbidden')
            } else {
                return res.status(403).json({ status: 'error', error: 'Permisos insuficientes.' })
            }
        }
        next()
    }
}