/**
 * Hyperscript function to create a virtual DOM node.
 * @param {string} tag The element's tag name.
 * @param {object} props The element's properties (attributes, event listeners, key).
 * @param {Array<object|string>} children The element's child nodes.
 * @returns {object} A virtual DOM node.
 */
export function h(tag, props, children) {
    const key = props ? props.key : undefined;
    // The key should not be set as a DOM attribute
    if (props && props.key) {
        delete props.key;
    }
    return { tag, props, children, key };
}

/**
 * Create a real DOM element from a virtual DOM node.
 * @param {object} vnode The virtual DOM node.
 * @returns {HTMLElement|Text} The created DOM element.
 */
export function createElement(vnode) {
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return document.createTextNode(vnode.toString());
    }

    const el = document.createElement(vnode.tag);
    vnode.el = el; // Cache the real DOM element

    // Set properties/attributes and add event listeners
    updateProps(el, vnode.props);

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
 */
export function updateElement(parent, newNode, oldNode) {
    // 1. If nodes have changed, replace the element
    if (changed(newNode, oldNode)) {
        const newEl = createElement(newNode);
        parent.replaceChild(newEl, oldNode.el);
        return;
    }

    // Cache the element from the old node
    newNode.el = oldNode.el;

    // 2. If nodes are the same, update props and diff children
    if (newNode.tag) {
        updateProps(newNode.el, newNode.props, oldNode.props);
        // Note: We recursively call updateKeyedChildren, not a general purpose updateElement
        // because the children are always lists that should be keyed.
        updateKeyedChildren(newNode.el, newNode.children, oldNode.children);
    }
}


/**
 * Helper function to check if two vnodes are different.
 * @param {object} node1 The first virtual node.
 * @param {object} node2 The second virtual node.
 * @returns {boolean} True if the nodes are different.
 */
function changed(node1, node2) {
    // Different types (e.g., string vs. object)
    if (typeof node1 !== typeof node2) return true;
    // Different text content
    if ((typeof node1 === 'string' || typeof node1 === 'number') && node1 !== node2) return true;
    // Different tags
    if (node1.tag !== node2.tag) return true;
    // One has a key and the other doesn't, or keys are different
    if (node1.key !== node2.key) return true;

    return false;
}

/**
 * Update the properties/attributes of a DOM element.
 * @param {HTMLElement} target The target DOM element.
 * @param {object} newProps The new properties.
 * @param {object} oldProps The old properties.
 */
function updateProps(target, newProps = {}, oldProps = {}) {
    const props = { ...oldProps, ...newProps };

    Object.keys(props).forEach(name => {
        const oldValue = oldProps[name];
        const newValue = newProps[name];

        if (newValue == null) {
            // Property removed
            if (isEventProp(name)) {
                target.removeEventListener(extractEventName(name), oldValue);
            } else {
                target.removeAttribute(name);
            }
        } else if (oldValue !== newValue) {
            // Property changed or added
            if (isEventProp(name)) {
                if (oldValue) {
                    target.removeEventListener(extractEventName(name), oldValue);
                }
                target.addEventListener(extractEventName(name), newValue);
            } else {
                target.setAttribute(name, newValue);
            }
        }
    });
}

function isEventProp(name) {
    return name.startsWith('on');
}

function extractEventName(name) {
    return name.slice(2).toLowerCase();
}


/**
 * A more efficient, keyed algorithm for updating child nodes.
 * @param {HTMLElement} parentEl The parent DOM element.
 * @param {Array<object|string>} newChildren The new children vnodes.
 * @param {Array<object|string>} oldChildren The old children vnodes.
 */
