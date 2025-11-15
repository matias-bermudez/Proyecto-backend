// middlewares/auth.js
export function requireAuth(req, res, next) {
    if (!req.session?.user) return res.redirect('/users/login?error=auth')
    next()
}
export function requireGuest(req, res, next) {
    if (req.session?.user) return res.redirect('/')
    next()
}

export function requireRole(role) {
    return (req, res, next) => {
        const user = req.session?.user || req.user
        if(!user) {
            const wantsHTML = (req.headers.accept||'').includes('text/html');
            if (wantsHTML) return res.redirect('/users/login?error=auth');
            return res.status(401).json({ status:'error', error:'Unauthorized' });
        }
        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ status:'error', error:'Forbidden - insufficient role' });
        }
        next();
    }
}
