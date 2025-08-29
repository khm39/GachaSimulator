/**
 * A more advanced, unified draw function for various gacha mechanics.
 * It is data-driven by the `config` object.
 * Supports:
 * - Hard pity
 * - Rate-up steps (`rateSteps`)
 * - Programmatic soft pity (`softPity`)
 * - 50/50 guarantee system (`fiftyFifty`)
 */
export function unifiedDraw(state, config) {
    // --- State Updates ---
    state.pityCount++;
    if (config.hasExchangePoints) {
        state.exchangePoints++;
    }

    // --- Rate Calculation ---
    let currentSsrRate = config.ssrRate;

    // Soft Pity
    if (config.softPity) {
        const { start, factor, type = 'additive' } = config.softPity;
        if (state.pityCount >= start) {
            if (type === 'additive') {
                currentSsrRate += (state.pityCount - (start - 1)) * factor;
            } else if (type === 'linear') {
                // Linear interpolation from base rate to 1.0
                currentSsrRate += (1.0 - config.ssrRate) * ((state.pityCount - start + 1) / (config.pity - start + 1));
            }
        }
    }

    // Rate Steps (overwrites soft pity if both are defined for a given count)
    if (config.rateSteps) {
        for (const step of config.rateSteps) {
            if (state.pityCount >= step.after) {
                currentSsrRate = step.ssrRate;
            }
        }
    }

    // Hard Pity (highest priority)
    const isHardPity = config.pity > 0 && state.pityCount >= config.pity;
    if (isHardPity) {
        currentSsrRate = 1.0;
    }

    // --- Drawing ---
    const rand = Math.random();
    if (rand < currentSsrRate) {
        // --- SSR Result ---
        let isPu = false;

        // Determine if it's a Pick-Up
        if (config.fiftyFifty) {
            if (state.isGuaranteedPu || Math.random() < 0.5) {
                isPu = true;
                state.isGuaranteedPu = false;
            } else {
                isPu = false;
                state.isGuaranteedPu = true;
            }
        } else if (config.puRateIsAbsolute) {
            isPu = rand < config.puSsrRate;
        } else if (config.puRate) {
            isPu = Math.random() < config.puRate;
        } else {
            isPu = true; // Default to PU if no system is defined
        }

        // Reset pity counter if configured to do so
        if (config.pityResetsOnRandom !== false) {
             state.pityCount = 0;
        }

        return { rarity: 'SSR', isPu, guaranteed: isHardPity };

    } else if (rand < currentSsrRate + config.srRate) {
        // --- SR Result ---
        return { rarity: 'SR' };
    }

    // --- R Result ---
    return { rarity: 'R' };
}


// The old draw function is no longer needed and has been removed.

// Game configurations have been moved to their own files.
// This file now only contains common, shared logic.