function updateKeyedChildren(parentEl, newChildren, oldChildren) {
    let oldStartIdx = 0;
    let newStartIdx = 0;
    let oldEndIdx = oldChildren.length - 1;
    let newEndIdx = newChildren.length - 1;
    let oldStartVnode = oldChildren[0];
    let oldEndVnode = oldChildren[oldEndIdx];
    let newStartVnode = newChildren[0];
    let newEndVnode = newChildren[newEndIdx];
    let oldKeyToIdx;

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (oldStartVnode == null) {
            oldStartVnode = oldChildren[++oldStartIdx];
        } else if (oldEndVnode == null) {
            oldEndVnode = oldChildren[--oldEndIdx];
        } else if (newStartVnode.key === oldStartVnode.key) { // Match at the start
            updateElement(parentEl, newStartVnode, oldStartVnode);
            oldStartVnode = oldChildren[++oldStartIdx];
            newStartVnode = newChildren[++newStartIdx];
        } else if (newEndVnode.key === oldEndVnode.key) { // Match at the end
            updateElement(parentEl, newEndVnode, oldEndVnode);
            oldEndVnode = oldChildren[--oldEndIdx];
            newEndVnode = newChildren[--newEndIdx];
        } else if (newEndVnode.key === oldStartVnode.key) { // New end matches old start (move to end)
             updateElement(parentEl, newEndVnode, oldStartVnode);
             parentEl.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
             oldStartVnode = oldChildren[++oldStartIdx];
             newEndVnode = newChildren[--newEndIdx];
        } else if (newStartVnode.key === oldEndVnode.key) { // New start matches old end (move to start)
            updateElement(parentEl, newStartVnode, oldEndVnode);
            parentEl.insertBefore(oldEndVnode.el, oldStartVnode.el);
            oldEndVnode = oldChildren[--oldEndIdx];
            newStartVnode = newChildren[++newStartIdx];
        } else {
            // No simple match, use a map to find the old node
            if (!oldKeyToIdx) {
                oldKeyToIdx = createKeyToOldIdx(oldChildren, oldStartIdx, oldEndIdx);
            }
            const idxInOld = oldKeyToIdx[newStartVnode.key];
            if (idxInOld == null) { // New element
                parentEl.insertBefore(createElement(newStartVnode), oldStartVnode.el);
            } else { // Existing element, move it
                const vnodeToMove = oldChildren[idxInOld];
                updateElement(parentEl, newStartVnode, vnodeToMove);
                parentEl.insertBefore(vnodeToMove.el, oldStartVnode.el);
                oldChildren[idxInOld] = undefined; // Mark as moved
            }
            newStartVnode = newChildren[++newStartIdx];
        }
    }

    // Add any remaining new children
    if (newStartIdx <= newEndIdx) {
        const refEl = newChildren[newEndIdx + 1] ? newChildren[newEndIdx + 1].el : null;
        for (; newStartIdx <= newEndIdx; newStartIdx++) {
            parentEl.insertBefore(createElement(newChildren[newStartIdx]), refEl);
        }
    }

    // Remove any remaining old children
    if (oldStartIdx <= oldEndIdx) {
        for (; oldStartIdx <= oldEndIdx; oldStartIdx++) {
            if (oldChildren[oldStartIdx]) {
                parentEl.removeChild(oldChildren[oldStartIdx].el);
            }
        }
    }
}

function createKeyToOldIdx(children, beginIdx, endIdx) {
    const map = {};
    for (let i = beginIdx; i <= endIdx; ++i) {
        const key = children[i].key;
        if (key != null) {
            map[key] = i;
        }
    }
    return map;
}


// --- The legacy `updateChildren` is replaced by `updateKeyedChildren` ---
// --- We need to export a primary diffing function. Let's call it `updateElement` ---

/**
 * Main entry point for patching the DOM.
 * This function is designed to be called by the application's view layer.
 * @param {HTMLElement} parent The parent DOM element.
 * @param {Array<object|string>} newChildren The new children vnodes.
 * @param {Array<object|string>} oldChildren The old children vnodes.
 */
export function updateChildren(parent, newChildren, oldChildren) {
    if (!oldChildren || oldChildren.length === 0) {
        parent.innerHTML = '';
        for(const child of newChildren) {
            parent.appendChild(createElement(child));
        }
    } else if (!newChildren || newChildren.length === 0) {
        parent.innerHTML = '';
    }
    else {
        updateKeyedChildren(parent, newChildren, oldChildren);
    }
}
