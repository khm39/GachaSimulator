import { unifiedDraw } from './common.js';

export const game_a = {
    id: 'game_a',
    name: '運命の物語',
    ssrRate: 0.01,
    srRate: 0.03,
    pity: 330,
    pityDesc: '330回以内にPU対象の最高レアが1つ確定。',
    has10PullGuarantee: true,
    // --- unifiedDraw config ---
    puSsrRate: 0.008,       // The absolute rate for a PU SSR
    puRateIsAbsolute: true, // Use the absolute rate logic for PU
    draw: unifiedDraw,
};
