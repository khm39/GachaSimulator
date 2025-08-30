import { h } from '../vdom.js';
import { Col } from '../components/uiPrimitives.js';
import { CollapsibleCard } from '../components/CollapsibleCard.js';

// --- Child Components ---

/**
 * Renders a small badge, typically overlaid on a card.
 * @param {object} props
 * @param {string} props.text - The text to display in the badge.
 * @param {string} props.position - CSS position classes (e.g., 'top-0 start-0').
 * @param {string} props.color - Bootstrap background color class (e.g., 'bg-warning').
 * @returns {object} A VDOM node.
 */
const Badge = ({ text, position, color }) => h('span', {
    class: `badge ${color} text-dark position-absolute ${position} m-1`
}, [text]);

/**
 * Renders a single gacha result card.
 * @param {object} props
 * @param {object} props.result - The result object from the simulation.
 * @returns {object} A VDOM node.
 */
const ResultCard = ({ result }) => {
    const { id, rarity, isPu, guaranteed } = result;
    const cardClasses = `card result-card text-center h-100 ${rarity.toLowerCase()}${isPu ? ' pickup' : ''}`;

    return h('div', { key: id, class: 'col result-card-wrapper' }, [
        h('div', { class: cardClasses }, [
            isPu && Badge({ text: 'PU', position: 'top-0 start-0', color: 'bg-warning' }),
            guaranteed && Badge({ text: '天井', position: 'top-0 end-0', color: 'bg-info' }),
            h('div', { class: 'card-body p-2 d-flex flex-column justify-content-center' }, [
                h('h5', { class: 'card-title mb-0' }, [rarity])
            ])
        ])
    ]);
};

/**
 * Renders a batch of gacha results.
 * @param {object} props
 * @param {Array} props.resultBatch - An array of result objects.
 * @param {number} props.index - The index of this batch in the main results array.
 * @param {number} props.totalPulls - The total number of batches.
 * @returns {object} A VDOM node.
 */
const ResultBatch = ({ resultBatch, index, totalPulls }) => {
    const isSinglePull = resultBatch.length === 1;
    const pullType = isSinglePull ? '単発' : `${resultBatch.length}連`;
    const pullNumber = totalPulls - index;
    const isLatest = index === 0;
    const title = `${pullType}ガチャ (${pullNumber}回目)${isLatest ? ' (最新)' : ''}`;

    return h('div', { class: 'result-batch mb-4' }, [
        h('h4', { class: 'fs-6 fw-bold text-muted border-bottom pb-2 mb-3' }, [title]),
        h('div', { class: 'row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3' },
            resultBatch.map(result => ResultCard({ result }))
        )
    ]);
};


// --- Main Exported Component ---

/**
 * Renders the results display panel.
 * @param {object} state The application state.
 * @returns {object} A VDOM node.
 */
export function Results({ state }) {
    const totalPulls = state.results.length;

    return Col({ size: 8 }, [
        CollapsibleCard({ id: 'results', title: '結果' },
            [...state.results]
                .reverse()
                .map((resultBatch, index) => ResultBatch({ resultBatch, index, totalPulls }))
        )
    ]);
}
