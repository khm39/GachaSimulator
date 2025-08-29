import { game_a } from './games/game_a.js';
import { game_b } from './games/game_b.js';
import { game_e } from './games/game_e.js';
import { dynamic_rate } from './games/dynamic_rate.js';
import { game_c, game_d, game_f, custom } from './games/common.js';

// A map for quick lookups by ID
const games = {
    [game_a.id]: game_a,
    [game_b.id]: game_b,
    [game_c.id]: game_c,
    [game_d.id]: game_d,
    [game_e.id]: game_e,
    [game_f.id]: game_f,
    [dynamic_rate.id]: dynamic_rate,
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
        game_a,
        game_b,
        game_c,
        game_d,
        game_e,
        game_f,
        dynamic_rate,
        custom,
    ];
}
