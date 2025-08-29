import { h } from './vdom.js';

// --- Reusable Components ---

// NOTE: These components are updated to correctly merge passed-in props.
const Col = (props, children) => h('div', { ...props, class: `col-lg-${props.size} mb-4 ${props.class || ''}`.trim() }, children);
const Card = (props, children) => h('div', { ...props, class: `card ${props.class || ''}`.trim() }, children);
const CardHeader = (props, children) => h('div', { ...props, class: `card-header ${props.class || ''}`.trim() }, children);
const CardBody = (props, children) => h('div', { ...props, class: `card-body ${props.class || ''}`.trim() }, children);
const Select = (props) => h('select', {
    class: 'form-select',
    id: props.id,
    name: props.name,
    onchange: props.onchange,
}, props.options.map(opt => h('option', { value: opt.value, selected: opt.selected }, [opt.text])));
const Button = (props) => h('button', { class: `btn btn-${props.color}`, onclick: props.onclick }, [props.text]);
const Input = (props) => h('input', {
    type: props.type,
    class: 'form-control',
    id: props.id,
    name: props.name,
    value: props.value,
    step: props.step,
    onchange: props.onchange,
});
const InputGroup = (props, children) => h('div', { class: 'mb-2' }, [
    h('label', { for: props.id, class: 'form-label' }, [props.label]),
    ...children
]);


// --- Main UI Components ---

function renderCustomSettings(state, actions) {
    if (state.game !== 'custom') {
        return null; // Don't render anything if not in custom mode
    }

    const pityOptions = [
        { value: 'exchange', text: '交換ポイント', selected: state.customPityType === 'exchange' },
        { value: 'direct', text: '直接保証', selected: state.customPityType === 'direct' },
        { value: 'none', text: 'なし', selected: state.customPityType === 'none' },
    ];

    return h('div', { id: 'custom-settings', class: 'mb-3' }, [
        h('hr', {}, []),
        h('h6', { class: 'mb-3' }, ['カスタム設定']),
        InputGroup({ id: 'custom-ssr-rate', label: 'SSR確率 (%):' }, [
            Input({ type: 'number', id: 'custom-ssr-rate', name: 'customSsrRate', value: state.customSsrRate, step: 0.1, onchange: actions.updateCustomSetting })
        ]),
        InputGroup({ id: 'custom-sr-rate', label: 'SR確率 (%):' }, [
            Input({ type: 'number', id: 'custom-sr-rate', name: 'customSrRate', value: state.customSrRate, step: 0.1, onchange: actions.updateCustomSetting })
        ]),
        InputGroup({ id: 'custom-pity-type', label: '天井システム:' }, [
            Select({ id: 'custom-pity-type', name: 'customPityType', options: pityOptions, onchange: actions.updateCustomSetting })
        ]),
        InputGroup({ id: 'custom-pity-count', label: '天井までの回数:' }, [
            Input({ type: 'number', id: 'custom-pity-count', name: 'customPityCount', value: state.customPityCount, step: 1, onchange: actions.updateCustomSetting })
        ]),
    ]);
}


function renderControls(state, actions, allGames) {
    const { game, config } = state;

    const gameOptions = allGames.map(g => ({
        value: g.id,
        text: g.name,
        selected: g.id === game,
    }));

    return Col({ size: 4 }, [
        Card({}, [
            CardHeader({}, ['シミュレーション設定']),
            CardBody({}, [
                h('div', { class: 'mb-3' }, [
                    h('label', { for: 'game-select', class: 'form-label' }, ['ゲームを選択:']),
                    Select({ id: 'game-select', name: 'game', options: gameOptions, onchange: actions.selectGame }),
                ]),
                renderCustomSettings(state, actions),
                h('div', { class: 'd-grid gap-2 mb-3' }, [
                    Button({ color: 'primary', text: '1回引く', onclick: actions.draw1 }),
                    Button({ color: 'success', text: '10回引く', onclick: actions.draw10 }),
                    Button({ color: 'danger', text: 'リセット', onclick: actions.reset }),
                ]),
                h('div', { id: 'description', class: 'form-text' }, [config.pityDesc]),
            ]),
        ]),
        renderStatus(state),
    ]);
}

function renderStatus(state) {
    const { config, totalDraws, pityCount, exchangePoints, isGuaranteedPu, game } = state;
    const items = [];

    items.push(h('li', { key: 'total-draws', class: 'list-group-item' }, [`合計回数: ${totalDraws}`]));

    if (config.pityType === 'direct' && config.pity > 0) {
        let text = `天井カウント: ${pityCount} / ${config.pity}`;
        if (game === 'game_e') text = `前回最高レアからの回数: ${pityCount}`;
        items.push(h('li', { key: 'pity-counter', class: 'list-group-item' }, [text]));
    }

    if (config.pityType === 'exchange' && config.pity > 0) {
        const pointName = config.pointName || '交換Pt';
        items.push(h('li', { key: 'exchange-points', class: 'list-group-item' }, [`${pointName}: ${exchangePoints} / ${config.pity}`]));
    }

    if (game === 'game_b') {
        items.push(h('li', { key: 'genshin-guarantee', class: 'list-group-item' }, [`次回PU確定: ${isGuaranteedPu ? 'はい' : 'いいえ'}`]));
    }

    return Card({ class: 'mt-3' }, [
        CardHeader({}, ['ステータス']),
        h('ul', { class: 'list-group list-group-flush' }, items),
    ]);
}

function renderResultCard(result) {
    const { id, rarity, isPu, guaranteed } = result;
    const cardClasses = `card result-card text-center h-100 ${rarity.toLowerCase()}${isPu ? ' pickup' : ''}`;
    const badges = [];

    if (isPu) badges.push(h('span', { class: 'badge bg-warning text-dark position-absolute top-0 start-0 m-1' }, ['PU']));
    if (guaranteed) badges.push(h('span', { class: 'badge bg-info text-dark position-absolute top-0 end-0 m-1' }, ['天井']));

    return h('div', { key: id, class: 'col result-card-wrapper' }, [
        h('div', { class: cardClasses }, [
            ...badges,
            h('div', { class: 'card-body p-2 d-flex flex-column justify-content-center' }, [
                h('h5', { class: 'card-title mb-0' }, [rarity])
            ])
        ])
    ]);
}

function renderResults(state) {
    // The results container is now a Card to match the Status panel
    return Col({ size: 8 }, [
        Card({}, [
            CardHeader({}, ['結果']),
            CardBody({}, [
                h('div', {
                    id: 'results-display',
                    // The row/col classes are for the grid of result items, padding is handled by card-body
                    class: 'row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3'
                },
                    [...state.results].reverse().map(renderResultCard)
                )
            ])
        ])
    ]);
}

/**
 * Renders the entire application UI as a VDOM tree.
 * @param {object} state The current application state.
 * @param {object} actions An object containing all the action functions.
 * @param {Array} allGames An array of all available game configurations.
 * @returns {object} A virtual DOM node representing the entire app.
 */
export function renderApp(state, actions, allGames) {
    if (!state || !state.config) {
        // Render a loading state or an empty div if state is not ready
        return h('div', {}, []);
    }

    return h('div', { class: 'container py-4' }, [
        h('header', { class: 'pb-3 mb-4 border-bottom' }, [
            h('h1', { class: 'fs-4' }, ['ガチャシミュレーター'])
        ]),
        h('main', {}, [
            h('div', { class: 'row' }, [
                renderControls(state, actions, allGames),
                renderResults(state),
            ])
        ]),
    ]);
}
