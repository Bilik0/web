const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let substations = [
    {
        id: 1,
        name: "ТП-110/35/10 Центральна",
        voltageHigh: 110,
        voltageMedium: 35,
        voltageLow: 10,
        transformerPower: 40,
        load: 28.5,
        temperature: 65,
        status: "active"
    }
];

app.get('/api/substations', (req, res) => {
    const { status } = req.query;
    if (status) {
        return res.json(substations.filter(s => s.status === status));
    }
    res.json(substations);
});

app.get('/api/substations/:id', (req, res) => {
    const substation = substations.find(s => s.id === parseInt(req.params.id));
    if (!substation) {
        return res.status(404).json({ error: 'Підстанцію не знайдено' });
    }
    res.json(substation);
});

app.get('/api/substations/:id/parameters', (req, res) => {
    const substation = substations.find(s => s.id === parseInt(req.params.id));
    if (!substation) {
        return res.status(404).json({ error: 'Підстанцію не знайдено' });
    }
    res.json({
        load: substation.load,
        temperature: substation.temperature,
        status: substation.status
    });
});

app.post('/api/substations', (req, res) => {
    const { name, voltageHigh, voltageMedium, voltageLow, transformerPower } = req.body;
    
    if (!name || !voltageHigh || !voltageLow || !transformerPower) {
        return res.status(400).json({ error: 'Відсутні обов\'язкові поля' });
    }

    const newSubstation = {
        id: substations.length > 0 ? Math.max(...substations.map(s => s.id)) + 1 : 1,
        name,
        voltageHigh,
        voltageMedium: voltageMedium || null,
        voltageLow,
        transformerPower,
        load: 0,
        temperature: 25,
        status: 'active'
    };

    substations.push(newSubstation);
    res.status(201).json(newSubstation);
});

app.put('/api/substations/:id', (req, res) => {
    const index = substations.findIndex(s => s.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: 'Підстанцію не знайдено' });
    }
    substations[index] = { id: parseInt(req.params.id), ...req.body };
    res.json(substations[index]);
});

app.patch('/api/substations/:id', (req, res) => {
    const index = substations.findIndex(s => s.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: 'Підстанцію не знайдено' });
    }
    substations[index] = { ...substations[index], ...req.body, id: parseInt(req.params.id) };
    res.json(substations[index]);
});

app.delete('/api/substations/:id', (req, res) => {
    const index = substations.findIndex(s => s.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: 'Підстанцію не знайдено' });
    }
    const deleted = substations.splice(index, 1);
    res.json({ message: 'Підстанцію видалено', substation: deleted[0] });
});

app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});