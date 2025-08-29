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

        state = {
            game: gameId,
            config: { ...baseConfig },
            totalDraws: 0,
            pityCount: 0,
            exchangePoints: 0,
            isGuaranteedPu: false,
            results: [],
            nextResultId: 0,
        };
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

        let currentResults = [];
        for (let i = 0; i < count; i++) {
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

        state.results.push(...currentResults);
        render(); // Re-render the app with the new state
    }

    // --- Initial Load ---
    const initialGameId = gameService.getAllGames()[0]?.id;
    if (initialGameId) {
        initializeSimulation(initialGameId);
    } else {
        appRoot.textContent = 'No games configured.';
    }
});
