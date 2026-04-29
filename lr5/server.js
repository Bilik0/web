const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

function generateData() {
    return {
        timestamp: Date.now(),
        power: 800 + Math.random() * 200,
        dailyGeneration: 4500 + Math.random() * 50,
        efficiency: 18 + Math.random() * 4,
        illumination: 900 + Math.random() * 100,
        temperature: 45 + Math.random() * 10,
        hourlyDistribution: [5, 15, 25, 30, 20, 5],
        panelMatrix: Array.from({length: 4}, () => 
            Array.from({length: 6}, () => 15 + Math.random() * 7)
        )
    };
}

wss.on('connection', (ws) => {
    const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(generateData()));
        }
    }, 2000);

    ws.on('close', () => {
        clearInterval(interval);
    });
});