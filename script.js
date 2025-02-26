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

// Attendre que le DOM soit chargé pour exécuter le script
document.addEventListener('DOMContentLoaded', () => {
    const savedData = JSON.parse(localStorage.getItem('atlasEarthData')) || {};
    const commonInput = document.getElementById('common');
    const rareInput = document.getElementById('rare');
    const epicInput = document.getElementById('epic');
    const legendaryInput = document.getElementById('legendary');
    const boostTypeSelect = document.getElementById('boost-type');
    const badgesInput = document.getElementById('badges');
    const targetAmountInput = document.getElementById('target-amount');
    const targetAmountTerrainsInput = document.getElementById('target-amount-terrains');
    const targetTimeInput = document.getElementById('target-time');
    const timeUnitSelect = document.getElementById('time-unit');

    // Vérifier que les éléments existent avant de les manipuler
    if (commonInput && rareInput && epicInput && legendaryInput && boostTypeSelect && badgesInput && 
        targetAmountInput && targetAmountTerrainsInput && targetTimeInput && timeUnitSelect) {
        commonInput.value = savedData.common || 0;
        rareInput.value = savedData.rare || 0;
        epicInput.value = savedData.epic || 0;
        legendaryInput.value = savedData.legendary || 0;
        boostTypeSelect.value = savedData.boostType || 'inactive';
        badgesInput.value = savedData.badges || 0;
        targetAmountInput.value = savedData.targetAmount || 0;
        targetAmountTerrainsInput.value = savedData.targetAmountTerrains || 0;
        targetTimeInput.value = savedData.targetTime || 0;
        timeUnitSelect.value = savedData.timeUnit || 'hours';

        // Forcer un recalcul initial pour tous les champs
        calculateAll();

        // Ajouter les écouteurs d'événements pour recalculer à chaque changement
        [commonInput, rareInput, epicInput, legendaryInput, boostTypeSelect, badgesInput, 
         targetAmountInput, targetAmountTerrainsInput, targetTimeInput, timeUnitSelect].forEach(element => {
            if (element) {
                element.addEventListener('input', calculateAll);
            }
        });

        // Assurer que les onglets fonctionnent correctement dès le départ
        openTab('main-tab'); // Charger l'onglet principal par défaut
    } else {
        console.error('Un ou plusieurs éléments HTML sont manquants.');
    }
});

