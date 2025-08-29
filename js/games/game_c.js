import { unifiedDraw } from './common.js';

export const game_c = {
    id: 'game_c',
    name: '育成レース',
    ssrRate: 0.03,
    srRate: 0.18,
    pity: 0, // No hard pity
    pityDesc: '200回引くと「交換Pt」が200貯まり、PU対象と交換可能。',
    has10PullGuarantee: true,
    // --- unifiedDraw config ---
    hasExchangePoints: true,
    pityResetsOnRandom: false,
    puRate: 0.5,
    draw: unifiedDraw,
};
