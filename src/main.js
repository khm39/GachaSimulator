import { renderApp } from './ui.js';
import { updateElement, createElement } from './vdom.js';
import * as gameService from './gameService.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- App Root ---
    const appRoot = document.getElementById('app');

    // --- State ---
    let state = {};
    let vApp = null; // To hold the VDOM tree

    // --- Actions (logic to update state) ---
    const actions = {
        selectGame: (e) => {
            initializeSimulation(e.target.value);
        },
        draw1: () => {
            handleDraw(1);
        },
        draw10: () => {
            handleDraw(10);
        },
        reset: () => {
            initializeSimulation(state.game);
        },
        updateCustomSetting: (e) => {
            const { name, value, type } = e.target;
            const parsedValue = type === 'number' ? parseFloat(value) : value;
            state[name] = parsedValue;

            // If we are currently on the custom game, re-initialize to apply the new config
            if (state.game === 'custom') {
                initializeSimulation('custom');
            } else {
                render(); // Just re-render to show the new value in the (hidden) input
            }
        }
    };

    // --- Functions ---

    function render() {
        const allGames = gameService.getAllGames();
        const newVApp = renderApp(state, actions, allGames);

        if (vApp == null) {
            // Initial render: create the full DOM tree and append it
            appRoot.appendChild(createElement(newVApp));
        } else {
            // Subsequent renders: patch the existing tree by comparing the new and old VDOM
            updateElement(appRoot, newVApp, vApp);
        }
        vApp = newVApp;
    }

    function initializeSimulation(gameId) {
        let baseConfig = gameService.getGame(gameId);
        if (!baseConfig) return;

        // Grab current custom settings before creating a fresh state
        const customSettings = {
            customSsrRate: state.customSsrRate || 3,
            customSrRate: state.customSrRate || 15,
            customPityType: state.customPityType || 'exchange',
            customPityCount: state.customPityCount || 200,
        };

        // Create a fresh state for a new simulation
        state = {
            game: gameId,
            config: { ...baseConfig },
            totalDraws: 0,
            pityCount: 0,
            exchangePoints: 0,
            isGuaranteedPu: false,
            results: [],
            nextResultId: 0,
            // Carry over the custom settings themselves
            ...customSettings,
        };

        // If the selected game is custom, apply the custom settings to the active config
        if (gameId === 'custom') {
            state.config.ssrRate = state.customSsrRate / 100;
            state.config.srRate = state.customSrRate / 100;
            state.config.pityType = state.customPityType;
            state.config.pity = state.customPityCount;
        }

        render();
    }

    function drawOnce() {
        state.totalDraws++;
        const game = state.config;
        if (game && typeof game.draw === 'function') {
            return game.draw(state, game);
        }
        return { rarity: 'ERROR', id: state.nextResultId++ };
    }

    function handleDraw(count) {
        if (!state.config) return;

        const drawCount = count;
        let currentResults = [];
        for (let i = 0; i < drawCount; i++) {
            const result = drawOnce();
            result.id = state.nextResultId++;
            currentResults.push(result);
        }

        if (count >= 10 && state.config.has10PullGuarantee) {
            const hasSrOrHigher = currentResults.some(res => res.rarity === 'SR' || res.rarity === 'SSR');
            if (!hasSrOrHigher) {
                const lastRIndex = currentResults.map(r => r.rarity).lastIndexOf('R');
                if (lastRIndex !== -1) {
                    currentResults[lastRIndex].rarity = 'SR';
                }
            }
        }

        state.results.push(currentResults);
        render(); // Re-render the app with the new state
    }

    // --- Initial Load ---
    // Default to the 'custom' game screen on startup as requested.
    initializeSimulation('custom');
});
