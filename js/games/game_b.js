function draw(state, config) {
    state.pityCount++;
    let currentSsrRate = config.ssrRate;
    const isPity = state.pityCount >= config.pity;

    // Soft pity calculation
    if (isPity) {
        currentSsrRate = 1; // Guaranteed SSR at hard pity
    } else if (state.pityCount >= config.softPityStart) {
        // Linear increase in probability after soft pity starts
        currentSsrRate += (1 - config.ssrRate) * ((state.pityCount - config.softPityStart + 1) / (config.pity - config.softPityStart + 1));
    }

    const rand = Math.random();
    if (rand < currentSsrRate) {
        let isPu = false;
        // Check for guaranteed PU or win the 50/50
        if (state.isGuaranteedPu || Math.random() < config.puRate) {
            isPu = true;
            state.isGuaranteedPu = false; // Guarantee is consumed
        } else {
            isPu = false;
            state.isGuaranteedPu = true; // Guarantee is set for the next SSR
        }
        const result = { rarity: 'SSR', isPu, guaranteed: isPity };
        state.pityCount = 0; // Pity resets on any SSR
        return result;
    } else if (rand < currentSsrRate + config.srRate) {
        return { rarity: 'SR' };
    }

    return { rarity: 'R' };
}

export const game_b = {
    id: 'game_b',
    name: '元素反応バトル',
    ssrRate: 0.006,
    srRate: 0.051,
    pity: 90,
    pityType: 'direct',
    softPityStart: 74,
    puRate: 0.5,
    pityDesc: '90回で最高レアが確定。74回から確率上昇。すり抜けたら次回最高レアはPU確定。',
    has10PullGuarantee: true,
    draw: draw,
};
