import { h } from '../vdom.js';
import { Card, CardHeader } from './uiPrimitives.js';
import { calculateCurrentSsrRate } from '../games/common.js';

// Helper function, co-located for now
const formatPercent = (n) => `${(n * 100).toFixed(2)}%`;

/**
 * Renders the status panel with gacha stats and info.
 * @param {object} state The application state.
 * @returns {object} A VDOM node.
 */
export function Status({ state }) {
    const { config, totalDraws, pityCount, exchangePoints, isGuaranteedPu, game, results } = state;

    // --- Basic Info ---
    const infoItems = [];
    infoItems.push(h('li', { key: 'ssr-rate', class: 'list-group-item' }, [`基礎SSR確率: ${formatPercent(config.ssrRate)}`]));
    if (config.puSsrRate) {
        infoItems.push(h('li', { key: 'pu-ssr-rate', class: 'list-group-item' }, [`PU SSR確率: ${formatPercent(config.puSsrRate)}`]));
    }
    infoItems.push(h('li', { key: 'sr-rate', class: 'list-group-item' }, [`SR確率: ${formatPercent(config.srRate)}`]));
    if (config.has10PullGuarantee) {
        infoItems.push(h('li', { key: 'ten-pull', class: 'list-group-item' }, ['10連保証: SR以上1枚確定']));
    }
    if (config.pityDesc) {
        infoItems.push(h('li', { key: 'pity-desc', class: 'list-group-item' }, [`天井: ${config.pityDesc}`]));
    }

    // --- Live Status ---
    const liveItems = [];
    liveItems.push(h('li', { key: 'total-draws', class: 'list-group-item' }, [`合計回数: ${totalDraws}`]));

    if (config.pityType === 'direct' && config.pity > 0) {
        let text = `天井カウント: ${pityCount} / ${config.pity}`;
        if (game === 'game_e') text = `前回SSRからの回数: ${pityCount}`;
        liveItems.push(h('li', { key: 'pity-counter', class: 'list-group-item' }, [text]));

        // Display current SSR Rate if it can change
        if (config.rateSteps || config.softPity) {
            const currentRate = calculateCurrentSsrRate(state, config);
            liveItems.push(h('li', { key: 'current-rate', class: 'list-group-item' }, [`現在SSR確率: ${formatPercent(currentRate)}`]));
        }
    }
    if (config.pityType === 'exchange' && config.pity > 0) {
        const pointName = config.pointName || '交換Pt';
        liveItems.push(h('li', { key: 'exchange-points', class: 'list-group-item' }, [`${pointName}: ${exchangePoints} / ${config.pity}`]));
    }
    if (game === 'game_b') {
        liveItems.push(h('li', { key: 'genshin-guarantee', class: 'list-group-item' }, [`次回PU確定: ${isGuaranteedPu ? 'はい' : 'いいえ'}`]));
    }


    // --- Cumulative Stats ---
    const statItems = [];
    if (totalDraws > 0) {
        const ssrCount = results.filter(r => r.rarity === 'SSR').length;
        const srCount = results.filter(r => r.rarity === 'SR').length;
        const puCount = results.filter(r => r.isPu).length;

        statItems.push(h('li', { key: 'ssr-stat', class: 'list-group-item' }, [`SSR: ${ssrCount}枚 (${formatPercent(ssrCount / totalDraws)})`]));
        if (puCount > 0) {
            statItems.push(h('li', { key: 'pu-stat', class: 'list-group-item ps-4' }, [`└ PU: ${puCount}枚 (${formatPercent(puCount / totalDraws)})`]));
        }
        statItems.push(h('li', { key: 'sr-stat', class: 'list-group-item' }, [`SR: ${srCount}枚 (${formatPercent(srCount / totalDraws)})`]));
    } else {
        statItems.push(h('li', { key: 'no-stats', class: 'list-group-item' }, ['まだ引いていません']));
    }

    return Card({ class: 'mt-3' }, [
        CardHeader({}, ['ステータス']),
        h('ul', { class: 'list-group list-group-flush' }, [
            h('li', { class: 'list-group-item list-group-item-secondary' }, [h('strong', {}, ['ガチャ仕様'])]),
            ...infoItems,
            h('li', { class: 'list-group-item list-group-item-secondary' }, [h('strong', {}, ['現在の状況'])]),
            ...liveItems,
            h('li', { class: 'list-group-item list-group-item-secondary' }, [h('strong', {}, ['累計結果'])]),
            ...statItems
        ]),
    ]);
}
