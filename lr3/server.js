const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'data', 'substations.json');

function readData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function writeData(data) {
    try {
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        return false;
    }
}

app.get('/api/substations', (req, res) => {
    const substations = readData();
    res.json(substations);
});

app.post('/api/substations', (req, res) => {
    try {
        const newSubstation = {
            id: Date.now().toString(),
            name: req.body.name,
            type: req.body.type,
            address: req.body.address,
            power: req.body.power,
            voltage: req.body.voltage,
            transformers: req.body.transformers,
            year: req.body.year,
            state: req.body.state,
            registrationDate: new Date().toISOString()
        };

        const substations = readData();
        substations.push(newSubstation);

        if (writeData(substations)) {
            res.status(201).json({ success: true, data: newSubstation });
        } else {
            throw new Error('Write error');
        }
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.delete('/api/substations/:id', (req, res) => {
    try {
        const substations = readData();
        const filtered = substations.filter(c => c.id !== req.params.id);
        if (writeData(filtered)) {
            res.json({ success: true });
        } else {
            throw new Error('Write error');
        }
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});