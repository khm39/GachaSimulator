document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const gameSelect = document.getElementById('game-select');
    const draw1Btn = document.getElementById('draw-1-btn');
    const draw10Btn = document.getElementById('draw-10-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultsDisplay = document.getElementById('results-display');
    const descriptionText = document.getElementById('description');

    // Status display elements
    const totalDrawsEl = document.getElementById('total-draws');
    const pityCounterEl = document.getElementById('pity-counter');
    const exchangePointsEl = document.getElementById('exchange-points');
    const exchangePointsLi = document.querySelector('#exchange-points').parentElement;
    const genshinGuaranteeEl = document.getElementById('genshin-guarantee');
    const genshinGuaranteeLi = document.querySelector('#genshin-guarantee').parentElement;

    // --- Game Configurations ---
    const gameConfigs = {
        fgo: {
            name: '運命召喚',
            ssrRate: 0.01,
            srRate: 0.03,
            pity: 330,
            pityType: 'direct',
            pityDesc: '330回以内にPU対象の最高レアが1つ確定。',
        },
        genshin: {
            name: '七神の国',
            ssrRate: 0.006,
            srRate: 0.051,
            pity: 90,
            pityType: 'direct',
            softPityStart: 74,
            puRate: 0.5,
            pityDesc: '90回で最高レアが確定。74回から確率上昇。すり抜けたら次回最高レアはPU確定。',
        },
        uma: {
            name: '駿馬むすめ',
            ssrRate: 0.03,
            srRate: 0.18,
            pity: 200,
            pityType: 'exchange',
            pointName: '交換Pt',
            puRate: 0.5,
            pityDesc: '200回引くと「交換Pt」が200貯まり、PU対象と交換可能。',
        },
        priconne: {
            name: '姫君との絆',
            ssrRate: 0.025,
            srRate: 0.18,
            pity: 200,
            pityType: 'exchange',
            pointName: '交換Pt',
            puRate: 0.5,
            pityDesc: '200回引くと「交換Pt」が200貯まり、PU対象と交換可能。',
        },
        arknights: {
            name: '明日への方舟',
            ssrRate: 0.02,
            srRate: 0.08,
            pity: 300,
            pityType: 'exchange',
            softPityStart: 51,
            pointName: '交換Pt',
            puRate: 0.5,
            pityDesc: '300回で交換可能。51回目から最高レアの確率が2%ずつ上昇。',
        },
        granblue: {
            name: '蒼き幻想',
            ssrRate: 0.03,
            srRate: 0.15,
            pity: 300,
            pityType: 'exchange',
            pointName: '交換Pt',
            puRate: 0.5,
            pityDesc: '300回引くと「交換Pt」が300貯まり、PU対象などと交換可能。',
        }
    };

    // --- Simulation State ---
    let state = {};

    // --- Functions ---

    /**
     * Initializes or resets the simulation for a given game.
     * @param {string} gameId - The ID of the game to initialize.
     */
    function initializeSimulation(gameId) {
        const config = gameConfigs[gameId];

        state = {
            game: gameId,
            config: config,
            totalDraws: 0,
            pityCount: 0, // Counts since last SSR for direct pity systems
            exchangePoints: 0,
            isGuaranteedPu: false, // For Genshin's specific guarantee mechanic
        };

        resultsDisplay.innerHTML = '';
        descriptionText.textContent = config.pityDesc;
        updateStatusUI();
    }

    /**
     * Updates the entire status display based on the current state.
     */
    function updateStatusUI() {
        const { config, totalDraws, pityCount, exchangePoints, isGuaranteedPu, game } = state;

        totalDrawsEl.innerHTML = `<strong>合計回数:</strong> ${totalDraws}`;

        // Hide all optional status fields by default, then show them as needed
        pityCounterEl.parentElement.style.display = 'none';
        exchangePointsLi.style.display = 'none';
        genshinGuaranteeLi.style.display = 'none';

        if (config.pityType === 'direct') { // FGO, Genshin
            pityCounterEl.innerHTML = `<strong>天井カウント:</strong> ${pityCount} / ${config.pity}`;
            pityCounterEl.parentElement.style.display = 'block';
        }

        if (config.pityType === 'exchange') { // Uma, Priconne, Arknights, Granblue
            exchangePointsEl.innerHTML = `<strong>${config.pointName}:</strong> ${exchangePoints} / ${config.pity}`;
            exchangePointsLi.style.display = 'block';
        }

        if (game === 'arknights') {
            pityCounterEl.innerHTML = `<strong>前回星6からの回数:</strong> ${pityCount}`;
            pityCounterEl.parentElement.style.display = 'block';
        }

        if (game === 'genshin') {
            genshinGuaranteeEl.innerHTML = `<strong>次回PU確定:</strong> ${isGuaranteedPu ? 'はい' : 'いいえ'}`;
            genshinGuaranteeLi.style.display = 'block';
        }
    }

    /**
     * Creates the HTML for a single gacha result card.
     * @param {object} result - The result object from drawOnce.
     */
    function createResultCard(result) {
        const { rarity, isPu, guaranteed } = result;
        const card = document.createElement('div');
        card.className = 'card result-card text-center h-100'; // h-100 for equal height

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body p-2 d-flex flex-column justify-content-center';

        const rarityText = document.createElement('h5');
        rarityText.className = 'card-title mb-0';
        rarityText.textContent = rarity;

        card.classList.add(rarity.toLowerCase());
        if (isPu) {
            card.classList.add('pickup');
            const puBadge = document.createElement('span');
            puBadge.className = 'badge bg-warning text-dark position-absolute top-0 start-0 m-1';
            puBadge.textContent = 'PU';
            card.appendChild(puBadge);
        }
        if (guaranteed) {
            const pityBadge = document.createElement('span');
            pityBadge.className = 'badge bg-info text-dark position-absolute top-0 end-0 m-1';
            pityBadge.textContent = '天井'; // Pity
            card.appendChild(pityBadge);
        }

        cardBody.appendChild(rarityText);
        card.appendChild(cardBody);

        const wrapper = document.createElement('div');
        wrapper.className = 'col result-card-wrapper';
        wrapper.appendChild(card);

        return wrapper;
    }

    /**
     * Performs a single gacha draw based on the current game's rules.
     * @returns {object} An object representing the result.
     */
    function drawOnce() {
        state.totalDraws++;
        const { config, game } = state;
        let result = { rarity: 'R', isPu: false, guaranteed: false };

        if (game === 'fgo') {
            state.pityCount++; // Counts towards 330 guarantee
            if (state.pityCount === config.pity) {
                result = { rarity: 'SSR', isPu: true, guaranteed: true };
                state.pityCount = 0;
                return result;
            }
            const rand = Math.random();
            const puSsrRate = 0.008;
            if (rand < puSsrRate) {
                result = { rarity: 'SSR', isPu: true };
                state.pityCount = 0;
            } else if (rand < config.ssrRate) {
                result = { rarity: 'SSR', isPu: false };
            } else if (rand < config.ssrRate + config.srRate) {
                result = { rarity: 'SR' };
            }

        } else if (game === 'genshin') {
            state.pityCount++;
            let currentSsrRate = config.ssrRate;

            if (state.pityCount >= config.softPityStart) {
                // Linear increase model to guarantee SSR at pity
                currentSsrRate += (1 - config.ssrRate) / (config.pity - config.softPityStart + 1);
            }
            if (state.pityCount === config.pity) {
                currentSsrRate = 1;
            }

            const rand = Math.random();
            if (rand < currentSsrRate) {
                const isPity = state.pityCount === config.pity;
                if (state.isGuaranteedPu || Math.random() < config.puRate) {
                    result = { rarity: 'SSR', isPu: true, guaranteed: isPity };
                    state.isGuaranteedPu = false;
                } else {
                    result = { rarity: 'SSR', isPu: false, guaranteed: isPity };
                    state.isGuaranteedPu = true;
                }
                state.pityCount = 0;
            } else if (rand < currentSsrRate + config.srRate) {
                result = { rarity: 'SR' };
            }

        } else if (game === 'arknights') {
            state.exchangePoints++;
            state.pityCount++;
            let currentSsrRate = config.ssrRate;

            if (state.pityCount >= config.softPityStart) {
                currentSsrRate += 0.02 * (state.pityCount - config.softPityStart + 1);
            }

            const rand = Math.random();
            if (rand < currentSsrRate) {
                result = { rarity: 'SSR', isPu: Math.random() < config.puRate };
                state.pityCount = 0;
            } else if (rand < currentSsrRate + config.srRate) {
                result = { rarity: 'SR' };
            }

        } else { // Standard Exchange Games (Uma, Priconne, Granblue)
            state.exchangePoints++;
            const rand = Math.random();
            if (rand < config.ssrRate) {
                result = { rarity: 'SSR', isPu: Math.random() < config.puRate };
            } else if (rand < config.ssrRate + config.srRate) {
                result = { rarity: 'SR' };
            }
        }

        return result;
    }

    /**
     * Main function to handle drawing gacha.
     * @param {number} count - The number of draws to perform.
     */
    function handleDraw(count) {
        if (!state.config) return;

        let currentResults = [];
        for (let i = 0; i < count; i++) {
            const result = drawOnce();
            currentResults.push(result);
        }

        // Render results to the screen, prepending new ones
        currentResults.reverse().forEach(result => {
            const cardElement = createResultCard(result);
            resultsDisplay.prepend(cardElement);
        });

        updateStatusUI();
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

    // --- Initial Load ---
    initializeSimulation(gameSelect.value);
});
