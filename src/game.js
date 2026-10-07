// SAFE Stock Market Game
// A 20-day trading simulation with virtual cash. Self-contained: needs the
// #game markup in index.html and Chart.js. State is saved to localStorage so
// a refresh doesn't lose the game.
(function () {
    'use strict';

    const START_CASH = 10000;
    const MAX_DAYS = 20;
    const STORAGE_KEY = 'safe-stock-game-v2';

    const COMPANIES = [
        { id: 'TechCorp',    name: 'TechCorp',    sector: 'Technology', start: 100, color: '#FFD700', vol: 0.035 },
        { id: 'GreenEnergy', name: 'GreenEnergy', sector: 'Renewables', start: 80,  color: '#34d399', vol: 0.04  },
        { id: 'HealthInc',   name: 'HealthInc',   sector: 'Healthcare', start: 120, color: '#f472b6', vol: 0.03  },
        { id: 'AutoDrive',   name: 'AutoDrive',   sector: 'Automotive', start: 150, color: '#60a5fa', vol: 0.045 },
        { id: 'FoodChain',   name: 'FoodChain',   sector: 'Consumer',   start: 90,  color: '#fb923c', vol: 0.02  },
    ];

    const NEWS = [
        { id: 'TechCorp',    text: 'TechCorp announces a new AI product', change: 0.15 },
        { id: 'TechCorp',    text: 'TechCorp faces regulatory scrutiny', change: -0.14 },
        { id: 'GreenEnergy', text: 'GreenEnergy wins a national renewable energy contract', change: 0.18 },
        { id: 'GreenEnergy', text: 'GreenEnergy reports supply chain problems', change: -0.16 },
        { id: 'HealthInc',   text: 'HealthInc releases a breakthrough drug', change: 0.2 },
        { id: 'HealthInc',   text: 'HealthInc recalls a product', change: -0.18 },
        { id: 'AutoDrive',   text: 'AutoDrive unveils self-driving technology', change: 0.17 },
        { id: 'AutoDrive',   text: 'AutoDrive hit by production delays', change: -0.15 },
        { id: 'FoodChain',   text: 'FoodChain expands into new markets', change: 0.1 },
        { id: 'FoodChain',   text: 'FoodChain faces food safety concerns', change: -0.12 },
        { id: null,          text: 'Interest rates cut: the whole market rallies', change: 0.05 },
        { id: null,          text: 'Recession fears: the whole market dips', change: -0.06 },
    ];

    const TIPS = [
        'Tip: Spreading money across sectors (diversification) reduces the damage one bad headline can do.',
        'Tip: Buying after a big jump often means paying a premium. Prices can fall back.',
        'Tip: Your average cost tells you whether a holding is actually in profit.',
        'Tip: Market-wide news moves every stock, so diversification can\'t remove all risk.',
        'Tip: Steadier companies (like FoodChain here) move less, both up and down.',
        'Tip: Keeping some cash lets you buy when prices drop.',
        'Tip: Real investing is long-term. Twenty days is a game, not a strategy!',
    ];

    const ACHIEVEMENTS = [
        { id: 'first-trade', icon: '🥇', name: 'First Trade',          desc: 'Make your first trade' },
        { id: 'diversified', icon: '🧺', name: 'Diversified Investor', desc: 'Own 3 different companies at once' },
        { id: 'all-in',      icon: '🌍', name: 'Whole Market',         desc: 'Own all 5 companies at once' },
        { id: 'profit',      icon: '📈', name: 'Profitable Trader',    desc: 'Reach a net worth of $15,000' },
        { id: 'take-profit', icon: '💰', name: 'Take Profit',          desc: 'Sell shares for more than you paid' },
        { id: 'survivor',    icon: '🏁', name: 'Market Survivor',      desc: 'Finish all 20 days' },
    ];

    const $ = (id) => document.getElementById(id);
    if (!$('game-root')) return;

    const money = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const pct = (n) => (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
    const company = (id) => COMPANIES.find((c) => c.id === id);

    let state;
    let selected = null;
    let chartMode = 'all';
    let chart = null;

    // ── State ────────────────────────────────────────────────────────────────

    function newState() {
        const prices = {};
        COMPANIES.forEach((c) => (prices[c.id] = [c.start]));
        return {
            day: 1,
            cash: START_CASH,
            prices,
            holdings: {},          // id -> { shares, cost } (cost = total paid)
            news: [{ day: 1, text: 'Market opens. Good luck!', change: 0, id: null }],
            achievements: [],
            trades: 0,
            finished: false,
        };
    }

    function save() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
    }

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const s = JSON.parse(raw);
            if (!s || !s.prices || typeof s.cash !== 'number') return null;
            return s;
        } catch (e) { return null; }
    }

    const priceOf = (id, day = state.day) => state.prices[id][day - 1];
    const prevPriceOf = (id) => state.prices[id][Math.max(0, state.day - 2)];

    function holdingsValue() {
        return Object.entries(state.holdings).reduce((sum, [id, h]) => sum + h.shares * priceOf(id), 0);
    }
    const netWorth = () => state.cash + holdingsValue();

    // ── Simulation ───────────────────────────────────────────────────────────

    function advanceDay() {
        if (state.finished) return;
        if (state.day >= MAX_DAYS) { finishGame(); return; }

        state.day += 1;
        const headline = NEWS[Math.floor(Math.random() * NEWS.length)];

        COMPANIES.forEach((c) => {
            const last = state.prices[c.id][state.day - 2];
            const noise = (Math.random() * 2 - 1) * c.vol;
            let move = noise;
            if (headline.id === c.id) move += headline.change;
            if (headline.id === null) move += headline.change * (0.6 + Math.random() * 0.8);
            const next = Math.max(1, last * (1 + move));
            state.prices[c.id].push(Math.round(next * 100) / 100);
        });

        state.news.unshift({ day: state.day, text: headline.text, change: headline.change, id: headline.id });
        state.news = state.news.slice(0, 20);

        checkAchievements();
        save();
        render();
        setTip();

        if (state.day === MAX_DAYS) {
            $('g-next').textContent = 'Close market 🏁';
            toast('Final trading day. Make your last moves, then close the market.');
        }
    }

    function finishGame() {
        state.finished = true;
        unlock('survivor');
        save();
        render();
        showSummary();
    }

    // ── Trading ──────────────────────────────────────────────────────────────

    function quantity() {
        const q = parseInt($('g-qty').value, 10);
        return Number.isFinite(q) && q > 0 ? q : 0;
    }

    function maxBuyable() {
        return selected ? Math.floor(state.cash / priceOf(selected)) : 0;
    }

    function buy() {
        const q = quantity();
        if (!selected || !q || state.finished) return;
        const price = priceOf(selected);
        const cost = q * price;
        if (cost > state.cash + 1e-9) {
            feedback(`Not enough cash. You can afford ${maxBuyable()} share(s).`, 'error');
            return;
        }
        state.cash -= cost;
        const h = state.holdings[selected] || { shares: 0, cost: 0 };
        h.shares += q;
        h.cost += cost;
        state.holdings[selected] = h;
        state.trades += 1;
        feedback(`Bought ${q} ${selected} share${q > 1 ? 's' : ''} for ${money(cost)}.`, 'success');
        unlock('first-trade');
        checkAchievements();
        save();
        render();
    }

    function sell() {
        const q = quantity();
        const h = selected && state.holdings[selected];
        if (!selected || !q || state.finished) return;
        if (!h || q > h.shares) {
            feedback(`You only own ${h ? h.shares : 0} ${selected} share(s).`, 'error');
            return;
        }
        const price = priceOf(selected);
        const proceeds = q * price;
        const avg = h.cost / h.shares;
        const profit = (price - avg) * q;

        state.cash += proceeds;
        h.cost -= avg * q;
        h.shares -= q;
        if (h.shares === 0) delete state.holdings[selected];
        state.trades += 1;

        const pl = profit >= 0 ? `profit of ${money(profit)}` : `loss of ${money(-profit)}`;
        feedback(`Sold ${q} ${selected} share${q > 1 ? 's' : ''} for ${money(proceeds)}: a ${pl}.`, profit >= 0 ? 'success' : 'error');
        if (profit > 0) unlock('take-profit');
        checkAchievements();
        save();
        render();
    }

    // ── Achievements ─────────────────────────────────────────────────────────

    function unlock(id) {
        if (state.achievements.includes(id)) return;
        state.achievements.push(id);
        const a = ACHIEVEMENTS.find((x) => x.id === id);
        toast(`${a.icon} Achievement unlocked: ${a.name}`);
    }

    function checkAchievements() {
        const owned = Object.keys(state.holdings).length;
        if (owned >= 3) unlock('diversified');
        if (owned === COMPANIES.length) unlock('all-in');
        if (netWorth() >= 15000) unlock('profit');
    }

    // ── Rendering ────────────────────────────────────────────────────────────

    function render() {
        const nw = netWorth();
        const ret = (nw / START_CASH - 1) * 100;

        $('g-cash').textContent = money(state.cash);
        $('g-holdings').textContent = money(holdingsValue());
        $('g-networth').textContent = money(nw);
        const r = $('g-return');
        r.textContent = pct(ret);
        r.className = 'game-stat-value ' + (ret > 0 ? 'text-emerald-400' : ret < 0 ? 'text-rose-400' : '');
        $('g-day').textContent = state.day;
        $('g-maxday').textContent = MAX_DAYS;
        $('g-progress').style.width = (state.day / MAX_DAYS) * 100 + '%';

        renderMarket();
        renderTrade();
        renderHoldings();
        renderNews();
        renderAchievements();
        renderChart();

        const next = $('g-next');
        next.disabled = state.finished;
        next.classList.toggle('opacity-40', state.finished);
        if (!state.finished && state.day < MAX_DAYS) next.textContent = 'Next day →';
        if (state.finished) next.textContent = 'Market closed';
    }

    function changeBadge(change) {
        const cls = change > 0 ? 'text-emerald-400' : change < 0 ? 'text-rose-400' : 'text-gray-400';
        const arrow = change > 0 ? '▲' : change < 0 ? '▼' : '•';
        return `<span class="${cls}">${arrow} ${Math.abs(change).toFixed(2)}%</span>`;
    }

    function renderMarket() {
        $('g-market').innerHTML = COMPANIES.map((c) => {
            const price = priceOf(c.id);
            const change = state.day > 1 ? (price / prevPriceOf(c.id) - 1) * 100 : 0;
            const owned = state.holdings[c.id] ? state.holdings[c.id].shares : 0;
            const active = selected === c.id;
            return `
                <tr class="g-row border-b border-white/5 cursor-pointer transition ${active ? 'bg-gold/10' : 'hover:bg-white/5'}" data-id="${c.id}" tabindex="0" aria-selected="${active}">
                    <td class="py-2.5 pr-3">
                        <div class="flex items-center gap-2">
                            <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${c.color}"></span>
                            <div><p class="font-semibold ${active ? 'text-gold' : ''}">${c.name}</p><p class="text-xs text-gray-500 hidden sm:block">${c.sector}</p></div>
                        </div>
                    </td>
                    <td class="py-2.5 px-2 sm:px-3 text-right font-medium tabular-nums whitespace-nowrap">${money(price)}<div class="sm:hidden text-xs font-normal">${changeBadge(change)}</div></td>
                    <td class="py-2.5 px-2 sm:px-3 text-right tabular-nums whitespace-nowrap hidden sm:table-cell">${changeBadge(change)}</td>
                    <td class="py-2.5 pl-2 sm:pl-3 text-right tabular-nums ${owned ? 'text-white' : 'text-gray-600'}">${owned}</td>
                </tr>`;
        }).join('');
    }

    function renderTrade() {
        const has = Boolean(selected);
        $('g-trade').classList.toggle('hidden', !has);
        $('g-trade-empty').classList.toggle('hidden', has);
        if (!has) return;

        const c = company(selected);
        const price = priceOf(selected);
        const owned = state.holdings[selected] ? state.holdings[selected].shares : 0;
        const q = quantity();

        $('g-sel-name').textContent = c.name;
        $('g-sel-sector').textContent = c.sector;
        $('g-sel-price').textContent = money(price);
        $('g-estimate').textContent = money(q * price);
        $('g-owned').textContent = owned;
        $('g-buy').disabled = state.finished || !q || q * price > state.cash + 1e-9;
        $('g-sell').disabled = state.finished || !q || q > owned;
    }

    function renderHoldings() {
        const entries = Object.entries(state.holdings);
        if (!entries.length) {
            $('g-holdings-list').innerHTML = '<p class="text-gray-500">No shares yet. Your cash is safe, but it isn\'t growing.</p>';
            return;
        }
        $('g-holdings-list').innerHTML = entries.map(([id, h]) => {
            const price = priceOf(id);
            const value = h.shares * price;
            const avg = h.cost / h.shares;
            const pl = value - h.cost;
            const plPct = (price / avg - 1) * 100;
            const cls = pl >= 0 ? 'text-emerald-400' : 'text-rose-400';
            return `
                <button type="button" class="g-holding w-full text-left flex items-center justify-between gap-3 bg-black/40 hover:bg-black/60 rounded-lg px-3 py-2 transition" data-id="${id}">
                    <div><p class="font-semibold">${id} <span class="text-gray-500 font-normal">× ${h.shares}</span></p><p class="text-xs text-gray-500">Avg cost ${money(avg)}</p></div>
                    <div class="text-right"><p class="font-medium tabular-nums">${money(value)}</p><p class="text-xs tabular-nums ${cls}">${pl >= 0 ? '+' : '−'}${money(Math.abs(pl))} (${pct(plPct)})</p></div>
                </button>`;
        }).join('');
    }

    function renderNews() {
        $('g-news').innerHTML = state.news.map((n) => {
            const tone = n.change > 0 ? 'border-emerald-500/60' : n.change < 0 ? 'border-rose-500/60' : 'border-gold/40';
            const icon = n.change > 0 ? '📈' : n.change < 0 ? '📉' : '🔔';
            return `<li class="border-l-2 ${tone} pl-3 py-1"><span class="text-xs text-gray-500">Day ${n.day}</span><p class="text-gray-200">${icon} ${n.text}</p></li>`;
        }).join('');
    }

    function renderAchievements() {
        $('g-achievements').innerHTML = ACHIEVEMENTS.map((a) => {
            const done = state.achievements.includes(a.id);
            return `<li class="flex items-center gap-3 rounded-lg px-3 py-2 ${done ? 'bg-gold/10 border border-gold/30' : 'bg-black/30 border border-white/5 opacity-60'}">
                <span class="text-xl ${done ? '' : 'grayscale'}" aria-hidden="true">${done ? a.icon : '🔒'}</span>
                <div><p class="font-medium ${done ? 'text-gold' : 'text-gray-300'}">${a.name}</p><p class="text-xs text-gray-500">${a.desc}</p></div>
            </li>`;
        }).join('');
    }

    function renderChart() {
        if (typeof Chart === 'undefined') return;
        const labels = Array.from({ length: state.day }, (_, i) => `Day ${i + 1}`);
        const visible = chartMode === 'selected' && selected ? [company(selected)] : COMPANIES;
        const datasets = visible.map((c) => ({
            label: c.name,
            data: state.prices[c.id].slice(0, state.day),
            borderColor: c.color,
            backgroundColor: c.color + '22',
            fill: chartMode === 'selected',
            tension: 0.3,
            pointRadius: state.day > 12 ? 0 : 2,
            borderWidth: selected === c.id ? 3 : 2,
        }));

        if (!chart) {
            chart = new Chart($('g-chart'), {
                type: 'line',
                data: { labels, datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { labels: { color: '#d1d5db', boxWidth: 10, usePointStyle: true } },
                        tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${money(ctx.parsed.y)}` } },
                    },
                    scales: {
                        x: { ticks: { color: '#9ca3af', maxTicksLimit: 10 }, grid: { color: 'rgba(255,255,255,0.05)' } },
                        y: { ticks: { color: '#9ca3af', callback: (v) => '$' + v }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    },
                },
            });
        } else {
            chart.data.labels = labels;
            chart.data.datasets = datasets;
            chart.update();
        }
    }

    // ── Feedback ─────────────────────────────────────────────────────────────

    function feedback(text, kind) {
        const el = $('g-feedback');
        el.textContent = text;
        el.className = 'text-sm mt-3 min-h-[1.25rem] ' + (kind === 'error' ? 'text-rose-400' : 'text-emerald-400');
    }

    let toastTimer;
    function toast(text) {
        const el = $('g-toast');
        el.textContent = text;
        el.classList.remove('hidden');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.add('hidden'), 3200);
    }

    function setTip() {
        $('g-tip').textContent = TIPS[(state.day - 1) % TIPS.length];
    }

    function showSummary() {
        const nw = netWorth();
        const ret = (nw / START_CASH - 1) * 100;
        const best = COMPANIES
            .map((c) => ({ c, gain: (priceOf(c.id) / c.start - 1) * 100 }))
            .sort((a, b) => b.gain - a.gain)[0];

        $('g-sum-networth').textContent = money(nw);
        const r = $('g-sum-return');
        r.textContent = pct(ret);
        r.className = 'game-stat-value ' + (ret >= 0 ? 'text-emerald-400' : 'text-rose-400');
        $('g-sum-trades').textContent = state.trades;
        $('g-sum-best').textContent = `${best.c.name} (${pct(best.gain)})`;

        let emoji = '🏁', verdict;
        if (state.trades === 0) { emoji = '🛌'; verdict = 'You held cash the whole time. Safe, but your money didn\'t grow. Try investing next round!'; }
        else if (ret >= 25) { emoji = '🏆'; verdict = 'Outstanding! You beat the market. Remember that real markets also reward patience.'; }
        else if (ret >= 5) { emoji = '📈'; verdict = 'Nice work: a solid positive return. Diversification and timing paid off.'; }
        else if (ret >= 0) { emoji = '🙂'; verdict = 'You protected your capital. Could more diversification have helped you grow it?'; }
        else { emoji = '📉'; verdict = 'A loss this time, and that\'s how everyone learns. Look at which headlines hurt you most.'; }
        $('g-summary-emoji').textContent = emoji;
        $('g-sum-verdict').textContent = verdict;

        const modal = $('g-summary');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        $('g-play-again').focus();
    }

    function hideSummary() {
        const modal = $('g-summary');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    function select(id) {
        selected = id;
        $('g-qty').value = 1;
        $('g-feedback').textContent = '';
        render();
    }

    function resetGame() {
        state = newState();
        selected = null;
        hideSummary();
        $('g-feedback').textContent = '';
        save();
        setTip();
        render();
    }

    // ── Events ───────────────────────────────────────────────────────────────

    $('g-market').addEventListener('click', (e) => {
        const row = e.target.closest('.g-row');
        if (row) select(row.dataset.id);
    });
    $('g-market').addEventListener('keydown', (e) => {
        const row = e.target.closest('.g-row');
        if (row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(row.dataset.id); }
    });
    $('g-holdings-list').addEventListener('click', (e) => {
        const btn = e.target.closest('.g-holding');
        if (btn) select(btn.dataset.id);
    });

    $('g-qty').addEventListener('input', renderTrade);
    $('g-qty-inc').addEventListener('click', () => { $('g-qty').value = quantity() + 1; renderTrade(); });
    $('g-qty-dec').addEventListener('click', () => { $('g-qty').value = Math.max(1, quantity() - 1); renderTrade(); });
    $('g-qty-max').addEventListener('click', () => {
        const owned = state.holdings[selected] ? state.holdings[selected].shares : 0;
        $('g-qty').value = Math.max(1, maxBuyable() || owned);
        renderTrade();
    });
    $('g-buy').addEventListener('click', buy);
    $('g-sell').addEventListener('click', sell);
    $('g-next').addEventListener('click', advanceDay);
    $('g-reset').addEventListener('click', () => {
        if (state.trades === 0 && state.day === 1) return resetGame();
        if (confirm('Start a new game? Your current progress will be lost.')) resetGame();
    });
    $('g-play-again').addEventListener('click', resetGame);
    $('g-summary').addEventListener('click', (e) => { if (e.target.id === 'g-summary') hideSummary(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideSummary(); });

    document.querySelectorAll('.g-chart-mode').forEach((btn) => {
        btn.addEventListener('click', () => {
            chartMode = btn.dataset.mode;
            document.querySelectorAll('.g-chart-mode').forEach((b) => b.classList.toggle('active', b === btn));
            if (chartMode === 'selected' && !selected) toast('Select a company to chart it on its own.');
            renderChart();
        });
    });

    // ── Start ────────────────────────────────────────────────────────────────

    state = load() || newState();
    setTip();
    render();
    if (state.day === MAX_DAYS && !state.finished) $('g-next').textContent = 'Close market 🏁';
})();
