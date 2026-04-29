class EnergyMonitor {
    constructor() {
        this.powerChart = null;
        this.pieChart = null;
        this.dataHistory = [];
        this.initCharts();
        this.connectWebSocket();
    }

    initCharts() {
        const ctxPower = document.getElementById('powerChart').getContext('2d');
        this.powerChart = new Chart(ctxPower, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Потужність (кВт)',
                    data: [],
                    borderColor: 'rgb(255, 159, 64)',
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } }
            }
        });

        const ctxPie = document.getElementById('generationPieChart').getContext('2d');
        this.pieChart = new Chart(ctxPie, {
            type: 'pie',
            data: {
                labels: ['0-4 год', '4-8 год', '8-12 год', '12-16 год', '16-20 год', '20-24 год'],
                datasets: [{
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
                }]
            },
            options: { responsive: true }
        });
    }

    connectWebSocket() {
        this.socket = new WebSocket('ws://localhost:8080');

        this.socket.onopen = () => {
            document.getElementById('status').textContent = 'Онлайн';
            document.getElementById('status').className = 'status-online';
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.updateDisplay(data);
        };

        this.socket.onerror = () => {
            document.getElementById('status').textContent = 'Помилка';
            document.getElementById('status').className = 'status-offline';
        };

        this.socket.onclose = () => {
            document.getElementById('status').textContent = 'Офлайн';
            document.getElementById('status').className = 'status-offline';
            setTimeout(() => this.connectWebSocket(), 5000);
        };
    }

    updateDisplay(data) {
        document.getElementById('currentPower').textContent = `${data.power.toFixed(2)} кВт`;
        document.getElementById('dailyGeneration').textContent = `${data.dailyGeneration.toFixed(2)} кВт·год`;
        document.getElementById('efficiency').textContent = `${data.efficiency.toFixed(1)} %`;
        document.getElementById('illumination').textContent = `${data.illumination.toFixed(0)} Вт/м²`;
        document.getElementById('temperature').textContent = `${data.temperature.toFixed(1)} °C`;

        const time = new Date(data.timestamp).toLocaleTimeString();
        this.powerChart.data.labels.push(time);
        this.powerChart.data.datasets[0].data.push(data.power);

        if (this.powerChart.data.labels.length > 20) {
            this.powerChart.data.labels.shift();
            this.powerChart.data.datasets[0].data.shift();
        }
        this.powerChart.update();

        this.pieChart.data.datasets[0].data = data.hourlyDistribution;
        this.pieChart.update();

        Plotly.newPlot('heatmapChart', [{
            z: data.panelMatrix,
            type: 'heatmap',
            colorscale: 'YlOrRd'
        }], { 
            margin: { t: 10, b: 20, l: 30, r: 10 }, 
            height: 300 
        });

        this.dataHistory.unshift(data);
        if (this.dataHistory.length > 10) {
            this.dataHistory.pop();
        }
        this.updateTable();
    }

    updateTable() {
        const tableDiv = document.getElementById('dataTable');
        let html = `
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Час</th>
                        <th>Потужність (кВт)</th>
                        <th>Освітленість (Вт/м²)</th>
                        <th>Температура (°C)</th>
                        <th>Ефективність (%)</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        this.dataHistory.forEach(item => {
            html += `
                <tr>
                    <td>${new Date(item.timestamp).toLocaleTimeString()}</td>
                    <td>${item.power.toFixed(2)}</td>
                    <td>${item.illumination.toFixed(0)}</td>
                    <td>${item.temperature.toFixed(1)}</td>
                    <td>${item.efficiency.toFixed(1)}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        tableDiv.innerHTML = html;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EnergyMonitor();
});