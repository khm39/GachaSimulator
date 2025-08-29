document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const gameSelect = document.getElementById('game-select');
    const draw1Btn = document.getElementById('draw-1-btn');
    const draw10Btn = document.getElementById('draw-10-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultsDisplay = document.getElementById('results-display');
    const descriptionText = document.getElementById('description');

    // Custom settings elements
    const customSettingsEl = document.getElementById('custom-settings');
    const customSsrRateEl = document.getElementById('custom-ssr-rate');
    const customSrRateEl = document.getElementById('custom-sr-rate');
    const customPityTypeEl = document.getElementById('custom-pity-type');
    const customPityCountEl = document.getElementById('custom-pity-count');

    // Status display elements
    const totalDrawsEl = document.getElementById('total-draws');
    const pityCounterEl = document.getElementById('pity-counter');
    const exchangePointsEl = document.getElementById('exchange-points');
    const exchangePointsLi = document.querySelector('#exchange-points').parentElement;
    const genshinGuaranteeEl = document.getElementById('genshin-guarantee');
    const genshinGuaranteeLi = document.querySelector('#genshin-guarantee').parentElement;

    // --- Game Configurations ---
    const gameConfigs = [
        {
            id: 'game_a',
            name: 'ゲームA',
            ssrRate: 0.01,
            srRate: 0.03,
            pity: 330,
            pityType: 'direct',
            pityDesc: '330回以内にPU対象の最高レアが1つ確定。',
            has10PullGuarantee: true,
            puSsrRate: 0.008, // PU対象のSSR排出率
        },
        {
            id: 'game_b',
            name: 'ゲームB',
            ssrRate: 0.006,
            srRate: 0.051,
            pity: 90,
            pityType: 'direct',
            softPityStart: 74,
            puRate: 0.5,
            pityDesc: '90回で最高レアが確定。74回から確率上昇。すり抜けたら次回最高レアはPU確定。',
        },
        {
            id: 'game_c',
            name: 'ゲームC',
            ssrRate: 0.03,
            srRate: 0.18,
            pity: 200,
            pityType: 'exchange',
            pointName: '交換Pt',
            puRate: 0.5,
            pityDesc: '200回引くと「交換Pt」が200貯まり、PU対象と交換可能。',
            has10PullGuarantee: true,
        },
        {
            id: 'game_d',
            name: 'ゲームD',
            ssrRate: 0.025,
            srRate: 0.18,
            pity: 200,
            pityType: 'exchange',
            pointName: '交換Pt',
            puRate: 0.5,
            pityDesc: '200回引くと「交換Pt」が200貯まり、PU対象と交換可能。',
            has10PullGuarantee: true,
        },
        {
            id: 'game_e',
            name: 'ゲームE',
            ssrRate: 0.02,
            srRate: 0.08,
            pity: 300,
            pityType: 'exchange',
            softPityStart: 51,
            pointName: '交換Pt',
            puRate: 0.5,
            pityDesc: '300回で交換可能。51回目から最高レアの確率が2%ずつ上昇。',
        },
        {
            id: 'game_f',
            name: 'ゲームF',
            ssrRate: 0.03,
            srRate: 0.15,
            pity: 300,
            pityType: 'exchange',
            pointName: '交換Pt',
            puRate: 0.5,
            pityDesc: '300回引くと「交換Pt」が300貯まり、PU対象などと交換可能。',
            has10PullGuarantee: true,
        },
        {
            id: 'dynamic_rate',
            name: '確率変動ガチャ',
            ssrRate: 0.01, // Base rate
            srRate: 0.10,
            pity: 100, // Final pity
            pityType: 'direct',
            pityDesc: '10回ごとにSSR確率が上昇し、100回で確定。',
            rateSteps: [
                { after: 10, ssrRate: 0.02 },
                { after: 20, ssrRate: 0.03 },
                { after: 30, ssrRate: 0.05 },
                { after: 40, ssrRate: 0.10 },
                { after: 50, ssrRate: 0.20 },
                { after: 90, ssrRate: 0.50 }
            ]
        },
        {
            id: 'custom',
            name: 'カスタム',
            ssrRate: 0.03,
            srRate: 0.15,
            pity: 200,
            pityType: 'exchange',
            pointName: '交換Pt',
            puRate: 0.5,
            pityDesc: 'カスタム設定でシミュレーションします。',
        }
    ];

    // --- Simulation State ---
    let state = {};

    // --- Functions ---

    function populateGameSelect() {
        gameConfigs.forEach(config => {
            const option = document.createElement('option');
            option.value = config.id;
            option.textContent = config.name;
            gameSelect.appendChild(option);
        });
    }

    function initializeSimulation(gameId) {
        let baseConfig = gameConfigs.find(g => g.id === gameId);
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
            isGuaranteedPu: false, // For game_b
            ssrCountSinceLastSr: 0, // For specific game logic if needed
        };

        resultsDisplay.innerHTML = '';
        descriptionText.textContent = finalConfig.pityDesc;
        updateStatusUI();
    }

    function updateStatusUI() {
        const { config, totalDraws, pityCount, exchangePoints, isGuaranteedPu, game } = state;

        totalDrawsEl.innerHTML = `<strong>合計回数:</strong> ${totalDraws}`;

        // Hide all optional status displays by default
        pityCounterEl.parentElement.style.display = 'none';
        exchangePointsLi.style.display = 'none';
        genshinGuaranteeLi.style.display = 'none';

        if (config.pityType === 'direct' && config.pity > 0) {
            pityCounterEl.innerHTML = `<strong>天井カウント:</strong> ${pityCount} / ${config.pity}`;
            pityCounterEl.parentElement.style.display = 'block';
        }

        if (config.pityType === 'exchange' && config.pity > 0) {
            const pointName = config.pointName || '交換Pt';
            exchangePointsEl.innerHTML = `<strong>${pointName}:</strong> ${exchangePoints} / ${config.pity}`;
            exchangePointsLi.style.display = 'block';
        }

        // Game-specific UI updates
        if (game === 'game_e') {
            pityCounterEl.innerHTML = `<strong>前回最高レアからの回数:</strong> ${pityCount}`;
            pityCounterEl.parentElement.style.display = 'block';
        }

        if (game === 'game_b') {
            genshinGuaranteeEl.innerHTML = `<strong>次回PU確定:</strong> ${isGuaranteedPu ? 'はい' : 'いいえ'}`;
            genshinGuaranteeLi.style.display = 'block';
        }
    }

    function createResultCard(result) {
        const { rarity, isPu, guaranteed } = result;
        const card = document.createElement('div');
        card.className = 'card result-card text-center h-100';

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
            pityBadge.textContent = '天井';
            card.appendChild(pityBadge);
        }

        cardBody.appendChild(rarityText);
        card.appendChild(cardBody);

        const wrapper = document.createElement('div');
        wrapper.className = 'col result-card-wrapper';
        wrapper.appendChild(card);

        return wrapper;
    }

    function drawOnce() {
        state.totalDraws++;
        const { game } = state;

        // Dispatch to the correct drawing function based on game id
        switch (game) {
            case 'game_a':
                return drawGameA();
            case 'game_b':
                return drawGameB();
            case 'game_e':
                return drawGameE();
            case 'dynamic_rate':
                return drawDynamicRate();
            default:
                return drawGeneric();
        }
    }

    // --- Game-specific draw functions ---

    function drawGameA() { // Formerly FGO
        const { config } = state;
        state.pityCount++;

        if (state.pityCount >= config.pity) {
            state.pityCount = 0;
            return { rarity: 'SSR', isPu: true, guaranteed: true };
        }

        const rand = Math.random();
        if (rand < config.ssrRate) {
            state.pityCount = 0; // Reset pity on any SSR
            const isPu = rand < (config.puSsrRate || 0.008);
            return { rarity: 'SSR', isPu, guaranteed: false };
        } else if (rand < config.ssrRate + config.srRate) {
            return { rarity: 'SR' };
        }
        return { rarity: 'R' };
    }

    function drawGameB() { // Formerly Genshin
        const { config } = state;
        state.pityCount++;
        let currentSsrRate = config.ssrRate;
        const isPity = state.pityCount >= config.pity;

        if (isPity) {
            currentSsrRate = 1;
        } else if (state.pityCount >= config.softPityStart) {
            // A simple linear increase for soft pity
            currentSsrRate += (1 - config.ssrRate) * ((state.pityCount - config.softPityStart + 1) / (config.pity - config.softPityStart + 1));
        }

        const rand = Math.random();
        if (rand < currentSsrRate) {
            let isPu = false;
            if (state.isGuaranteedPu || Math.random() < config.puRate) {
                isPu = true;
                state.isGuaranteedPu = false;
            } else {
                isPu = false;
                state.isGuaranteedPu = true;
            }
            const result = { rarity: 'SSR', isPu, guaranteed: isPity };
            state.pityCount = 0;
            return result;
        } else if (rand < currentSsrRate + config.srRate) {
            return { rarity: 'SR' };
        }
        return { rarity: 'R' };
    }

    function drawGameE() { // Formerly Arknights
        const { config } = state;
        state.exchangePoints++;
        state.pityCount++;
        let currentSsrRate = config.ssrRate;

        if (state.pityCount >= config.softPityStart) {
            currentSsrRate += 0.02 * (state.pityCount - config.softPityStart + 1);
        }

        const rand = Math.random();
        if (rand < currentSsrRate) {
            state.pityCount = 0;
            const isPu = Math.random() < config.puRate;
            return { rarity: 'SSR', isPu };
        } else if (rand < currentSsrRate + config.srRate) {
            return { rarity: 'SR' };
        }
        return { rarity: 'R' };
    }

    function drawDynamicRate() {
        const { config } = state;
        state.pityCount++;
        let currentSsrRate = config.ssrRate;

        for (const step of config.rateSteps) {
            if (state.pityCount >= step.after) {
                currentSsrRate = step.ssrRate;
            }
        }

        const isPity = state.pityCount >= config.pity;
        if (isPity) {
            currentSsrRate = 1;
        }

        const rand = Math.random();
        if (rand < currentSsrRate) {
            state.pityCount = 0;
            return { rarity: 'SSR', isPu: true, guaranteed: isPity };
        } else if (rand < currentSsrRate + config.srRate) {
            return { rarity: 'SR' };
        }
        return { rarity: 'R' };
    }

    function drawGeneric() {
        const { config } = state;
        state.pityCount++;
        if (config.pityType === 'exchange') {
            state.exchangePoints++;
        }

        let result = { rarity: 'R', isPu: false, guaranteed: false };
        const rand = Math.random();

        // Direct pity check
        if (config.pityType === 'direct' && config.pity > 0 && state.pityCount >= config.pity) {
            result = { rarity: 'SSR', isPu: true, guaranteed: true };
            state.pityCount = 0;
            return result;
        }

        if (rand < config.ssrRate) {
            result = { rarity: 'SSR', isPu: Math.random() < (config.puRate || 0.5) };
        } else if (rand < config.ssrRate + config.srRate) {
            result = { rarity: 'SR' };
        }
        return result;
    }


    function handleDraw(count) {
        if (!state.config) return;

        let currentResults = [];
        for (let i = 0; i < count; i++) {
            const result = drawOnce();
            currentResults.push(result);
        }

        // --- 10-Draw SR+ Guarantee ---
        if (count >= 10 && state.config.has10PullGuarantee) {
            const hasSrOrHigher = currentResults.some(res => res.rarity === 'SR' || res.rarity === 'SSR');
            if (!hasSrOrHigher) {
                const lastRIndex = currentResults.map(r => r.rarity).lastIndexOf('R');
                if (lastRIndex !== -1) {
                    currentResults[lastRIndex].rarity = 'SR';
                }
            }
        }

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
