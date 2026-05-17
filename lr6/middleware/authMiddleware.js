function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.status(401).json({ error: 'Необхідна автентифікація' });
}

function hasRole(role) {
    return (req, res, next) => {
        if (req.session.user && req.session.user.role === role) {
            return next();
        }
        res.status(403).json({ error: 'Недостатньо прав доступу' });
    };
}

module.exports = { isAuthenticated, hasRole };