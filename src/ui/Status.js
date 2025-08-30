import { h } from '../vdom.js';
import { calculateCurrentSsrRate } from '../games/common.js';
import { InfoList } from '../components/InfoList.js';
import { CollapsibleCard } from '../components/CollapsibleCard.js';

// Helper function, co-located for now
const formatPercent = (n) => `${(n * 100).toFixed(2)}%`;

/**
 * Renders the status panel with gacha stats and info.
 * @param {object} state The application state.
 * @returns {object} A VDOM node.
 */
export function Status({ state }) {
    const { config, totalDraws, pityCount, exchangePoints, isGuaranteedPu, game, results } = state;

    // --- Prepare Data for InfoList components ---

    const gachaInfoData = [];
    gachaInfoData.push(`基礎SSR確率: ${formatPercent(config.ssrRate)}`);
    if (config.puSsrRate) {
        gachaInfoData.push(`PU SSR確率: ${formatPercent(config.puSsrRate)}`);
    }
    gachaInfoData.push(`SR確率: ${formatPercent(config.srRate)}`);
    if (config.has10PullGuarantee) {
        gachaInfoData.push('10連保証: SR以上1枚確定');
    }
    if (config.pityDesc) {
        gachaInfoData.push(`天井: ${config.pityDesc}`);
    }

    const liveStatusData = [];
    liveStatusData.push(`合計回数: ${totalDraws}`);

    if (config.pityType === 'direct' && config.pity > 0) {
        let text = `天井カウント: ${pityCount} / ${config.pity}`;
        if (game === 'game_e') text = `前回SSRからの回数: ${pityCount}`;
        liveStatusData.push(text);

        if (config.rateSteps || config.softPity) {
            const currentRate = calculateCurrentSsrRate(state, config);
            liveStatusData.push(`現在SSR確率: ${formatPercent(currentRate)}`);
        }
    }
    if (config.pityType === 'exchange' && config.pity > 0) {
        const pointName = config.pointName || '交換Pt';
        liveStatusData.push(`${pointName}: ${exchangePoints} / ${config.pity}`);
    }
    if (game === 'game_b') {
        liveStatusData.push(`次回PU確定: ${isGuaranteedPu ? 'はい' : 'いいえ'}`);
    }

    const cumulativeStatsData = [];
    if (totalDraws > 0) {
        const allResults = results.flat();
        const ssrCount = allResults.filter(r => r.rarity === 'SSR').length;
        const srCount = allResults.filter(r => r.rarity === 'SR').length;
        const puCount = allResults.filter(r => r.isPu).length;

        cumulativeStatsData.push(`SSR: ${ssrCount}枚 (${formatPercent(ssrCount / totalDraws)})`);
        if (puCount > 0) {
            // Using a non-breaking space and an arrow for a cleaner look
            cumulativeStatsData.push(`\u00A0\u00A0└ PU: ${puCount}枚 (${formatPercent(puCount / totalDraws)})`);
        }
        cumulativeStatsData.push(`SR: ${srCount}枚 (${formatPercent(srCount / totalDraws)})`);
    } else {
        cumulativeStatsData.push('まだ引いていません');
    }

    return CollapsibleCard({ id: 'status', title: 'ステータス' }, [
        InfoList({ title: 'ガチャ仕様', items: gachaInfoData }),
        InfoList({ title: '現在の状況', items: liveStatusData }),
        InfoList({ title: '累計結果', items: cumulativeStatsData }),
    ]);
}
