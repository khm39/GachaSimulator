import { unifiedDraw } from './common.js';

export const custom = {
    id: 'custom',
    ssrRate: 0.03, // Default values
    srRate: 0.15,
    pity: 200, // Default for custom
    pityDesc: 'カスタム設定でシミュレーションします。',
    // --- unifiedDraw config ---
    // Custom game will be configured by the UI, so we just point to the function
    draw: unifiedDraw,
};