// Fonction pour gérer les onglets
function openTab(tabName) {
    const tabs = document.getElementsByClassName('tab-content');
    for (let tab of tabs) {
        tab.classList.remove('active');
    }
    const activeTab = document.getElementById(tabName);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    const buttons = document.getElementsByClassName('tab-button');
    for (let button of buttons) {
        button.classList.remove('active');
    }
    const activeButton = document.querySelector(`.tab-button[onclick="openTab('${tabName}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }

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
    const common = parseInt(document.getElementById('common')?.value) || 0;
    const rare = parseInt(document.getElementById('rare')?.value) || 0;
    const epic = parseInt(document.getElementById('epic')?.value) || 0;
    const legendary = parseInt(document.getElementById('legendary')?.value) || 0;
    const boostType = document.getElementById('boost-type')?.value || 'inactive';
    const badges = parseInt(document.getElementById('badges')?.value) || 0;

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
    const hourlySpan = document.getElementById('hourly');
    const dailySpan = document.getElementById('daily');
    const weeklySpan = document.getElementById('weekly');
    const monthlySpan = document.getElementById('monthly');
    const yearlySpan = document.getElementById('yearly');
    const badgeBoostSpan = document.getElementById('badge-boost');
    const mainBoostSpan = document.getElementById('main-boost');

    if (hourlySpan) hourlySpan.textContent = `$${hourly.toFixed(6) || '0.000000'}`;
    if (dailySpan) dailySpan.textContent = `$${daily.toFixed(6) || '0.000000'}`;
    if (weeklySpan) weeklySpan.textContent = `$${weekly.toFixed(6) || '0.000000'}`;
    if (monthlySpan) monthlySpan.textContent = `$${monthly.toFixed(6) || '0.000000'}`;
    if (yearlySpan) yearlySpan.textContent = `$${yearly.toFixed(6) || '0.000000'}`;
    if (badgeBoostSpan) {
        const badgePercent = ((getBadgeBoost(badges) - 1) * 100).toFixed(0);
        badgeBoostSpan.textContent = `${badgePercent}%`;
    }
    if (mainBoostSpan) mainBoostSpan.textContent = `x${mainBoost}`;

    // Sauvegarder les données
    const data = { 
        common, rare, epic, legendary, 
        boostType, badges, 
        targetAmount: document.getElementById('target-amount')?.value || 0, 
        targetAmountTerrains: document.getElementById('target-amount-terrains')?.value || 0, 
        targetTime: document.getElementById('target-time')?.value || 0, 
        timeUnit: document.getElementById('time-unit')?.value || 'hours' 
    };
    localStorage.setItem('atlasEarthData', JSON.stringify(data));
}

// Incrémenter une parcelle
function increment(type) {
    const input = document.getElementById(type);
    if (input) {
        input.value = (parseInt(input.value) || 0) + 1;
        calculateAll();
    }
}

// Réinitialiser les données
function resetData() {
    const commonInput = document.getElementById('common');
    const rareInput = document.getElementById('rare');
    const epicInput = document.getElementById('epic');
    const legendaryInput = document.getElementById('legendary');
    const boostTypeSelect = document.getElementById('boost-type');
    const badgesInput = document.getElementById('badges');
    const targetAmountInput = document.getElementById('target-amount');
    const targetAmountTerrainsInput = document.getElementById('target-amount-terrains');
    const targetTimeInput = document.getElementById('target-time');
    const timeUnitSelect = document.getElementById('time-unit');

    if (commonInput && rareInput && epicInput && legendaryInput && boostTypeSelect && badgesInput && 
        targetAmountInput && targetAmountTerrainsInput && targetTimeInput && timeUnitSelect) {
        commonInput.value = 0;
        rareInput.value = 0;
        epicInput.value = 0;
        legendaryInput.value = 0;
        boostTypeSelect.value = 'inactive';
        badgesInput.value = 0;
        targetAmountInput.value = 0;
        targetAmountTerrainsInput.value = 0;
        targetTimeInput.value = 0;
        timeUnitSelect.value = 'hours';
        localStorage.removeItem('atlasEarthData');
        calculateAll();
    }
}

// Calculer les prévisions (automatique)
function calculateForecasts() {
    const common = parseInt(document.getElementById('common')?.value) || 0;
    const rare = parseInt(document.getElementById('rare')?.value) || 0;
    const epic = parseInt(document.getElementById('epic')?.value) || 0;
    const legendary = parseInt(document.getElementById('legendary')?.value) || 0;
    const boostType = document.getElementById('boost-type')?.value || 'inactive';
    const badges = parseInt(document.getElementById('badges')?.value) || 0;
    const targetAmount = parseFloat(document.getElementById('target-amount')?.value) || 0;
    const targetAmountTerrains = parseFloat(document.getElementById('target-amount-terrains')?.value) || 0;
    const targetTime = parseFloat(document.getElementById('target-time')?.value) || 0;
    const timeUnit = document.getElementById('time-unit')?.value || 'hours';

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
        const timeResultSpan = document.getElementById('time-result');
        if (timeResultSpan) timeResultSpan.textContent = timeResult;
    } else {
        const timeResultSpan = document.getElementById('time-result');
        if (timeResultSpan) timeResultSpan.textContent = '0 secondes';
    }

    // 2. Terrains nécessaires pour X € en X temps
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
        const terrainsResultSpan = document.getElementById('terrains-result');
        if (terrainsResultSpan) terrainsResultSpan.textContent = Math.max(0, Math.ceil(totalNewTerrains));
    } else {
        const terrainsResultSpan = document.getElementById('terrains-result');
        if (terrainsResultSpan) terrainsResultSpan.textContent = '0';
    }
}