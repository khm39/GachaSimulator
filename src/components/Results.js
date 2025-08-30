import { h } from '../vdom.js';
import { Col, Card, CardBody } from './uiPrimitives.js';

const ResultsHeader = () => h('div', {
    class: 'card-header',
    'data-bs-toggle': 'collapse',
    'data-bs-target': '#results-collapse',
    'aria-expanded': 'true',
    'aria-controls': 'results-collapse'
}, ['結果']);


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

const ResultBatch = ({ resultBatch, batchIndex, totalBatches }) => {
    const isSinglePull = resultBatch.length === 1;
    const pullType = isSinglePull ? '単発' : `${resultBatch.length}連`;
    const pullNumber = totalBatches - batchIndex;
    const isLatest = batchIndex === 0;
    const title = `${pullType}ガチャ (${pullNumber}回目)${isLatest ? ' (最新)' : ''}`;

    return h('div', { class: 'result-batch mb-4' }, [
        h('h4', { class: 'fs-6 fw-bold text-muted border-bottom pb-2 mb-3' }, [title]),
        h('div', {
            class: 'row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3'
        },
            resultBatch.map(renderResultCard)
        )
    ]);
};


/**
 * Renders the results display panel.
 * @param {object} state The application state.
 * @returns {object} A VDOM node.
 */
export function Results({ state }) {
    return Col({ size: 8 }, [
        Card({}, [
            ResultsHeader(),
            h('div', { id: 'results-collapse', class: 'collapse show' }, [
                CardBody({},
                    [...state.results].reverse().map((batch, index) =>
                        ResultBatch({
                            resultBatch: batch,
                            batchIndex: index,
                            totalBatches: state.results.length
                        })
                    )
                )
            ])
        ])
    ]);
}
