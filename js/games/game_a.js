function draw(state, config) {
    state.pityCount++;

    // Pity system: Guaranteed SSR at `config.pity` draws.
    if (state.pityCount >= config.pity) {
        state.pityCount = 0; // Pity resets
        return { rarity: 'SSR', isPu: true, guaranteed: true };
    }

    const rand = Math.random();
    if (rand < config.ssrRate) {
        state.pityCount = 0; // Pity resets on any SSR
        const isPu = rand < (config.puSsrRate || 0.008); // Specific PU rate check
        return { rarity: 'SSR', isPu, guaranteed: false };
    } else if (rand < config.ssrRate + config.srRate) {
        return { rarity: 'SR' };
    }

    return { rarity: 'R' };
}

export const game_a = {
    id: 'game_a',
    name: '運命の物語',
    ssrRate: 0.01,
    srRate: 0.03,
    pity: 330,
    pityType: 'direct',
    pityDesc: '330回以内にPU対象の最高レアが1つ確定。',
    has10PullGuarantee: true,
    puSsrRate: 0.008,
    draw: draw,
};
