const form = document.getElementById('substationForm');
const listContainer = document.getElementById('substationsList');
const filterState = document.getElementById('filterState');
let globalData = [];

document.addEventListener('DOMContentLoaded', loadData);
filterState.addEventListener('change', renderData);

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch('/api/substations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            form.reset();
            loadData();
        }
    } catch (error) {
        console.error(error);
    }
});

async function loadData() {
    try {
        const response = await fetch('/api/substations');
        globalData = await response.json();
        renderData();
    } catch (error) {
        console.error(error);
    }
}

function renderData() {
    const filterVal = filterState.value;
    const filtered = globalData.filter(item => filterVal === 'all' || item.state === filterVal);
    
    listContainer.innerHTML = '';
    
    if (filtered.length === 0) {
        listContainer.innerHTML = '<p>Немає даних для відображення.</p>';
        return;
    }

    const currentYear = new Date().getFullYear();

    filtered.forEach(item => {
        const age = currentYear - parseInt(item.year);
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${item.name}</h3>
            <p><span class="label-bold">Тип:</span> ${getTypeName(item.type)}</p>
            <p><span class="label-bold">Клас напруги:</span> ${item.voltage} кВ</p>
            <p><span class="label-bold">Потужність:</span> ${item.power} МВА</p>
            <p><span class="label-bold">Трансформаторів:</span> ${item.transformers} шт.</p>
            <p><span class="label-bold">Адреса:</span> ${item.address}</p>
            <p><span class="label-bold">Рік введення:</span> ${item.year} (Вік: ${age} р.)</p>
            <p><span class="label-bold">Стан:</span> ${getStateName(item.state)}</p>
            <button class="btn btn-delete" onclick="deleteItem('${item.id}')">Видалити</button>
        `;
        listContainer.appendChild(card);
    });
}

async function deleteItem(id) {
    if (!confirm('Видалити цей запис?')) return;
    try {
        const response = await fetch(`/api/substations/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) loadData();
    } catch (error) {
        console.error(error);
    }
}

function getTypeName(type) {
    const types = {
        'transform': 'Трансформаторна',
        'distribute': 'Розподільча',
        'stepup': 'Підвищувальна',
        'stepdown': 'Знижувальна'
    };
    return types[type] || type;
}

function getStateName(state) {
    const states = {
        'active': 'В експлуатації',
        'repair': 'В ремонті',
        'decommissioned': 'Виведена з експлуатації'
    };
    return states[state] || state;
}