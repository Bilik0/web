const users = [];
const logs = [];

let substationData = {
    voltage: 110,
    current: 450,
    power: 49.5,
    mode: 'normal'
};

function addLog(action, user) {
    logs.push({
        timestamp: new Date().toISOString(),
        action,
        user: user.email
    });
}

module.exports = { 
    users, 
    logs, 
    substationData, 
    addLog 
};