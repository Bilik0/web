const express = require('express');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const { users, addLog } = require('../data/db');

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Забагато спроб входу. Спробуйте пізніше.' }
});

router.post('/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (users.find(u => u.email === email)) {
            return res.status(400).json({ error: 'Користувач вже існує' });
        }
        
        const userRole = role === 'dispatcher' ? 'dispatcher' : 'operator';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = { id: Date.now(), email, password: hashedPassword, role: userRole };
        users.push(newUser);
        
        res.status(201).json({ message: 'Реєстрація успішна' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', loginLimiter, async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Невірні облікові дані' });
    }
    
    req.session.user = { id: user.id, email: user.email, role: user.role };
    addLog('Вхід в систему', req.session.user);
    res.json({ message: 'Вхід успішний', user: req.session.user });
});

router.post('/logout', (req, res) => {
    if (req.session.user) addLog('Вихід із системи', req.session.user);
    req.session.destroy();
    res.json({ message: 'Вихід успішний' });
});

router.get('/status', (req, res) => {
    if (req.session.user) {
        res.json({ authenticated: true, user: req.session.user });
    } else {
        res.json({ authenticated: false });
    }
});

module.exports = router;