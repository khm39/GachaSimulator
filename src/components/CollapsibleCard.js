import { h } from '../vdom.js';
import { Card, CardBody } from './uiPrimitives.js';

/**
 * A reusable card component with a collapsible body.
 * Uses Bootstrap's collapse functionality.
 * @param {object} props
 * @param {string} props.id - A unique ID for the collapsible element.
 * @param {string} props.title - The title to display in the card header.
 * @param {Array} children - The content to display inside the collapsible body.
 * @returns {object} A VDOM node.
 */
export function CollapsibleCard({ id, title }, children) {
    const collapseId = `${id}-collapse`;

    return Card({ class: 'mb-3' }, [ // Add margin bottom for spacing
        // Collapsible Header
        h('div', {
            class: 'card-header',
            'data-bs-toggle': 'collapse',
            'data-bs-target': `#${collapseId}`,
            'aria-expanded': 'true',
            'aria-controls': collapseId,
            style: 'cursor: pointer;' // Add pointer cursor to indicate it's clickable
        }, [title]),

        // Collapsible Body
        h('div', { id: collapseId, class: 'collapse show' }, [
            CardBody({}, children)
        ])
    ]);
}
