/**
 * Hyperscript function to create a virtual DOM node.
 * @param {string} tag The element's tag name.
 * @param {object} props The element's properties (attributes, event listeners).
 * @param {Array<object|string>} children The element's child nodes.
 * @returns {object} A virtual DOM node.
 */
export function h(tag, props, children) {
    return { tag, props, children };
}

/**
 * Create a real DOM element from a virtual DOM node.
 * @param {object} vnode The virtual DOM node.
 * @returns {HTMLElement|Text} The created DOM element.
 */
export function createElement(vnode) {
    if (typeof vnode === 'string') {
        return document.createTextNode(vnode);
    }

    const el = document.createElement(vnode.tag);

    // Set properties/attributes
    for (const key in vnode.props) {
        el.setAttribute(key, vnode.props[key]);
    }

    // Create and append children
    for (const child of vnode.children) {
        el.appendChild(createElement(child));
    }

    return el;
}

/**
 * Compare two virtual DOM nodes and update the real DOM.
 * @param {HTMLElement} parent The parent DOM element.
 * @param {object} newNode The new virtual DOM node.
 * @param {object} oldNode The old virtual DOM node.
 * @param {number} index The index of the node in its parent's children.
 */
export function updateElement(parent, newNode, oldNode, index = 0) {
    const childNode = parent.childNodes[index];

    // 1. If oldNode doesn't exist, create and append newNode
    if (!oldNode) {
        parent.appendChild(createElement(newNode));
        return;
    }

    // 2. If newNode doesn't exist, remove oldNode
    if (!newNode) {
        if (childNode) {
            parent.removeChild(childNode);
        }
        return;
    }

    // 3. If nodes have changed, replace the element
    if (changed(newNode, oldNode)) {
        if (childNode) {
            parent.replaceChild(createElement(newNode), childNode);
        } else {
             parent.appendChild(createElement(newNode));
        }
        return;
    }

    // 4. If nodes are the same, update props and diff children
    if (newNode.tag) {
        updateProps(childNode, newNode.props, oldNode.props);
        updateChildren(childNode, newNode.children, oldNode.children);
    }
}

/**
 * Helper function to check if two vnodes are different.
 * @param {object} node1 The first virtual node.
 * @param {object} node2 The second virtual node.
 * @returns {boolean} True if the nodes are different.
 */
function changed(node1, node2) {
    return typeof node1 !== typeof node2 ||
           (typeof node1 === 'string' && node1 !== node2) ||
           node1.tag !== node2.tag;
}

/**
 * Update the properties/attributes of a DOM element.
 * @param {HTMLElement} target The target DOM element.
 * @param {object} newProps The new properties.
 * @param {object} oldProps The old properties.
 */
function updateProps(target, newProps, oldProps = {}) {
    const allProps = { ...oldProps, ...newProps };
    for (const name in allProps) {
        const oldValue = oldProps[name];
        const newValue = newProps[name];

        if (newValue == null) {
            target.removeAttribute(name);
        } else if (oldValue !== newValue) {
            target.setAttribute(name, newValue);
        }
    }
}

/**
 * Recursively update the children of a DOM element.
 * @param {HTMLElement} parent The parent DOM element.
 * @param {Array<object|string>} newChildren The new children vnodes.
 * @param {Array<object|string>} oldChildren The old children vnodes.
 */
export function updateChildren(parent, newChildren, oldChildren) {
    const maxLength = Math.max(newChildren.length, oldChildren.length);
    for (let i = 0; i < maxLength; i++) {
        updateElement(parent, newChildren[i], oldChildren[i], i);
    }
}
