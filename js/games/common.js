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
    state.pityCount++;

    // --- Rate Calculation ---
    let currentSsrRate = config.ssrRate;

    // Method 1: Rate steps (for dynamic_rate)
    if (config.rateSteps) {
        for (const step of config.rateSteps) {
            if (state.pityCount >= step.after) {
                currentSsrRate = step.ssrRate;
            }
        }
    }

    // Method 2: Programmatic soft pity (for pity_gacha)
    if (config.softPity) {
        const { start, factor } = config.softPity;
        if (state.pityCount >= start) {
            currentSsrRate += (state.pityCount - (start - 1)) * factor;
        }
    }

    // Hard Pity (common to both)
    const isHardPity = state.pityCount >= config.pity;
    if (isHardPity) {
        currentSsrRate = 1.0;
    }

    // --- Drawing ---
    const rand = Math.random();
    if (rand < currentSsrRate) {
        // It's an SSR
        state.pityCount = 0; // Reset pity on any SSR
        let isPu = false;

        // --- 50/50 Logic ---
        if (config.fiftyFifty) {
            if (state.isGuaranteedPu) {
                isPu = true;
                state.isGuaranteedPu = false; // Reset guarantee
            } else {
                if (Math.random() < 0.5) {
                    isPu = true;
                } else {
                    // Lost 50/50, guarantee next one
                    isPu = false;
                    state.isGuaranteedPu = true;
                }
            }
        } else {
            // If no 50/50 system, every SSR is a "pickup" by default
            isPu = true;
        }
        return { rarity: 'SSR', isPu, guaranteed: isHardPity };

    } else if (rand < currentSsrRate + config.srRate) {
        return { rarity: 'SR' };
    }

    return { rarity: 'R' };
}


/**
 * Generic draw logic for standard gacha systems.
 * @param {object} state The current simulation state.
 * @param {object} config The configuration for the specific game.
 * @returns {object} The result of the draw (e.g., { rarity: 'R' }).
 */
function draw(state, config) {
    state.pityCount++;
    if (config.pityType === 'exchange') {
        state.exchangePoints++;
    }

    let result = { rarity: 'R', isPu: false, guaranteed: false };

    // Check for direct pity
    if (config.pityType === 'direct' && config.pity > 0 && state.pityCount >= config.pity) {
        result = { rarity: 'SSR', isPu: true, guaranteed: true };
        state.pityCount = 0; // Reset pity
        return result;
    }

    const rand = Math.random();
    if (rand < config.ssrRate) {
        result = { rarity: 'SSR', isPu: Math.random() < (config.puRate || 0.5) };
        // Note: Generic draw doesn't reset pity on random SSR, some games do.
        // This can be overridden in specific game modules.
    } else if (rand < config.ssrRate + config.srRate) {
        result = { rarity: 'SR' };
    }

    return result;
}

// --- Game Configurations ---

export const game_c = {
    id: 'game_c',
    name: '育成レース',
    ssrRate: 0.03,
    srRate: 0.18,
    pity: 200,
    pityType: 'exchange',
    pointName: '交換Pt',
    puRate: 0.5,
    pityDesc: '200回引くと「交換Pt」が200貯まり、PU対象と交換可能。',
    has10PullGuarantee: true,
    draw: draw,
};

export const game_d = {
    id: 'game_d',
    name: '学園戦術',
    ssrRate: 0.025,
    srRate: 0.18,
    pity: 200,
    pityType: 'exchange',
    pointName: '交換Pt',
    puRate: 0.5,
    pityDesc: '200回引くと「交換Pt」が200貯まり、PU対象と交換可能。',
    has10PullGuarantee: true,
    draw: draw,
};

export const game_f = {
    id: 'game_f',
    name: '王道RPG',
    ssrRate: 0.03,
    srRate: 0.15,
    pity: 300,
    pityType: 'exchange',
    pointName: '交換Pt',
    puRate: 0.5,
    pityDesc: '300回引くと「交換Pt」が300貯まり、PU対象などと交換可能。',
    has10PullGuarantee: true,
    draw: draw,
};

export const custom = {
    id: 'custom',
    name: 'カスタム',
    ssrRate: 0.03, // Default values
    srRate: 0.15,
    pity: 200,
    pityType: 'exchange',
    pointName: '交換Pt',
    puRate: 0.5,
    pityDesc: 'カスタム設定でシミュレーションします。',
    draw: draw,
};
