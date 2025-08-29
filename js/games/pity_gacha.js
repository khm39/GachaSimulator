import { unifiedDraw } from './common.js';

export const pity_gacha = {
    id: 'pity_gacha',
    name: '天井機能付きガチャ',
    ssrRate: 0.006, // 0.6%
    srRate: 0.051,  // 5.1%
    pity: 90, // Hard pity
    pityType: 'soft', // A hint for the UI, not used by unifiedDraw
    fiftyFifty: true, // Enable the 50/50 guarantee system
    softPity: {       // Enable and configure programmatic soft pity
        start: 74,
        factor: 0.06,
    },
    pityDesc: '74回目からSSR確率が上昇し、90回でSSRが確定。SSR当選時には50%でピックアップされ、されなかった場合は次回SSRがピックアップ確定になります。',
    draw: unifiedDraw,
    has10PullGuarantee: true,
};
