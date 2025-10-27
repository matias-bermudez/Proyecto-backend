// middlewares/auth.js
export function requireAuth(req, res, next) {
    if (!req.session?.user) return res.redirect('/users/login?error=auth')
    next()
}
export function requireGuest(req, res, next) {
    if (req.session?.user) return res.redirect('/')
    next()
}
