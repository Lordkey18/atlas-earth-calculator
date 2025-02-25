// Loyers de base par seconde (valeurs corrigées)
const RATES = {
    common: 0.0000000011,
    rare: 0.0000000016,
    epic: 0.0000000022,
    legendary: 0.0000000044
};

// Charger les données sauvegardées au démarrage
window.onload = () => {
    const savedData = JSON.parse(localStorage.getItem('atlasEarthData')) || {};
    document.getElementById('common').value = savedData.common || 0;
    document.getElementById('rare').value = savedData.rare || 0;
    document.getElementById('epic').value = savedData.epic || 0;
    document.getElementById('legendary').value = savedData.legendary || 0;
    document.getElementById('boost').value = savedData.boost || 1;
    calculateIncome();

    // Recalcul en temps réel
    document.querySelectorAll('input, select').forEach(element => {
        element.addEventListener('input', calculateIncome);
    });
};

// Calculer les revenus
function calculateIncome() {
    const common = parseInt(document.getElementById('common').value) || 0;
    const rare = parseInt(document.getElementById('rare').value) || 0;
    const epic = parseInt(document.getElementById('epic').value) || 0;
    const legendary = parseInt(document.getElementById('legendary').value) || 0;
    const boost = parseInt(document.getElementById('boost').value) || 1;

    // Revenu total par seconde sans boost
    const basePerSecond = common * RATES.common + rare * RATES.rare + 
                         epic * RATES.epic + legendary * RATES.legendary;
    
    // Appliquer le boost au total
    const totalPerSecond = basePerSecond * boost;

    // Conversions
    const hourly = totalPerSecond * 3600;
    const daily = totalPerSecond * 86400;
    const weekly = totalPerSecond * 604800;
    const monthly = totalPerSecond * 2592000;
    const yearly = totalPerSecond * 31536000;

    // Afficher les résultats
    document.getElementById('hourly').textContent = `$${hourly.toFixed(6)}`;
    document.getElementById('daily').textContent = `$${daily.toFixed(6)}`;
    document.getElementById('weekly').textContent = `$${weekly.toFixed(6)}`;
    document.getElementById('monthly').textContent = `$${monthly.toFixed(6)}`;
    document.getElementById('yearly').textContent = `$${yearly.toFixed(6)}`;

    // Sauvegarder les données
    const data = { common, rare, epic, legendary, boost };
    localStorage.setItem('atlasEarthData', JSON.stringify(data));
}

// Réinitialiser les données
function resetData() {
    localStorage.removeItem('atlasEarthData');
    document.getElementById('common').value = 0;
    document.getElementById('rare').value = 0;
    document.getElementById('epic').value = 0;
    document.getElementById('legendary').value = 0;
    document.getElementById('boost').value = 1;
    calculateIncome();
}