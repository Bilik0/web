const express = require('express');
const { substationData, logs, addLog } = require('../data/db');
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/substation/parameters', isAuthenticated, (req, res) => {
    res.json(substationData);
});

router.put('/substation/mode', isAuthenticated, hasRole('dispatcher'), (req, res) => {
    const { mode } = req.body;
    if (!['normal', 'maintenance', 'emergency'].includes(mode)) {
        return res.status(400).json({ error: 'Невірний режим' });
    }
    
    substationData.mode = mode;
    addLog(`Змінено режим роботи на: ${mode}`, req.session.user);
    res.json({ message: 'Режим успішно змінено', data: substationData });
});

router.get('/logs', isAuthenticated, hasRole('dispatcher'), (req, res) => {
    res.json(logs);
});

module.exports = router;