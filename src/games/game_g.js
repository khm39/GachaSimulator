import { unifiedDraw } from './common.js';

export const game_g = {
    id: 'game_g',
    name: 'ゲーム会社H',
    ssrRate: 0.006,
    srRate: 0.051,
    pity: 90,
    pityDesc: '90回で最高レアが確定。74回から確率上昇。すり抜けたら次回最高レアはPU確定。',
    has10PullGuarantee: true,
    // --- unifiedDraw config ---
    fiftyFifty: true,
    rateSteps: [
        { after: 74, ssrRate: 0.066 },
        { after: 75, ssrRate: 0.126 },
        { after: 76, ssrRate: 0.186 },
        { after: 77, ssrRate: 0.246 },
        { after: 78, ssrRate: 0.306 },
        { after: 79, ssrRate: 0.366 },
        { after: 80, ssrRate: 0.426 },
        { after: 81, ssrRate: 0.486 },
        { after: 82, ssrRate: 0.546 },
        { after: 83, ssrRate: 0.606 },
        { after: 84, ssrRate: 0.666 },
        { after: 85, ssrRate: 0.726 },
        { after: 86, ssrRate: 0.786 },
        { after: 87, ssrRate: 0.846 },
        { after: 88, ssrRate: 0.906 },
        { after: 89, ssrRate: 0.966 }
    ],
    draw: unifiedDraw,
};
