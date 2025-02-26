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

// Charger et initialiser les données sauvegardées au démarrage
window.onload = () => {
    const savedData = JSON.parse(localStorage.getItem('atlasEarthData')) || {};
    document.getElementById('common').value = savedData.common || 0;
    document.getElementById('rare').value = savedData.rare || 0;
    document.getElementById('epic').value = savedData.epic || 0;
    document.getElementById('legendary').value = savedData.legendary || 0;
    document.getElementById('boost-type').value = savedData.boostType || 'inactive';
    document.getElementById('badges').value = savedData.badges || 0;
    document.getElementById('target-amount').value = savedData.targetAmount || 0;
    document.getElementById('target-amount-terrains').value = savedData.targetAmountTerrains || 0;
    document.getElementById('target-time').value = savedData.targetTime || 0;
    document.getElementById('time-unit').value = savedData.timeUnit || 'hours';

    // Forcer un recalcul initial pour tous les champs
    calculateAll();

    // Ajouter les écouteurs d'événements pour recalculer à chaque changement
    document.querySelectorAll('input, select').forEach(element => {
        element.addEventListener('input', calculateAll);
    });

    // Assurer que les onglets fonctionnent correctement dès le départ
    openTab('main-tab'); // Charger l'onglet principal par défaut
};

// Fonction pour gérer les onglets
function openTab(tabName) {
    const tabs = document.getElementsByClassName('tab-content');
    for (let tab of tabs) {
        tab.classList.remove('active');
    }
    document.getElementById(tabName).classList.add('active');

    const buttons = document.getElementsByClassName('tab-button');
    for (let button of buttons) {
        button.classList.remove('active');
    }
    document.querySelector(`.tab-button[onclick="openTab('${tabName}')"]`).classList.add('active');

    // Forcer un recalcul après changement d'onglet
    calculateAll();
}

// Calculer le boost des badges
function getBadgeBoost(badges) {
    if (!badges || isNaN(badges) || badges < 1) return 1; // 0% si pas de badges ou valeur invalide
    if (badges >= 101) return 1.25; // 25%
    if (badges >= 61) return 1.20;  // 20%
    if (badges >= 31) return 1.15;  // 15%
    if (badges >= 11) return 1.10;  // 10%
    return 1.05;                    // 5%
}

// Calculer le boost journalier basé sur le nombre total de terrains
function getDailyBoost(totalParcels) {
    if (!totalParcels || isNaN(totalParcels) || totalParcels < 1) return 1;
    if (totalParcels >= 401) return 2;
    if (totalParcels >= 351) return 3;
    if (totalParcels >= 301) return 4;
    if (totalParcels >= 201) return 5;
    if (totalParcels >= 171) return 7;
    if (totalParcels >= 136) return 8;
    if (totalParcels >= 101) return 10;
    if (totalParcels >= 71) return 15;
    return 20;
}

// Calculer tous les éléments (revenus et prévisions)
function calculateAll() {
    try {
        calculateIncome();
        calculateForecasts();
    } catch (error) {
        console.error('Erreur dans calculateAll:', error);
    }
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
    const basePerSecond = (common * RATES.common + rare * RATES.rare + 
                          epic * RATES.epic + legendary * RATES.legendary) || 0;
    
    // Appliquer le boost des badges d'abord
    const badgeBoostedPerSecond = basePerSecond * getBadgeBoost(badges);

    // Déterminer le boost principal
    let mainBoost = 1;
    if (boostType === 'super') {
        mainBoost = 50; // Super Rent
    } else if (boostType === 'daily') {
        mainBoost = getDailyBoost(totalParcels);
    }

    // Appliquer le boost principal
    const totalPerSecond = badgeBoostedPerSecond * mainBoost;

    // Conversions
    const hourly = totalPerSecond * 3600;
    const daily = totalPerSecond * 86400;
    const weekly = totalPerSecond * 604800;
    const monthly = totalPerSecond * 2592000;
    const yearly = totalPerSecond * 31536000;

    // Afficher les résultats, avec une gestion des valeurs nulles ou négatives
    document.getElementById('hourly').textContent = `$${hourly.toFixed(6) || '0.000000'}`;
    document.getElementById('daily').textContent = `$${daily.toFixed(6) || '0.000000'}`;
    document.getElementById('weekly').textContent = `$${weekly.toFixed(6) || '0.000000'}`;
    document.getElementById('monthly').textContent = `$${monthly.toFixed(6) || '0.000000'}`;
    document.getElementById('yearly').textContent = `$${yearly.toFixed(6) || '0.000000'}`;

    // Afficher les boosts
    const badgePercent = ((getBadgeBoost(badges) - 1) * 100).toFixed(0);
    document.getElementById('badge-boost').textContent = `${badgePercent}%`;
    document.getElementById('main-boost').textContent = `x${mainBoost}`;

    // Sauvegarder les données
    const data = { 
        common, rare, epic, legendary, 
        boostType, badges, 
        targetAmount: document.getElementById('target-amount').value, 
        targetAmountTerrains: document.getElementById('target-amount-terrains').value, 
        targetTime: document.getElementById('target-time').value, 
        timeUnit: document.getElementById('time-unit').value 
    };
    localStorage.setItem('atlasEarthData', JSON.stringify(data));
}

// Incrémenter une parcelle
function increment(type) {
    const input = document.getElementById(type);
    input.value = (parseInt(input.value) || 0) + 1;
    calculateAll();
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
    document.getElementById('time-unit').value = 'hours';
    calculateAll();
}

// Calculer les prévisions (automatique)
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
    const basePerSecond = (common * RATES.common + rare * RATES.rare + 
                          epic * RATES.epic + legendary * RATES.legendary) || 0;
    const badgeBoost = getBadgeBoost(badges);
    let mainBoost = 1;
    if (boostType === 'super') {
        mainBoost = 50; // Super Rent
    } else if (boostType === 'daily') {
        mainBoost = getDailyBoost(totalParcels);
    }

    const totalPerSecond = basePerSecond * badgeBoost * mainBoost;

    // 1. Temps pour gagner X € (avec vos données actuelles)
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
    const targetTime = parseFloat(document.getElementById('target-time').value) || 0;
    const timeUnit = document.getElementById('time-unit').value;

    let targetSeconds = 0;
    switch (timeUnit) {
        case 'hours':
            targetSeconds = targetTime * 3600; // Heures en secondes
            break;
        case 'days':
            targetSeconds = targetTime * 86400; // Jours en secondes
            break;
        case 'months':
            targetSeconds = targetTime * 2592000; // Mois en secondes (30 jours)
            break;
        case 'years':
            targetSeconds = targetTime * 31536000; // Années en secondes (365 jours)
            break;
    }

    if (targetAmountTerrains > 0 && targetSeconds > 0) {
        const revenueNeededPerSecond = targetAmountTerrains / targetSeconds;

        // Calculer combien de terrains supplémentaires sont nécessaires
        let additionalRevenueNeeded = revenueNeededPerSecond / (badgeBoost * mainBoost);
        let totalNewTerrains = 0;

        // Distribuer les nouveaux terrains selon les pourcentages de rareté
        while (additionalRevenueNeeded > 0 && totalNewTerrains < 1000000) { // Limite pour éviter une boucle infinie
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
        }

        // Afficher le résultat arrondi
        document.getElementById('terrains-result').textContent = Math.max(0, Math.ceil(totalNewTerrains));
    } else {
        document.getElementById('terrains-result').textContent = '0';
    }
}