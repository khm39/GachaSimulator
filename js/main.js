import { updateView, resetView } from './ui.js';
import * as gameService from './gameService.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let state = {};

    // --- DOM Elements (Controls) ---
    const gameSelect = document.getElementById('game-select');
    const draw1Btn = document.getElementById('draw-1-btn');
    const draw10Btn = document.getElementById('draw-10-btn');
    const resetBtn = document.getElementById('reset-btn');
    const descriptionText = document.getElementById('description');

    // Custom settings elements
    const customSettingsEl = document.getElementById('custom-settings');
    const customSsrRateEl = document.getElementById('custom-ssr-rate');
    const customSrRateEl = document.getElementById('custom-sr-rate');
    const customPityTypeEl = document.getElementById('custom-pity-type');
    const customPityCountEl = document.getElementById('custom-pity-count');

    // --- Functions ---
    function populateGameSelect() {
        const allGames = gameService.getAllGames();
        allGames.forEach(game => {
            const option = document.createElement('option');
            option.value = game.id;
            option.textContent = game.name;
            gameSelect.appendChild(option);
        });
    }

    function initializeSimulation(gameId) {
        let baseConfig = gameService.getGame(gameId);
        if (!baseConfig) {
            console.error(`Configuration not found for gameId: ${gameId}`);
            return;
        }

        let finalConfig = { ...baseConfig };

        if (gameId === 'custom') {
            customSettingsEl.classList.remove('hidden');
            finalConfig = {
                ...finalConfig,
                ssrRate: parseFloat(customSsrRateEl.value) / 100,
                srRate: parseFloat(customSrRateEl.value) / 100,
                pityType: customPityTypeEl.value,
                pity: parseInt(customPityCountEl.value, 10),
            };
        } else {
            customSettingsEl.classList.add('hidden');
        }

        state = {
            game: gameId,
            config: finalConfig,
            totalDraws: 0,
            pityCount: 0,
            exchangePoints: 0,
            isGuaranteedPu: false,
            results: [],
        };

        descriptionText.textContent = finalConfig.pityDesc;
        resetView();
        updateView(state);
    }

    function drawOnce() {
        state.totalDraws++;
        // The actual draw logic will be handled by the game module.
        const game = state.config; // The config now holds the full game module
        if (game && typeof game.draw === 'function') {
            return game.draw(state, game);
        }
        console.error("No draw function found for the current game.");
        return { rarity: 'ERROR' };
    }

    function handleDraw(count) {
        if (!state.config) return;

        let currentResults = [];
        for (let i = 0; i < count; i++) {
            const result = drawOnce();
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
        updateView(state);
    }

    // --- Event Listeners ---
    gameSelect.addEventListener('change', (e) => {
        initializeSimulation(e.target.value);
    });

    draw1Btn.addEventListener('click', () => {
        handleDraw(1);
    });

    draw10Btn.addEventListener('click', () => {
        handleDraw(10);
    });

    resetBtn.addEventListener('click', () => {
        initializeSimulation(gameSelect.value);
    });

    // Listen for changes on custom inputs and re-initialize
    [customSsrRateEl, customSrRateEl, customPityTypeEl, customPityCountEl].forEach(el => {
        el.addEventListener('change', () => {
            if (gameSelect.value === 'custom') {
                initializeSimulation('custom');
            }
        });
    });

    // --- Initial Load ---
    populateGameSelect();
    if (gameSelect.value) {
        initializeSimulation(gameSelect.value);
    }
});
