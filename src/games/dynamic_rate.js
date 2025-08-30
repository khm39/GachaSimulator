import { unifiedDraw } from './common.js';

export const dynamic_rate = {
    id: 'dynamic_rate',
    name: '確率変動ガチャ',
    ssrRate: 0.01,
    srRate: 0.10,
    pity: 100,
    pityType: 'direct', // Hint for UI
    pityDesc: '10回ごとにSSR確率が上昇し、100回で確定。',
    rateSteps: [
        { after: 10, ssrRate: 0.02 },
        { after: 20, ssrRate: 0.03 },
        { after: 30, ssrRate: 0.05 },
        { after: 40, ssrRate: 0.10 },
        { after: 50, ssrRate: 0.20 },
        { after: 90, ssrRate: 0.50 }
    ],
    // Use the new unified draw function
    draw: unifiedDraw,
};
