import { h } from './vdom.js';

// --- Reusable Components ---

const Col = (props, children) => h('div', { class: `col-lg-${props.size} mb-4` }, children);
const Card = (props, children) => h('div', { class: 'card' }, children);
const CardHeader = (props, children) => h('div', { class: 'card-header' }, children);
const CardBody = (props, children) => h('div', { class: 'card-body' }, children);
const Select = (props) => h('select', {
    class: 'form-select',
    id: props.id,
    onchange: props.onchange,
}, props.options.map(opt => h('option', { value: opt.value, selected: opt.selected }, [opt.text])));
const Button = (props) => h('button', { class: `btn btn-${props.color}`, onclick: props.onclick }, [props.text]);

// --- Main UI Components ---

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
                    Select({ id: 'game-select', options: gameOptions, onchange: actions.selectGame }),
                ]),
                // Custom settings go here if needed
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
    return Col({ size: 8 }, [
        h('h2', {}, ['結果']),
        h('div', { id: 'results-display', class: 'row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3 p-2 rounded' },
            [...state.results].reverse().map(renderResultCard)
        ),
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
