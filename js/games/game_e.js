function draw(state, config) {
    state.exchangePoints++;
    state.pityCount++;
    let currentSsrRate = config.ssrRate;

    // Soft pity: rate increases by 2% for each pull after the 50th.
    if (state.pityCount >= config.softPityStart) {
        currentSsrRate += 0.02 * (state.pityCount - config.softPityStart + 1);
    }

    const rand = Math.random();
    if (rand < currentSsrRate) {
        state.pityCount = 0; // Pity counter for rate-up resets on SSR
        const isPu = Math.random() < config.puRate;
        return { rarity: 'SSR', isPu };
    } else if (rand < currentSsrRate + config.srRate) {
        return { rarity: 'SR' };
    }

    return { rarity: 'R' };
}

export const game_e = {
    id: 'game_e',
    name: 'タワーディフェンス',
    ssrRate: 0.02,
    srRate: 0.08,
    pity: 300,
    pityType: 'exchange',
    softPityStart: 51,
    pointName: '交換Pt',
    puRate: 0.5,
    pityDesc: '300回で交換可能。51回目から最高レアの確率が2%ずつ上昇。',
    draw: draw,
};
