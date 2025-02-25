// Loyers de base par seconde
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
    document.getElementById('boost-type').value = savedData.boostType || 'inactive';
    document.getElementById('badges').value = savedData.badges || 0;
    calculateIncome();

    // Recalcul en temps réel
    document.querySelectorAll('input, select').forEach(element => {
        element.addEventListener('input', calculateIncome);
    });
};

// Calculer le boost des badges
function getBadgeBoost(badges) {
    if (badges >= 101) return 1.25; // 25%
    if (badges >= 61) return 1.20;  // 20%
    if (badges >= 31) return 1.15;  // 15%
    if (badges >= 11) return 1.10;  // 10%
    if (badges >= 1) return 1.05;   // 5%
    return 1;                       // 0%
}

// Calculer le boost journalier basé sur le nombre total de terrains
function getDailyBoost(totalParcels) {
    if (totalParcels >= 401) return 2;
    if (totalParcels >= 351) return 3;
    if (totalParcels >= 301) return 4;
    if (totalParcels >= 201) return 5;
    if (totalParcels >= 171) return 7;
    if (totalParcels >= 136) return 8;
    if (totalParcels >= 101) return 10;
    if (totalParcels >= 71) return 15;
    if (totalParcels >= 1) return 20;
    return 1;
}

// Calculer les revenus
function calculateIncome() {
    const common = parseInt(document.getElementById('common').value) || 0;
    const rare = parseInt(document.getElementById('rare').value) || 0;
    const epic = parseInt(document.getElementById('epic').value) || 0;
    const legendary = parseInt(document.getElementById('legendary').value) || 0;
    const boostType = document.getElementById('boost-type').value;
    const badges = parseInt(document.getElementById('badges').value) || 0;

    // Total des parcelles
    const totalParcels = common + rare + epic + legendary;

    // Revenu total par seconde sans boost
    const basePerSecond = common * RATES.common + rare * RATES.rare + 
                         epic * RATES.epic + legendary * RATES.legendary;
    
    // Appliquer le boost des badges d'abord
    const badgeBoostedPerSecond = basePerSecond * getBadgeBoost(badges);

    // Déterminer le boost principal
    let mainBoost;
    if (boostType === 'super') {
        mainBoost = 50; // Super Rent
    } else if (boostType === 'daily') {
        mainBoost = getDailyBoost(totalParcels);
    } else {
        mainBoost = 1; // Inactif
    }

    // Appliquer le boost principal
    const totalPerSecond = badgeBoostedPerSecond * mainBoost;

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

    // Afficher les boosts
    const badgePercent = ((getBadgeBoost(badges) - 1) * 100).toFixed(0);
    document.getElementById('badge-boost').textContent = `${badgePercent}%`;
    document.getElementById('main-boost').textContent = `${mainBoost * 100}%`;

    // Sauvegarder les données
    const data = { common, rare, epic, legendary, boostType, badges };
    localStorage.setItem('atlasEarthData', JSON.stringify(data));
}

// Incrémenter une parcelle
function increment(type) {
    const input = document.getElementById(type);
    input.value = (parseInt(input.value) || 0) + 1;
    calculateIncome();
}

// Réinitialiser les données
function resetData() {
    localStorage.removeItem('atlasEarthData');
    document.getElementById('common').value = 0;
    document.getElementById('rare').value = 0;
    document.getElementById('epic').value = 0;
    document.getElementById('legendary').value = 0;
    document.getElementById('boost-type').value = 'inactive';
    document.getElementById('badges').value = 0;
    calculateIncome();
}