import { game_g } from './games/game_g.js';
import { custom } from './games/custom.js';

// A map for quick lookups by ID
const games = {
    [game_g.id]: game_g,
    [custom.id]: custom,
};

/**
 * Retrieves a single game configuration module by its ID.
 * @param {string} id The ID of the game to retrieve.
 * @returns {object|undefined} The game module, or undefined if not found.
 */
export function getGame(id) {
    return games[id];
}

/**
 * Retrieves all game configuration modules in a predefined order for display.
 * @returns {Array<object>} An array of all game modules.
 */
export function getAllGames() {
    // We return the array in a specific order to control the dropdown list
    return [
        game_g,
        custom,
    ];
}
