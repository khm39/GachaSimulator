import { unifiedDraw } from './common.js';

export const game_b = {
    id: 'game_b',
    ssrRate: 0.006,
    srRate: 0.051,
    pity: 90,
    pityDesc: '90回で最高レアが確定。74回から確率上昇。すり抜けたら次回最高レアはPU確定。',
    has10PullGuarantee: true,
    // --- unifiedDraw config ---
    fiftyFifty: true,
    softPity: {
        start: 74,
        type: 'linear', // Use the linear interpolation formula
    },
    draw: unifiedDraw,
};
