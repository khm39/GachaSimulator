import { calculateCurrentSsrRate } from '../games/common.js';
import { InfoList } from '../components/InfoList.js';
import { CollapsibleCard } from '../components/CollapsibleCard.js';

const formatPercent = (n) => `${(n * 100).toFixed(2)}%`;

function getGachaInfoData(config) {
    const data = [];
    data.push(`基礎SSR確率: ${formatPercent(config.ssrRate)}`);
    data.push(`SR確率: ${formatPercent(config.srRate)}`);
    if (config.has10PullGuarantee) {
        data.push('10連保証: SR以上1枚確定');
    }
    if (config.pityDesc) {
        data.push(`天井: ${config.pityDesc}`);
    }
    return data;
}

function getLiveStatusData(state) {
    const { config, totalDraws, pityCount, exchangePoints, isGuaranteedPu, game } = state;
    const data = [];
    data.push(`合計回数: ${totalDraws}`);

    if (config.pityType === 'direct' && config.pity > 0) {
        let text = `天井カウント: ${pityCount} / ${config.pity}`;
        if (game === 'game_e') text = `前回SSRからの回数: ${pityCount}`;
        data.push(text);

        if (config.rateSteps || config.softPity) {
            const currentRate = calculateCurrentSsrRate(state, config);
            data.push(`現在SSR確率: ${formatPercent(currentRate)}`);
        }
    }
    if (config.pityType === 'exchange' && config.pity > 0) {
        data.push(`交換Pt: ${exchangePoints} / ${config.pity}`);
    }
    if (game === 'game_b') {
        data.push(`次回PU確定: ${isGuaranteedPu ? 'はい' : 'いいえ'}`);
    }
    return data;
}

function getCumulativeStatsData(results, totalDraws) {
    const data = [];
    if (totalDraws > 0) {
        const allResults = results.flat();
        const ssrCount = allResults.filter(r => r.rarity === 'SSR').length;
        const srCount = allResults.filter(r => r.rarity === 'SR').length;
        const puCount = allResults.filter(r => r.isPu).length;

        data.push(`SSR: ${ssrCount}枚 (${formatPercent(ssrCount / totalDraws)})`);
        if (puCount > 0) {
            data.push(`\u00A0\u00A0└ PU: ${puCount}枚 (${formatPercent(puCount / totalDraws)})`);
        }
        data.push(`SR: ${srCount}枚 (${formatPercent(srCount / totalDraws)})`);
    } else {
        data.push('まだ引いていません');
    }
    return data;
}

/**
 * Renders the status panel with gacha stats and info.
 * @param {object} state The application state.
 * @returns {object} A VDOM node.
 */
export function Status({ state }) {
    const gachaInfoData = getGachaInfoData(state.config);
    const liveStatusData = getLiveStatusData(state);
    const cumulativeStatsData = getCumulativeStatsData(state.results, state.totalDraws);

    return CollapsibleCard({ id: 'status', title: 'ステータス' }, [
        InfoList({ title: 'ガチャ仕様', items: gachaInfoData }),
        InfoList({ title: '現在の状況', items: liveStatusData }),
        InfoList({ title: '累計結果', items: cumulativeStatsData }),
    ]);
}
