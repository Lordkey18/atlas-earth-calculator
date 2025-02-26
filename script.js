// ... (reste de script.js inchangé jusqu'à calculateForecasts) ...

// Calculer les prévisions (automatique)
function calculateForecasts() {
    const common = parseInt(document.getElementById('common')?.value) || 0;
    const rare = parseInt(document.getElementById('rare')?.value) || 0;
    const epic = parseInt(document.getElementById('epic')?.value) || 0;
    const legendary = parseInt(document.getElementById('legendary')?.value) || 0;
    const boostType = document.getElementById('boost-type')?.value || 'inactive';
    const badges = parseInt(document.getElementById('badges')?.value) || 0;

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
    const targetAmount = parseFloat(document.getElementById('target-amount')?.value) || 0;
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
    const targetAmountTerrains = parseFloat(document.getElementById('target-amount-terrains')?.value) || 0;
    const targetTime = parseFloat(document.getElementById('target-time')?.value) || 0;
    const timeUnit = document.getElementById('time-unit')?.value || 'hours';

    let targetSeconds = 0;
    if (targetTime > 0) {
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
    }

    if (targetAmountTerrains > 0 && targetSeconds > 0 && totalPerSecond > 0) {
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
            // Arrêter si on approche de zéro pour éviter des valeurs résiduelles très petites
            if (additionalRevenueNeeded < 0.0000000001) break;
        }

        // Afficher le résultat arrondi
        const terrainsResultSpan = document.getElementById('terrains-result');
        if (terrainsResultSpan) terrainsResultSpan.textContent = Math.max(0, Math.ceil(totalNewTerrains));
    } else {
        const terrainsResultSpan = document.getElementById('terrains-result');
        if (terrainsResultSpan) terrainsResultSpan.textContent = '0';
    }
}

// ... (reste de script.js inchangé : increment, resetData) ...