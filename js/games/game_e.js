import { unifiedDraw } from './common.js';

export const game_e = {
    id: 'game_e',
    name: 'タワーディフェンス',
    ssrRate: 0.02,
    srRate: 0.08,
    pity: 0, // No hard pity for SSR draws
    pityDesc: '300回で交換可能。51回目から最高レアの確率が2%ずつ上昇。',
    // --- unifiedDraw config ---
    hasExchangePoints: true,
    puRate: 0.5,
    softPity: {
        start: 51,
        factor: 0.02,
        type: 'additive',
    },
    draw: unifiedDraw,
};
