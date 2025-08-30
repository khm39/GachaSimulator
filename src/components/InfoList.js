import { h } from '../vdom.js';

/**
 * A reusable component to display a list of information items with a title.
 * @param {object} props
 * @param {string} props.title - The title to display for the list.
 * @param {Array<string>} props.items - An array of strings to display as list items.
 * @returns {object} A VDOM node representing the info list.
 */
export function InfoList({ title, items }) {
    if (!items || items.length === 0) {
        return null;
    }

    return h('div', { class: 'mb-3' }, [ // Use a margin for spacing between lists
        h('h4', { class: 'fs-6 fw-bold text-muted border-bottom pb-2 mb-3' }, [title]),
        h('ul', { class: 'list-group list-group-flush ps-2' }, // Add some padding
            items.map((item, index) =>
                h('li', { key: index, class: 'list-group-item' }, [item])
            )
        )
    ]);
}
