import { h, updateChildren } from './vdom.js';

// --- DOM Elements (Roots for VDOM) ---
const statusListRoot = document.querySelector('#status-display .list-group-flush');
const resultsRoot = document.getElementById('results-display');

// --- VDOM State ---
let vApp = {
    status: [], // Holds an array of vdom <li> nodes
    results: [], // Holds an array of vdom result card nodes
};

// --- View Functions (VDOM) ---

function renderStatus(state) {
    const { config, totalDraws, pityCount, exchangePoints, isGuaranteedPu, game } = state;
    const items = [];

    items.push(h('li', { class: 'list-group-item', id: 'total-draws' }, [
        h('strong', {}, ['合計回数: ']),
        `${totalDraws}`
    ]));

    if (config.pityType === 'direct' && config.pity > 0) {
        let text = `天井カウント: ${pityCount} / ${config.pity}`;
        let id = 'pity-counter';
        if (game === 'game_e') {
             text = `前回最高レアからの回数: ${pityCount}`;
        }
        items.push(h('li', { class: 'list-group-item', id }, [
            h('strong', {}, [text.split(':')[0] + ': ']),
            text.split(':')[1] || ''
        ]));
    }

    if (config.pityType === 'exchange' && config.pity > 0) {
        const pointName = config.pointName || '交換Pt';
        items.push(h('li', { class: 'list-group-item', id: 'exchange-points' }, [
            h('strong', {}, [`${pointName}: `]),
            `${exchangePoints} / ${config.pity}`
        ]));
    }

    if (game === 'game_b') {
        items.push(h('li', { class: 'list-group-item', id: 'genshin-guarantee' }, [
            h('strong', {}, ['次回PU確定: ']),
            `${isGuaranteedPu ? 'はい' : 'いいえ'}`
        ]));
    }

    return items;
}

function renderResultCard(result) {
    const { rarity, isPu, guaranteed } = result;
    const cardClasses = `card result-card text-center h-100 ${rarity.toLowerCase()}${isPu ? ' pickup' : ''}`;
    const badges = [];

    if (isPu) {
        badges.push(h('span', { class: 'badge bg-warning text-dark position-absolute top-0 start-0 m-1' }, ['PU']));
    }
    if (guaranteed) {
        badges.push(h('span', { class: 'badge bg-info text-dark position-absolute top-0 end-0 m-1' }, ['天井']));
    }

    return h('div', { class: 'col result-card-wrapper' }, [
        h('div', { class: cardClasses }, [
            ...badges,
            h('div', { class: 'card-body p-2 d-flex flex-column justify-content-center' }, [
                h('h5', { class: 'card-title mb-0' }, [rarity])
            ])
        ])
    ]);
}

function renderResults(state) {
    // Render in reverse order to show newest first
    return [...state.results].reverse().map(renderResultCard);
}

/**
 * Main update function to re-render the view based on the state.
 * @param {object} state The current application state.
 */
export function updateView(state) {
    if (!state || !state.config) return;

    const newStatusVNodes = renderStatus(state);
    const newResultsVNodes = renderResults(state);

    updateChildren(statusListRoot, newStatusVNodes, vApp.status);
    updateChildren(resultsRoot, newResultsVNodes, vApp.results);

    vApp.status = newStatusVNodes;
    vApp.results = newResultsVNodes;
}

/**
 * Resets the view to its initial state.
 */
export function resetView() {
    // Clear static placeholder content to prevent conflicts with VDOM
    statusListRoot.innerHTML = '';
    resultsRoot.innerHTML = '';
    vApp = {
        status: [],
        results: [],
    };
}
