function draw(state, config) {
    state.pityCount++;
    let currentSsrRate = config.ssrRate;

    // Apply rate-up steps
    for (const step of config.rateSteps) {
        if (state.pityCount >= step.after) {
            currentSsrRate = step.ssrRate;
        }
    }

    const isPity = state.pityCount >= config.pity;
    if (isPity) {
        currentSsrRate = 1; // Guaranteed at hard pity
    }

    const rand = Math.random();
    if (rand < currentSsrRate) {
        state.pityCount = 0; // Reset pity counter
        return { rarity: 'SSR', isPu: true, guaranteed: isPity };
    } else if (rand < currentSsrRate + config.srRate) {
        return { rarity: 'SR' };
    }

    return { rarity: 'R' };
}

export const dynamic_rate = {
    id: 'dynamic_rate',
    name: '確率変動ガチャ',
    ssrRate: 0.01,
    srRate: 0.10,
    pity: 100,
    pityType: 'direct',
    pityDesc: '10回ごとにSSR確率が上昇し、100回で確定。',
    rateSteps: [
        { after: 10, ssrRate: 0.02 },
        { after: 20, ssrRate: 0.03 },
        { after: 30, ssrRate: 0.05 },
        { after: 40, ssrRate: 0.10 },
        { after: 50, ssrRate: 0.20 },
        { after: 90, ssrRate: 0.50 }
    ],
    draw: draw,
};
