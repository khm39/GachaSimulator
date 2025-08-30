import { unifiedDraw } from './common.js';

export const game_f = {
    id: 'game_f',
    ssrRate: 0.03,
    srRate: 0.15,
    pity: 0, // No hard pity
    pityDesc: '300回引くと「交換Pt」が300貯まり、PU対象などと交換可能。',
    has10PullGuarantee: true,
    // --- unifiedDraw config ---
    hasExchangePoints: true,
    pityResetsOnRandom: false,
    puRate: 0.5,
    draw: unifiedDraw,
};
