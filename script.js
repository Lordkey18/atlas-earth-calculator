// Loyers de base par seconde
const RATES = {
    common: 0.0000000011,
    rare: 0.0000000016,
    epic: 0.0000000022,
    legendary: 0.0000000044
};

// Pourcentages de rareté des terrains
const RARITY = {
    common: 0.50,   // 50%
    rare: 0.30,     // 30%
    epic: 0.15,     // 15%
    legendary: 0.05 // 5%
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

// Calculer les revenus actuels
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
    document.getElementById('main-boost').textContent = `x${mainBoost}`;

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
    document.getElementById('target-amount').value = 0;
    document.getElementById('target-amount-terrains').value = 0;
    document.getElementById('target-time').value = 0;
    calculateIncome();
    calculateForecasts();
}

// Calculer les prévisions
function calculateForecasts() {
    const common = parseInt(document.getElementById('common').value) || 0;
    const rare = parseInt(document.getElementById('rare').value) || 0;
    const epic = parseInt(document.getElementById('epic').value) || 0;
    const legendary = parseInt(document.getElementById('legendary').value) || 0;
    const boostType = document.getElementById('boost-type').value;
    const badges = parseInt(document.getElementById('badges').value) || 0;

    // Total des parcelles actuelles
    const totalParcels = common + rare + epic + legendary;

    // Revenu total par seconde (comme dans calculateIncome)
    const basePerSecond = common * RATES.common + rare * RATES.rare + 
                         epic * RATES.epic + legendary * RATES.legendary;
    const badgeBoost = getBadgeBoost(badges);
    let mainBoost;
    if (boostType === 'super') {
        mainBoost = 50; // Super Rent
    } else if (boostType === 'daily') {
        mainBoost = getDailyBoost(totalParcels);
    } else {
        mainBoost = 1; // Inactif
    }
    const totalPerSecond = basePerSecond * badgeBoost * mainBoost;

    // 1. Temps pour gagner X €
    const targetAmount = parseFloat(document.getElementById('target-amount').value) || 0;
    if (targetAmount > 0 && totalPerSecond > 0) {
        const secondsNeeded = targetAmount / totalPerSecond;
        let timeResult = '';
        if (secondsNeeded < 60) {
            timeResult = `${secondsNeeded.toFixed(2)} secondes`;
        } else if (secondsNeeded < 3600) {
            timeResult = `${(secondsNeeded / 60).toFixed(2)} minutes`;
        } else if (secondsNeeded < 86400) {
            timeResult = `${(secondsNeeded / 3600).toFixed(2)} heures`;
        } else if (secondsNeeded < 2592000) {
            timeResult = `${(secondsNeeded / 86400).toFixed(2)} jours`;
        } else {
            timeResult = `${(secondsNeeded / 2592000).toFixed(2)} mois`;
        }
        document.getElementById('time-result').textContent = timeResult;
    } else {
        document.getElementById('time-result').textContent = '0 secondes';
    }

    // 2. Terrains nécessaires pour X € en X temps
    const targetAmountTerrains = parseFloat(document.getElementById('target-amount-terrains').value) || 0;
    const targetTimeHours = parseFloat(document.getElementById('target-time').value) || 0;
    if (targetAmountTerrains > 0 && targetTimeHours > 0) {
        const targetSeconds = targetTimeHours * 3600;
        const revenueNeededPerSecond = targetAmountTerrains / targetSeconds;

        // Calculer combien de terrains supplémentaires sont nécessaires
        let additionalRevenueNeeded = revenueNeededPerSecond / (badgeBoost * mainBoost);
        let totalNewTerrains = 0;

        // Distribuer les nouveaux terrains selon les pourcentages de rareté
        while (additionalRevenueNeeded > 0) {
            const random = Math.random();
            if (random < RARITY.common) {
                totalNewTerrains++;
                additionalRevenueNeeded -= RATES.common;
            } else if (random < RARITY.common + RARITY.rare) {
                totalNewTerrains++;
                additionalRevenueNeeded -= RATES.rare;
            } else if (random < RARITY.common + RARITY.rare + RARITY.epic) {
                totalNewTerrains++;
                additionalRevenueNeeded -= RATES.epic;
            } else {
                totalNewTerrains++;
                additionalRevenueNeeded -= RATES.legendary;
            }
            // Arrêter si on dépasse ou si on approche zéro
            if (totalNewTerrains > 1000000) break; // Limite pour éviter une boucle infinie
        }

        // Afficher le résultat arrondi
        document.getElementById('terrains-result').textContent = Math.max(0, Math.ceil(totalNewTerrains));
    } else {
        document.getElementById('terrains-result').textContent = '0';
    }
}