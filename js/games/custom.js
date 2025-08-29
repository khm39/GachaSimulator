import { unifiedDraw } from './common.js';

export const custom = {
    id: 'custom',
    name: 'カスタム設定',
    ssrRate: 0.03, // Default values
    srRate: 0.15,
    pity: 200, // Default for custom
    pityDesc: '上記で設定した確率と天井でシミュレーションします。',
    // --- unifiedDraw config ---
    // Custom game will be configured by the UI, so we just point to the function
    draw: unifiedDraw,
};
