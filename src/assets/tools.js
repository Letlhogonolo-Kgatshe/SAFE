// SAFE money tools. Each tool renders into #tool-panel; inputs are saved
// locally (localStorage) so people can come back to their numbers.
(function () {
    'use strict';
    const { rand, esc, store, toast } = window.SAFE;
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const num = (v) => { const n = parseFloat(String(v).replace(/[^\d.-]/g, '')); return Number.isFinite(n) ? n : 0; };
    const panel = $('#tool-panel');
    let chart;
    const drawChart = (canvas, config) => {
        if (chart) chart.destroy();
        if (!window.Chart) return;
        Chart.defaults.color = '#9ca3af';
        Chart.defaults.font.family = 'Inter, system-ui, sans-serif';
        chart = new Chart(canvas, config);
    };
    const field = (id, label, value, extra = '') =>
        `<label class="block"><span class="label">${label}</span><input id="${id}" class="field" inputmode="decimal" value="${esc(value)}" ${extra}></label>`;
    const stat = (label, value, cls = '') => `<div class="stat"><p class="stat-label">${label}</p><p class="stat-value ${cls}">${value}</p></div>`;
    const head = (title, intro) => `<h2 class="text-2xl font-bold">${title}</h2><p class="text-gray-400 mt-1 mb-6">${intro}</p>`;
    const monthName = (m) => { const d = new Date(); d.setMonth(d.getMonth() + m); return d.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' }); };

    // ── Budget planner ──────────────────────────────────────────────────
    const BUDGET_DEFAULT = {
        income: 25000,
        lines: [
            ['Rent / bond', 'need', 8000], ['Transport & petrol', 'need', 2500], ['Groceries', 'need', 3000], ['Electricity, water & data', 'need', 1500],
            ['Insurance & medical', 'need', 1200], ['Eating out & entertainment', 'want', 1800], ['Clothing & personal', 'want', 1000], ['Family support', 'want', 1500],
            ['Emergency fund', 'save', 1000], ['TFSA / investments', 'save', 1500], ['Extra debt payment', 'save', 500],
        ],
    };
    function budget() {
        const s = store.get('budget', BUDGET_DEFAULT);
        const row = ([name, kind, amt], i) => `
            <div class="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center" data-row="${i}">
                <input class="field !py-2 text-sm" data-k="name" value="${esc(name)}" aria-label="Item name">
                <select class="field !py-2 !w-auto text-sm" data-k="kind" aria-label="Type">
                    <option value="need"${kind === 'need' ? ' selected' : ''}>Need</option><option value="want"${kind === 'want' ? ' selected' : ''}>Want</option><option value="save"${kind === 'save' ? ' selected' : ''}>Save/debt</option>
                </select>
                <input class="field !py-2 !w-28 text-sm text-right" data-k="amt" inputmode="decimal" value="${amt}" aria-label="Monthly amount">
                <button class="w-8 h-8 rounded-lg hover:bg-white/10 text-gray-500" data-del="${i}" aria-label="Remove ${esc(name)}">✕</button>
            </div>`;
        panel.innerHTML = head('Budget planner', 'Give every rand a job. Compare your spending with the 50/30/20 guideline: 50% needs, 30% wants, 20% saving and debt.') + `
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div>
                    ${field('b-income', 'Monthly take-home pay (after tax)', s.income)}
                    <div class="mt-4 space-y-2" id="b-rows">${s.lines.map(row).join('')}</div>
                    <div class="mt-3 flex gap-2"><button class="btn-ghost !py-2 text-sm" id="b-add">+ Add item</button><button class="text-sm text-gray-400 hover:text-white px-3" id="b-reset">Reset example</button></div>
                </div>
                <div>
                    <div class="grid grid-cols-2 gap-3" id="b-stats"></div>
                    <div class="mt-5 space-y-4" id="b-bars"></div>
                    <p class="mt-5 text-sm text-gray-300" id="b-tip"></p>
                </div>
            </div>`;
        const read = () => ({ income: num($('#b-income').value), lines: $$('#b-rows [data-row]').map((r) => [$('[data-k=name]', r).value, $('[data-k=kind]', r).value, num($('[data-k=amt]', r).value)]) });
        const calc = () => {
            const d = read(); store.set('budget', d);
            const sum = (k) => d.lines.filter((l) => l[1] === k).reduce((a, l) => a + l[2], 0);
            const need = sum('need'), want = sum('want'), save = sum('save'), left = d.income - need - want - save;
            $('#b-stats').innerHTML = stat('Planned', rand(need + want + save)) + stat(left >= 0 ? 'Unallocated' : 'Overspent', rand(Math.abs(left)), left >= 0 ? 'text-emerald-400' : 'text-rose-400');
            const bar = (label, val, target, color) => {
                const pct = d.income ? (val / d.income) * 100 : 0;
                return `<div><div class="flex justify-between text-sm"><span>${label}</span><span class="tabular-nums">${rand(val)} · <strong>${pct.toFixed(0)}%</strong> <span class="text-gray-500">(guide ${target}%)</span></span></div>
                    <div class="mt-1.5 h-2.5 rounded-full bg-white/10 overflow-hidden relative"><div class="h-full rounded-full ${color}" style="width:${Math.min(pct, 100)}%"></div><div class="absolute top-0 bottom-0 w-px bg-white/60" style="left:${target}%"></div></div></div>`;
            };
            $('#b-bars').innerHTML = bar('Needs', need, 50, 'bg-sky-400') + bar('Wants', want, 30, 'bg-fuchsia-400') + bar('Saving & debt', save, 20, 'bg-gold');
            const savePct = d.income ? (save / d.income) * 100 : 0;
            $('#b-tip').innerHTML = left < 0 ? `⚠️ You've planned <strong>${rand(-left)}</strong> more than you earn. Trim wants first, then needs.`
                : savePct < 10 ? `💡 You're saving ${savePct.toFixed(0)}%. Even moving <strong>${rand(Math.max(left, d.income * 0.05))}</strong> into saving makes a real difference over time.`
                : left > 0 ? `✅ Good plan. Give the unallocated <strong>${rand(left)}</strong> a job, e.g. your emergency fund or TFSA.`
                : '✅ Every rand has a job. Nice work!';
        };
        panel.oninput = calc;
        panel.onchange = calc;
        panel.onclick = (e) => {
            if (e.target.id === 'b-add') { const d = read(); d.lines.push(['New item', 'want', 0]); store.set('budget', d); budget(); }
            if (e.target.id === 'b-reset') { store.set('budget', BUDGET_DEFAULT); budget(); }
            const del = e.target.closest('[data-del]'); if (del) { const d = read(); d.lines.splice(+del.dataset.del, 1); store.set('budget', d); budget(); }
        };
        calc();
    }

    // ── Debt payoff ─────────────────────────────────────────────────────
    const DEBT_DEFAULT = { extra: 1000, debts: [['Store card', 6500, 21, 350], ['Credit card', 18000, 19.75, 900], ['Personal loan', 42000, 24, 1650], ['Car finance', 165000, 12.5, 4100]] };
    function simulate(debts, extra, order) {
        let list = debts.map(([name, bal, rate, min]) => ({ name, bal, r: rate / 1200, min }));
        let month = 0, interest = 0; const cleared = [];
        while (list.some((d) => d.bal > 0.01) && month < 600) {
            month++;
            let pool = extra;
            list.forEach((d) => { if (d.bal > 0) { const i = d.bal * d.r; interest += i; d.bal += i; } });
            list.forEach((d) => { if (d.bal > 0) { const p = Math.min(d.min, d.bal); d.bal -= p; pool += d.min - p; } else pool += d.min; });
            const targets = list.filter((d) => d.bal > 0.01).sort(order);
            for (const t of targets) { if (pool <= 0) break; const p = Math.min(pool, t.bal); t.bal -= p; pool -= p; }
            list.forEach((d) => { if (d.bal <= 0.01 && !cleared.some((c) => c.name === d.name)) { d.bal = 0; cleared.push({ name: d.name, month }); } });
        }
        return { month, interest, cleared, stuck: month >= 600 };
    }
    function debt() {
        const s = store.get('debt', DEBT_DEFAULT);
        const row = ([n, b, r, m], i) => `
            <div class="grid grid-cols-2 sm:grid-cols-[1.4fr_1fr_.7fr_1fr_auto] gap-2 items-center" data-row="${i}">
                <input class="field !py-2 text-sm col-span-2 sm:col-span-1" data-k="n" value="${esc(n)}" aria-label="Debt name">
                <input class="field !py-2 text-sm" data-k="b" inputmode="decimal" value="${b}" aria-label="Balance (R)">
                <input class="field !py-2 text-sm" data-k="r" inputmode="decimal" value="${r}" aria-label="Interest rate %">
                <input class="field !py-2 text-sm" data-k="m" inputmode="decimal" value="${m}" aria-label="Minimum payment (R)">
                <button class="w-8 h-8 rounded-lg hover:bg-white/10 text-gray-500" data-del="${i}" aria-label="Remove ${esc(n)}">✕</button>
            </div>`;
        panel.innerHTML = head('Debt payoff planner', 'Compare the snowball (smallest balance first) and avalanche (highest interest first) methods, and see when you could be debt-free.') + `
            <div class="hidden sm:grid grid-cols-[1.4fr_1fr_.7fr_1fr_auto] gap-2 text-xs text-gray-500 mb-1 pr-10"><span>Debt</span><span>Balance (R)</span><span>Rate %</span><span>Min. payment (R)</span></div>
            <div class="space-y-2" id="d-rows">${s.debts.map(row).join('')}</div>
            <div class="mt-3 flex flex-wrap gap-3 items-end">
                <button class="btn-ghost !py-2 text-sm" id="d-add">+ Add debt</button>
                <div class="w-56">${field('d-extra', 'Extra you can pay each month (R)', s.extra)}</div>
            </div>
            <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4" id="d-out"></div>
            <p class="mt-4 text-sm text-gray-400" id="d-note"></p>`;
        const read = () => ({ extra: num($('#d-extra').value), debts: $$('#d-rows [data-row]').map((r) => [$('[data-k=n]', r).value, num($('[data-k=b]', r).value), num($('[data-k=r]', r).value), num($('[data-k=m]', r).value)]) });
        const calc = () => {
            const d = read(); store.set('debt', d);
            const debts = d.debts.filter((x) => x[1] > 0);
            if (!debts.length) { $('#d-out').innerHTML = '<p class="text-gray-400">Add at least one debt.</p>'; return; }
            const snow = simulate(debts, d.extra, (a, b) => a.bal - b.bal);
            const aval = simulate(debts, d.extra, (a, b) => b.r - a.r);
            const base = simulate(debts, 0, (a, b) => b.r - a.r);
            const card = (title, sub, r, best) => `
                <div class="rounded-2xl p-5 ${best ? 'bg-gold/10 border border-gold/40' : 'bg-white/5 border border-white/10'}">
                    <div class="flex justify-between items-start"><div><p class="font-semibold">${title}</p><p class="text-xs text-gray-400">${sub}</p></div>${best ? '<span class="badge bg-gold text-black">Saves most</span>' : ''}</div>
                    ${r.stuck ? '<p class="mt-4 text-rose-400 text-sm">Your payments don\'t cover the interest. Increase the payments to make progress.</p>' : `
                    <div class="grid grid-cols-2 gap-3 mt-4">${stat('Debt-free in', `${Math.floor(r.month / 12)}y ${r.month % 12}m`)}${stat('Interest paid', rand(r.interest))}</div>
                    <p class="text-sm text-gray-300 mt-3">Debt-free by <strong>${monthName(r.month)}</strong></p>
                    <ol class="mt-3 text-sm text-gray-400 space-y-1 list-decimal list-inside">${r.cleared.map((c) => `<li>${esc(c.name)} cleared in month ${c.month}</li>`).join('')}</ol>`}
                </div>`;
            const avBest = aval.interest <= snow.interest;
            $('#d-out').innerHTML = card('🏔️ Avalanche', 'Highest interest rate first', aval, avBest) + card('⛄ Snowball', 'Smallest balance first: quick wins', snow, !avBest);
            $('#d-note').innerHTML = base.stuck || aval.stuck ? '' : `Paying an extra <strong>${rand(d.extra)}</strong>/month saves about <strong>${rand(base.interest - aval.interest)}</strong> in interest and makes you debt-free <strong>${base.month - aval.month} months</strong> sooner than paying only the minimums. In serious difficulty? Speak to an <a class="text-gold underline" href="https://www.ncr.org.za/" target="_blank" rel="noopener">NCR-registered debt counsellor</a>.`;
        };
        panel.oninput = calc;
        panel.onclick = (e) => {
            if (e.target.id === 'd-add') { const d = read(); d.debts.push(['New debt', 0, 20, 0]); store.set('debt', d); debt(); }
            const del = e.target.closest('[data-del]'); if (del) { const d = read(); d.debts.splice(+del.dataset.del, 1); store.set('debt', d); debt(); }
        };
        calc();
    }

    // ── Savings goal ────────────────────────────────────────────────────
    function goal() {
        const s = store.get('goal', { name: 'Emergency fund', target: 60000, saved: 5000, monthly: 2000, rate: 7.5, months: 24 });
        panel.innerHTML = head('Savings goal planner', 'How long will it take, or how much do you need to save each month to hit a goal by a date?') + `
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="sm:col-span-2">${field('g-name', 'Goal', s.name)}</div>
                    ${field('g-target', 'Target amount (R)', s.target)}${field('g-saved', 'Already saved (R)', s.saved)}
                    ${field('g-monthly', 'Monthly saving (R)', s.monthly)}${field('g-rate', 'Interest / return per year (%)', s.rate)}
                    <div class="sm:col-span-2">${field('g-months', 'Or reach it within (months)', s.months)}</div>
                </div>
                <div><div class="grid grid-cols-2 gap-3" id="g-stats"></div><p class="mt-4 text-sm text-gray-300" id="g-text"></p><div class="mt-4 h-48"><canvas id="g-chart" aria-label="Savings growth towards goal"></canvas></div></div>
            </div>`;
        const calc = () => {
            const d = { name: $('#g-name').value, target: num($('#g-target').value), saved: num($('#g-saved').value), monthly: num($('#g-monthly').value), rate: num($('#g-rate').value), months: Math.max(1, Math.round(num($('#g-months').value))) };
            store.set('goal', d);
            const r = d.rate / 1200;
            let bal = d.saved, m = 0; const path = [bal];
            while (bal < d.target && m < 600) { bal = bal * (1 + r) + d.monthly; m++; if (m <= 120) path.push(bal); }
            const g = Math.pow(1 + r, d.months);
            const need = r ? Math.max(0, (d.target - d.saved * g) * r / (g - 1)) : Math.max(0, (d.target - d.saved) / d.months);
            $('#g-stats').innerHTML = stat('Time to goal', m >= 600 ? 'Not reached' : `${Math.floor(m / 12)}y ${m % 12}m`) + stat(`Needed for ${d.months} months`, rand(need) + '/m', 'text-gold');
            $('#g-text').innerHTML = m >= 600 ? 'Increase your monthly saving to reach this goal.' : `Saving <strong>${rand(d.monthly)}</strong>/month, you'll reach <strong>${esc(d.name)}</strong> (${rand(d.target)}) around <strong>${monthName(m)}</strong>. Interest contributes about ${rand(Math.max(0, d.target - d.saved - d.monthly * m))}.`;
            drawChart($('#g-chart'), { type: 'line', data: { labels: path.map((_, i) => i), datasets: [
                { label: 'Saved', data: path, borderColor: '#FFD700', backgroundColor: 'rgba(255,215,0,.15)', fill: true, tension: .3, pointRadius: 0 },
                { label: 'Goal', data: path.map(() => d.target), borderColor: '#6b7280', borderDash: [5, 4], pointRadius: 0 } ] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { boxWidth: 10 } } }, scales: { x: { title: { display: true, text: 'Months' }, ticks: { maxTicksLimit: 8 }, grid: { display: false } }, y: { ticks: { callback: (v) => rand(v) }, grid: { color: 'rgba(255,255,255,.05)' } } } } });
        };
        panel.oninput = calc; panel.onclick = null; calc();
    }

    // ── Net worth ───────────────────────────────────────────────────────
    const NW_DEFAULT = { assets: [['Bank & emergency fund', 35000], ['TFSA / investments', 48000], ['Retirement fund', 120000], ['Car (market value)', 180000]], liabs: [['Car finance', 165000], ['Credit card', 12000]], history: [] };
    function networth() {
        const s = store.get('networth', NW_DEFAULT);
        const rows = (list, kind) => list.map(([n, v], i) => `
            <div class="grid grid-cols-[1fr_auto_auto] gap-2" data-${kind}="${i}">
                <input class="field !py-2 text-sm" data-k="n" value="${esc(n)}" aria-label="Name"><input class="field !py-2 !w-32 text-sm text-right" data-k="v" inputmode="decimal" value="${v}" aria-label="Value (R)">
                <button class="w-8 h-8 rounded-lg hover:bg-white/10 text-gray-500" data-del="${kind}:${i}" aria-label="Remove">✕</button></div>`).join('');
        panel.innerHTML = head('Net worth tracker', 'Everything you own minus everything you owe. Save a snapshot each month to watch your progress.') + `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><p class="font-semibold text-emerald-400 mb-2">Assets</p><div class="space-y-2" id="nw-a">${rows(s.assets, 'a')}</div><button class="btn-ghost !py-1.5 text-sm mt-2" data-add="a">+ Asset</button></div>
                <div><p class="font-semibold text-rose-400 mb-2">Liabilities</p><div class="space-y-2" id="nw-l">${rows(s.liabs, 'l')}</div><button class="btn-ghost !py-1.5 text-sm mt-2" data-add="l">+ Liability</button></div>
            </div>
            <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3" id="nw-stats"></div>
            <div class="mt-4 flex items-center gap-3"><button class="btn-gold !py-2 text-sm" id="nw-snap">📸 Save this month's snapshot</button><span class="text-xs text-gray-500">Stored only in this browser.</span></div>
            <div class="mt-4 h-48 ${s.history.length > 1 ? '' : 'hidden'}"><canvas id="nw-chart" aria-label="Net worth history"></canvas></div>`;
        const read = () => ({ assets: $$('[data-a]').map((r) => [$('[data-k=n]', r).value, num($('[data-k=v]', r).value)]), liabs: $$('[data-l]').map((r) => [$('[data-k=n]', r).value, num($('[data-k=v]', r).value)]), history: store.get('networth', NW_DEFAULT).history || [] });
        const calc = () => {
            const d = read(); store.set('networth', d);
            const a = d.assets.reduce((x, r) => x + r[1], 0), l = d.liabs.reduce((x, r) => x + r[1], 0);
            $('#nw-stats').innerHTML = stat('Assets', rand(a), 'text-emerald-400') + stat('Liabilities', rand(l), 'text-rose-400') + stat('Net worth', rand(a - l), a - l >= 0 ? 'text-gold' : 'text-rose-400');
            return { d, net: a - l };
        };
        const drawHistory = (h) => { if (h.length > 1) drawChart($('#nw-chart'), { type: 'line', data: { labels: h.map((x) => x.date), datasets: [{ label: 'Net worth', data: h.map((x) => x.net), borderColor: '#FFD700', tension: .3 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: (v) => rand(v) } } } } }); };
        panel.oninput = calc;
        panel.onclick = (e) => {
            const add = e.target.closest('[data-add]'), del = e.target.closest('[data-del]');
            if (add) { const d = read(); (add.dataset.add === 'a' ? d.assets : d.liabs).push(['New item', 0]); store.set('networth', d); networth(); }
            if (del) { const [k, i] = del.dataset.del.split(':'); const d = read(); (k === 'a' ? d.assets : d.liabs).splice(+i, 1); store.set('networth', d); networth(); }
            if (e.target.id === 'nw-snap') {
                const { d, net } = calc(); const date = new Date().toISOString().slice(0, 7);
                d.history = d.history.filter((x) => x.date !== date).concat({ date, net }).slice(-36);
                store.set('networth', d); toast(`Snapshot saved for ${date}`); networth();
            }
        };
        calc(); drawHistory(s.history || []);
    }

    // ── Investment growth ───────────────────────────────────────────────
    function invest() {
        const s = store.get('invest', { start: 10000, monthly: 1500, rate: 10, years: 20, raise: 5, inflation: 5 });
        panel.innerHTML = head('Investment growth', 'See compound growth with monthly contributions, yearly increases and the effect of inflation on what your money will really buy.') + `
            <div class="grid grid-cols-1 xl:grid-cols-[1fr_1.4fr] gap-6">
                <div class="grid grid-cols-2 gap-4">
                    ${field('i-start', 'Starting amount (R)', s.start)}${field('i-monthly', 'Monthly contribution (R)', s.monthly)}
                    ${field('i-rate', 'Expected return per year (%)', s.rate)}${field('i-years', 'Years', s.years)}
                    ${field('i-raise', 'Increase contributions yearly (%)', s.raise)}${field('i-infl', 'Inflation (%)', s.inflation)}
                    <p class="col-span-2 text-xs text-gray-500">Returns aren't guaranteed. Equities have historically beaten inflation over long periods, with ups and downs along the way. Tip: inside a TFSA, all of this growth is tax-free.</p>
                </div>
                <div><div class="grid grid-cols-3 gap-3" id="i-stats"></div><div class="mt-4 h-60"><canvas id="i-chart" aria-label="Investment growth by year"></canvas></div></div>
            </div>`;
        const calc = () => {
            const d = { start: num($('#i-start').value), monthly: num($('#i-monthly').value), rate: num($('#i-rate').value), years: Math.min(60, Math.max(1, Math.round(num($('#i-years').value)))), raise: num($('#i-raise').value), inflation: num($('#i-infl').value) };
            store.set('invest', d);
            const r = d.rate / 1200; let bal = d.start, contrib = d.start, pmt = d.monthly; const yearsBal = [], yearsContrib = [];
            for (let y = 1; y <= d.years; y++) { for (let m = 0; m < 12; m++) { bal = bal * (1 + r) + pmt; contrib += pmt; } yearsBal.push(bal); yearsContrib.push(contrib); pmt *= 1 + d.raise / 100; }
            const real = bal / Math.pow(1 + d.inflation / 100, d.years);
            $('#i-stats').innerHTML = stat('Future value', rand(bal), 'text-gold') + stat('You put in', rand(contrib)) + stat("In today's rand", rand(real));
            drawChart($('#i-chart'), { type: 'bar', data: { labels: yearsBal.map((_, i) => `Y${i + 1}`), datasets: [
                { label: 'Contributions', data: yearsContrib, backgroundColor: '#4b5563', stack: 's' },
                { label: 'Growth', data: yearsBal.map((b, i) => b - yearsContrib[i]), backgroundColor: '#FFD700', stack: 's' } ] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { boxWidth: 10 } }, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${rand(c.parsed.y)}` } } }, scales: { x: { stacked: true, grid: { display: false }, ticks: { maxTicksLimit: 10 } }, y: { stacked: true, ticks: { callback: (v) => rand(v) }, grid: { color: 'rgba(255,255,255,.05)' } } } } });
        };
        panel.oninput = calc; panel.onclick = null; calc();
    }

    // ── Loan & bond ─────────────────────────────────────────────────────
    function loan() {
        const s = store.get('loan', { amount: 1200000, rate: 10.75, years: 20, extra: 1000, income: 45000 });
        panel.innerHTML = head('Loan & bond calculator', 'Work out repayments, total interest and how much an extra monthly payment saves. Includes a quick bond affordability check.') + `
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-2">${field('l-amount', 'Loan amount (R)', s.amount)}</div>
                    ${field('l-rate', 'Interest rate (%)', s.rate)}${field('l-years', 'Term (years)', s.years)}
                    ${field('l-extra', 'Extra payment per month (R)', s.extra)}${field('l-income', 'Gross monthly income (R)', s.income)}
                    <p class="col-span-2 text-xs text-gray-500">Rates are usually quoted against prime (repo + 3.5%). Banks typically limit bond repayments to about 30% of gross monthly income.</p>
                </div>
                <div><div class="grid grid-cols-2 gap-3" id="l-stats"></div><p class="mt-4 text-sm text-gray-300" id="l-text"></p></div>
            </div>`;
        const calc = () => {
            const d = { amount: num($('#l-amount').value), rate: num($('#l-rate').value), years: Math.max(1, num($('#l-years').value)), extra: num($('#l-extra').value), income: num($('#l-income').value) };
            store.set('loan', d);
            const r = d.rate / 1200, n = Math.round(d.years * 12);
            const pmt = r ? d.amount * r / (1 - Math.pow(1 + r, -n)) : d.amount / n;
            let bal = d.amount, m = 0, int2 = 0;
            while (bal > 0.01 && m < n) { const i = bal * r; int2 += i; bal = bal + i - (pmt + d.extra); m++; }
            const total = pmt * n - d.amount;
            const maxPmt = d.income * 0.3;
            const maxLoan = r ? maxPmt * (1 - Math.pow(1 + r, -n)) / r : maxPmt * n;
            $('#l-stats').innerHTML = stat('Monthly repayment', rand(pmt), 'text-gold') + stat('Total interest', rand(total)) +
                stat('Paid off with extra', `${Math.floor(m / 12)}y ${m % 12}m`) + stat('Interest saved', rand(Math.max(0, total - int2)), 'text-emerald-400');
            $('#l-text').innerHTML = `On a gross income of <strong>${rand(d.income)}</strong>, a repayment of about <strong>${rand(maxPmt)}</strong> (30%) supports a loan of roughly <strong>${rand(maxLoan)}</strong> at this rate. ${pmt > maxPmt ? '<span class="text-rose-400">This loan is above that guideline.</span>' : '<span class="text-emerald-400">This loan is within that guideline.</span>'}`;
        };
        panel.oninput = calc; panel.onclick = null; calc();
    }

    // ── Property purchase costs ─────────────────────────────────────────
    // SARS transfer duty table for property acquired on/after 1 March 2024
    // (unchanged for 2025/26). Verify the current table on sars.gov.za.
    const TRANSFER_DUTY = [[1210000, 0, 0], [1663800, 0, 0.03], [2329300, 13614, 0.06], [2994800, 53544, 0.08], [13310000, 106784, 0.11], [Infinity, 1241456, 0.13]];
    function transferDuty(price) {
        let lower = 0;
        for (const [upper, base, rate] of TRANSFER_DUTY) { if (price <= upper) return base + (price - lower) * rate; lower = upper; }
        return 0;
    }
    function attorneyEstimate(v) { return v <= 0 ? 0 : v <= 500000 ? 18000 : v <= 1000000 ? 25000 : v <= 2000000 ? 35000 : v <= 3000000 ? 45000 : 55000 + (v - 3000000) * 0.004; }
    function property() {
        const s = store.get('property', { price: 1500000, deposit: 150000 });
        panel.innerHTML = head('Property purchase costs', 'Budget for the cash costs on top of your deposit: SARS transfer duty plus transfer and bond attorney fees.') + `
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 self-start">${field('p-price', 'Purchase price (R)', s.price)}${field('p-deposit', 'Deposit (R)', s.deposit)}
                    <p class="sm:col-span-2 text-xs text-gray-500">Transfer duty uses the SARS table effective 1 March 2024 (no duty up to R1,210,000). Attorney and Deeds Office fees are rough estimates including VAT. Get a quote from a conveyancer.</p></div>
                <div><div class="grid grid-cols-2 gap-3" id="p-stats"></div><div class="mt-4 card !bg-white/5 p-4 text-sm space-y-2" id="p-lines"></div></div>
            </div>`;
        const calc = () => {
            const d = { price: num($('#p-price').value), deposit: num($('#p-deposit').value) }; store.set('property', d);
            const duty = transferDuty(d.price), bond = Math.max(0, d.price - d.deposit), tFees = attorneyEstimate(d.price), bFees = attorneyEstimate(bond);
            const cash = duty + tFees + bFees;
            $('#p-stats').innerHTML = stat('Cash needed upfront', rand(cash + d.deposit), 'text-gold') + stat('Bond amount', rand(bond));
            $('#p-lines').innerHTML = [['Deposit', d.deposit], ['Transfer duty (SARS)', duty], ['Transfer attorney fees (est.)', tFees], ['Bond registration fees (est.)', bFees]]
                .map(([k, v]) => `<div class="flex justify-between"><span class="text-gray-400">${k}</span><span class="tabular-nums">${rand(v)}</span></div>`).join('') +
                `<div class="flex justify-between border-t border-white/10 pt-2 font-semibold"><span>Total cash</span><span class="tabular-nums text-gold">${rand(cash + d.deposit)}</span></div>`;
        };
        panel.oninput = calc; panel.onclick = null; calc();
    }

    // ── Currency converter ──────────────────────────────────────────────
    let rates = null, ratesDate = '';
    async function getRates() {
        if (rates) return rates;
        for (const url of ['https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/zar.json', 'https://latest.currency-api.pages.dev/v1/currencies/zar.json']) {
            try { const r = await fetch(url); if (r.ok) { const j = await r.json(); rates = j.zar; ratesDate = j.date; return rates; } } catch (e) { /* try next */ }
        }
        throw new Error('rates unavailable');
    }
    function currency() {
        const CODES = [['zar', 'South African rand'], ['usd', 'US dollar'], ['eur', 'Euro'], ['gbp', 'British pound'], ['bwp', 'Botswana pula'], ['nad', 'Namibian dollar'], ['ngn', 'Nigerian naira'], ['kes', 'Kenyan shilling'], ['cny', 'Chinese yuan'], ['jpy', 'Japanese yen'], ['aud', 'Australian dollar'], ['cad', 'Canadian dollar'], ['chf', 'Swiss franc'], ['aed', 'UAE dirham'], ['inr', 'Indian rupee'], ['btc', 'Bitcoin'], ['eth', 'Ether']];
        const opts = (sel) => CODES.map(([c, n]) => `<option value="${c}"${c === sel ? ' selected' : ''}>${c.toUpperCase()} · ${n}</option>`).join('');
        const s = store.get('fx', { amount: 1000, from: 'usd', to: 'zar' });
        panel.innerHTML = head('Currency converter', 'Live reference exchange rates, handy for travel, online shopping and offshore investing.') + `
            <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end max-w-3xl">
                <div>${field('fx-amount', 'Amount', s.amount)}<select id="fx-from" class="field mt-2" aria-label="From currency">${opts(s.from)}</select></div>
                <button id="fx-swap" class="btn-ghost !px-3 !py-3 justify-self-center" aria-label="Swap currencies">⇄</button>
                <div><span class="label">Converted</span><div class="field !bg-white/5 text-xl font-bold text-gold tabular-nums" id="fx-out">…</div><select id="fx-to" class="field mt-2" aria-label="To currency">${opts(s.to)}</select></div>
            </div>
            <p class="mt-4 text-sm text-gray-400" id="fx-rate"></p>
            <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3" id="fx-board"></div>`;
        const calc = async () => {
            const d = { amount: num($('#fx-amount').value), from: $('#fx-from').value, to: $('#fx-to').value }; store.set('fx', d);
            try {
                const z = await getRates();
                const rate = z[d.to] / z[d.from];
                $('#fx-out').textContent = (d.amount * rate).toLocaleString('en-ZA', { maximumFractionDigits: rate < 0.001 ? 8 : 2 }) + ' ' + d.to.toUpperCase();
                $('#fx-rate').textContent = `1 ${d.from.toUpperCase()} = ${rate.toLocaleString('en-ZA', { maximumFractionDigits: rate < 0.01 ? 8 : 4 })} ${d.to.toUpperCase()} · reference rates for ${ratesDate}`;
                $('#fx-board').innerHTML = ['usd', 'eur', 'gbp', 'btc'].map((c) => stat(`1 ${c.toUpperCase()}`, rand(1 / z[c], c === 'btc' ? 0 : 2))).join('');
            } catch (e) { $('#fx-out').textContent = '–'; $('#fx-rate').textContent = 'Live rates are unavailable right now. Please try again later.'; }
        };
        panel.oninput = calc; panel.onchange = calc;
        panel.onclick = (e) => { if (e.target.closest('#fx-swap')) { const f = $('#fx-from').value; $('#fx-from').value = $('#fx-to').value; $('#fx-to').value = f; calc(); } };
        calc();
    }

    // ── Tabs ────────────────────────────────────────────────────────────
    const TOOLS = [
        ['budget', '🧾', 'Budget planner', budget], ['debt', '⛓️', 'Debt payoff', debt], ['goal', '🎯', 'Savings goal', goal], ['networth', '📊', 'Net worth', networth],
        ['invest', '📈', 'Investment growth', invest], ['loan', '🏦', 'Loan & bond', loan], ['property', '🏠', 'Property costs', property], ['currency', '💱', 'Currency', currency],
    ];
    const tabs = $('#tool-tabs');
    tabs.innerHTML = TOOLS.map(([id, icon, label]) => `<a href="#${id}" class="tab lg:w-full" role="tab" data-tool="${id}" aria-selected="false"><span aria-hidden="true">${icon}</span>${label}</a>`).join('');
    function open(id) {
        const t = TOOLS.find((x) => x[0] === id) || TOOLS[0];
        $$('[data-tool]', tabs).forEach((a) => a.setAttribute('aria-selected', a.dataset.tool === t[0]));
        panel.oninput = null; panel.onchange = null; panel.onclick = null;
        if (chart) { chart.destroy(); chart = null; }
        t[3]();
        tabs.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
    window.addEventListener('hashchange', () => open(location.hash.slice(1)));
    open(location.hash.slice(1) || 'budget');
})();
