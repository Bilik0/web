const params = {
    rad: { min: 400, max: 1000, normMin: 600, normMax: 900, dec: 0 },
    pow: { min: 0, max: 500, normMin: 100, normMax: 450, dec: 1 },
    vol: { min: 600, max: 800, normMin: 650, normMax: 750, dec: 1 },
    tmp: { min: 20, max: 85, normMin: 30, normMax: 70, dec: 1 },
    eff: { min: 12, max: 20, normMin: 15, normMax: 18, dec: 1 }
};

let autoInterval = null;
let isAutoEnabled = false;
let accumulatedEnergy = 0;

function getRandom(min, max, decimals) {
    return (Math.random() * (max - min) + min).toFixed(decimals);
}

function determineStatus(value, normMin, normMax) {
    const v = parseFloat(value);
    if (v >= normMin && v <= normMax) return 'normal';
    return 'danger';
}

function updateExtras(power) {
    const hours = new Date().getHours();
    const timeOfDayEl = document.getElementById('timeOfDay');
    
    if (hours >= 6 && hours < 20) {
        timeOfDayEl.textContent = 'День';
        timeOfDayEl.style.color = 'var(--warning)';
    } else {
        timeOfDayEl.textContent = 'Ніч';
        timeOfDayEl.style.color = 'var(--bg-gradient-start)';
    }

    const inverterEl = document.getElementById('inverterStatus');
    if (power > 5) {
        inverterEl.textContent = 'Активний';
        inverterEl.style.color = 'var(--success)';
    } else {
        inverterEl.textContent = 'Очікування';
        inverterEl.style.color = 'var(--text-muted)';
    }

    accumulatedEnergy += power * (3 / 3600);
    document.getElementById('dailyEnergy').textContent = accumulatedEnergy.toFixed(2);
}

function updateDashboard() {
    let currentPower = 0;

    for (const [id, config] of Object.entries(params)) {
        const val = getRandom(config.min, config.max, config.dec);
        
        document.getElementById(`val_${id}`).textContent = val;
        
        const status = determineStatus(val, config.normMin, config.normMax);
        const indicator = document.getElementById(`status_${id}`);
        
        indicator.className = `status-indicator status-${status}`;
        indicator.textContent = status === 'normal' ? 'Норма' : 'Критично';

        if (id === 'pow') currentPower = parseFloat(val);
    }

    updateExtras(currentPower);

    const now = new Date();
    document.getElementById('lastUpdate').textContent = now.toLocaleTimeString('uk-UA');
}

function toggleAutoUpdate() {
    const btn = document.getElementById('autoUpdateBtn');
    const statusText = document.getElementById('autoStatus');

    if (!isAutoEnabled) {
        updateDashboard();
        autoInterval = setInterval(updateDashboard, 3000);
        isAutoEnabled = true;
        
        btn.textContent = 'Зупинити';
        btn.className = 'btn btn-danger';
        statusText.textContent = 'Увімкнено (3 сек)';
        statusText.style.background = 'var(--success)';
        statusText.style.color = 'white';
    } else {
        clearInterval(autoInterval);
        isAutoEnabled = false;
        
        btn.textContent = 'Автооновлення';
        btn.className = 'btn btn-success';
        statusText.textContent = 'Вимкнено';
        statusText.style.background = '#e0e0e0';
        statusText.style.color = 'var(--text-main)';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    
    document.getElementById('updateBtn').addEventListener('click', updateDashboard);
    document.getElementById('autoUpdateBtn').addEventListener('click', toggleAutoUpdate);
});