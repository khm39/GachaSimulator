/**
 * Calculates the current SSR rate based on the game's state and configuration.
 * This logic is shared between the draw simulation and the UI display.
 * @param {object} state The current simulation state.
 * @param {object} config The configuration for the selected game.
 * @returns {number} The calculated current SSR rate.
 */
export function calculateCurrentSsrRate(state, config) {
    let currentSsrRate = config.ssrRate;

    // Soft Pity
    if (config.softPity) {
        const { start, factor, type = 'additive' } = config.softPity;
        if (state.pityCount >= start) {
            if (type === 'additive') {
                currentSsrRate += (state.pityCount - (start - 1)) * factor;
            } else if (type === 'linear') {
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

     // Hard Pity (the highest priority)
    if (config.pity > 0 && state.pityCount >= config.pity) {
        currentSsrRate = 1.0;
    }

    return currentSsrRate;
}


/**
 * A more advanced, unified draw function for various gacha mechanics.
 * It is data-driven by the `config` object.
 * Supports:
 * - Hard pity
 * - Rate-up steps (`rateSteps`)
 * - Programmatic soft pity (`softPity`)
 * - Pick-up rate guarantees (e.g., 50/50) via `puRate`
 */
export function unifiedDraw(state, config) {
    // --- State Updates ---
    state.pityCount++;

    // --- Rate Calculation ---
    const currentSsrRate = calculateCurrentSsrRate(state, config);
    const isHardPity = config.pity > 0 && state.pityCount >= config.pity;

    // --- Drawing ---
    const rand = Math.random();
    if (rand < currentSsrRate) {
        // --- SSR Result ---
        let isPu;

        // Determine if it's a Pick-Up
        if (isHardPity) {
            isPu = true;
            // A hard pity pull is the ultimate guarantee, so it consumes any 50/50 guarantee state.
            state.isGuaranteedPu = false;
        } else if (config.puRate) {
            // puRate can be used for 50/50 style guarantees.
            // If puRate is 0.5, it's a 50/50. If it's 0.7, it's a 70/30.
            // A guarantee is only used if the puRate is less than 1.0 (100%)
            if (state.isGuaranteedPu || Math.random() < config.puRate) {
                isPu = true;
                state.isGuaranteedPu = false;
            } else {
                isPu = false;
                // Only set the guarantee if the rate is not 100%
                if (config.puRate < 1.0) {
                    state.isGuaranteedPu = true;
                }
            }
        } else {
            isPu = true; // Default to PU if no system is defined
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
