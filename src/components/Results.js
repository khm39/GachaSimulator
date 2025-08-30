import { h } from '../vdom.js';
import { Col, Card, CardHeader, CardBody } from './uiPrimitives.js';

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

/**
 * Renders the results display panel.
 * @param {object} state The application state.
 * @returns {object} A VDOM node.
 */
export function Results({ state }) {
    // The results container is now a Card to match the Status panel
    return Col({ size: 8 }, [
        Card({}, [
            h('div', {
                class: 'card-header',
                'data-bs-toggle': 'collapse',
                'data-bs-target': '#results-collapse',
                'aria-expanded': 'true',
                'aria-controls': 'results-collapse'
            }, ['結果']),
            h('div', { id: 'results-collapse', class: 'collapse show' }, [
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
        ])
    ]);
}
