document.addEventListener('DOMContentLoaded', () => {
    // Hamburger Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', navLinks.classList.contains('active'));
    });

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            target.scrollIntoView({ behavior: 'smooth' });
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Back to Top Button
    const backToTop = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Dictionary Search Functionality
    function searchTerms() {
        const searchTerm = document.getElementById('searchTerm').value.toLowerCase();
        const termCards = document.querySelectorAll('.definition-item');
        
        termCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const content = Array.from(card.querySelectorAll('p')).map(p => p.textContent.toLowerCase()).join(' ');
            
            if (title.includes(searchTerm) || content.includes(searchTerm) || searchTerm === '') {
                card.style.display = 'block';
                card.closest('.group-section').style.display = 'block';
            } else {
                card.style.display = 'none';
                const group = card.closest('.group-section');
                const visibleCards = group.querySelectorAll('.definition-item[style="display: block;"]');
                group.style.display = visibleCards.length > 0 ? 'block' : 'none';
            }
        });
    }

    document.getElementById('searchTerm').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchTerms();
        }
    });

    document.getElementById('searchTerm').addEventListener('input', searchTerms);

    // Lightbox Functionality
    window.openLightbox = function(src, caption) {
        const lightbox = document.getElementById('lightbox');
        const lightboxImage = document.getElementById('lightbox-image');
        const lightboxCaption = document.getElementById('lightbox-caption');
        
        lightboxImage.src = src;
        lightboxCaption.textContent = caption;
        lightbox.classList.remove('hidden');
    };

    window.closeLightbox = function() {
        const lightbox = document.getElementById('lightbox');
        lightbox.classList.add('hidden');
        document.getElementById('lightbox-image').src = '';
        document.getElementById('lightbox-caption').textContent = '';
    };

    // Currency Converter Functionality
    let currencies = {};
    let rates = {};
    let lastUpdate = null;

    async function loadCurrencies() {
        try {
            const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json');
            if (!response.ok) throw new Error('Failed to fetch currencies');
            currencies = await response.json();
            
            const fromSelect = document.getElementById('fromCurrency');
            const toSelect = document.getElementById('toCurrency');
            fromSelect.innerHTML = '<option value="">Select Currency</option>';
            toSelect.innerHTML = '<option value="">Select Currency</option>';
            
            Object.entries(currencies).forEach(([code, name]) => {
                const option1 = new Option(name, code);
                const option2 = new Option(name, code);
                fromSelect.add(option1);
                toSelect.add(option2);
            });
            
            fromSelect.value = 'usd';
            toSelect.value = 'zar';
            await loadRates('usd');
        } catch (error) {
            console.error('Error loading currencies:', error);
            alert('Failed to load currencies. Please refresh the page.');
        }
    }

    async function loadRates(base = 'usd') {
        try {
            const response = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base}.json`);
            if (!response.ok) {
                const fallbackResponse = await fetch(`https://latest.currency-api.pages.dev/v1/currencies/${base}.json`);
                if (!fallbackResponse.ok) throw new Error('Both API endpoints failed');
                rates = await fallbackResponse.json();
            } else {
                rates = await response.json();
            }
            lastUpdate = new Date().toLocaleString();
            document.getElementById('lastUpdated').textContent = `Last updated: ${lastUpdate}`;
            
            if (document.getElementById('amount').value) {
                convertCurrency();
            }
        } catch (error) {
            console.error('Error loading rates:', error);
            document.getElementById('conversionResult').textContent = 'Error fetching rates. Please try again.';
            document.getElementById('conversionResult').classList.remove('hidden');
        }
    }

    window.convertCurrency = async function() {
        const from = document.getElementById('fromCurrency').value;
        const to = document.getElementById('toCurrency').value;
        const amount = parseFloat(document.getElementById('amount').value) || 0;
        
        if (!from || !to || amount <= 0) {
            alert('Please select currencies and enter a valid amount.');
            return;
        }
        
        if (from === to) {
            document.getElementById('conversionResult').innerHTML = `<span class="text-green-400">${amount.toFixed(2)} ${from.toUpperCase()} = ${amount.toFixed(2)} ${to.toUpperCase()}</span>`;
            document.getElementById('conversionResult').classList.remove('hidden');
            return;
        }
        
        if (!rates[from]) {
            await loadRates(from);
        }
        
        const rate = parseFloat(rates[from][to]);
        if (isNaN(rate)) {
            document.getElementById('conversionResult').textContent = 'Conversion rate not available.';
            document.getElementById('conversionResult').classList.remove('hidden');
            return;
        }
        
        const converted = amount * rate;
        document.getElementById('conversionResult').innerHTML = `<span class="text-green-400">${amount.toFixed(2)} ${from.toUpperCase()} = ${converted.toFixed(2)} ${to.toUpperCase()} (Rate: 1 ${from.toUpperCase()} = ${rate.toFixed(4)} ${to.toUpperCase()})</span>`;
        document.getElementById('conversionResult').classList.remove('hidden');
    };

    document.getElementById('fromCurrency').addEventListener('change', function() {
        const base = this.value;
        if (base) loadRates(base);
    });

    // Investment Calculator
    window.calculateInvestment = function() {
        const principal = parseFloat(document.getElementById('investPrincipal').value) || 0;
        const rate = parseFloat(document.getElementById('investRate').value) / 100 || 0;
        const term = parseFloat(document.getElementById('investTerm').value) || 0;
        const compoundFreq = parseInt(document.getElementById('investCompound').value) || 1;
        
        if (principal <= 0 || rate <= 0 || term <= 0) {
            alert('Please enter valid principal, interest rate, and term.');
            return;
        }
        
        const futureValue = principal * Math.pow(1 + rate / compoundFreq, compoundFreq * term);
        const interestEarned = futureValue - principal;
        
        document.getElementById('investResult').innerHTML = `
            <p>Future Value: <span class="text-green-400">R${futureValue.toFixed(2)}</span></p>
            <p>Interest Earned: <span class="text-green-400">R${interestEarned.toFixed(2)}</span></p>
        `;
        document.getElementById('investResult').classList.remove('hidden');
    };

    // Loan Calculator
    window.calculateLoan = function() {
        const amount = parseFloat(document.getElementById('loanAmount').value) || 0;
        const rate = parseFloat(document.getElementById('loanRate').value) / 100 / 12 || 0;
        const term = parseFloat(document.getElementById('loanTerm').value) * 12 || 0;
        
        if (amount <= 0 || rate <= 0 || term <= 0) {
            alert('Please enter valid loan amount, interest rate, and term.');
            return;
        }
        
        const monthlyPayment = amount * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
        const totalPaid = monthlyPayment * term;
        const totalInterest = totalPaid - amount;
        
        document.getElementById('loanResult').innerHTML = `
            <p>Monthly Payment: <span class="text-green-400">R${monthlyPayment.toFixed(2)}</span></p>
            <p>Total Interest: <span class="text-green-400">R${totalInterest.toFixed(2)}</span></p>
            <p>Total Paid: <span class="text-green-400">R${totalPaid.toFixed(2)}</span></p>
        `;
        document.getElementById('loanResult').classList.remove('hidden');
    };

    // Property Purchase Costs Calculator
    window.calculatePropertyCosts = function() {
        const price = parseFloat(document.getElementById('propertyPrice').value) || 0;
        
        if (price <= 0) {
            alert('Please enter a valid property price.');
            return;
        }
        
        // Transfer Duty (based on SARS rates as of 2025)
        let transferDuty = 0;
        if (price > 1000000) {
            transferDuty = (price - 1000000) * 0.03 + 36000;
        } else if (price > 750000) {
            transferDuty = (price - 750000) * 0.03;
        }
        
        // Conveyancing Fees (approximate, based on standard SA rates)
        const conveyancingFees = price <= 500000 ? 15000 :
                                price <= 1000000 ? 20000 :
                                price <= 2000000 ? 25000 : 30000;
        
        // Bond Registration Fees (approximate, assuming 80% loan)
        const bondAmount = price * 0.8;
        const bondFees = bondAmount <= 500000 ? 15000 :
                         bondAmount <= 1000000 ? 20000 :
                         bondAmount <= 2000000 ? 25000 : 30000;
        
        const totalCosts = transferDuty + conveyancingFees + bondFees;
        
        document.getElementById('propertyResult').innerHTML = `
            <p>Transfer Duty: <span class="text-green-400">R${transferDuty.toFixed(2)}</span></p>
            <p>Conveyancing Fees: <span class="text-green-400">R${conveyancingFees.toFixed(2)}</span></p>
            <p>Bond Registration Fees: <span class="text-green-400">R${bondFees.toFixed(2)}</span></p>
            <p>Total Costs: <span class="text-green-400">R${totalCosts.toFixed(2)}</span></p>
        `;
        document.getElementById('propertyResult').classList.remove('hidden');
    };

    // Stock Market Game Functionality
let balance = 10000;
let day = 1;
let portfolio = {};
let selectedStock = null;
let stockPrices = {
    TechCorp: [100.00],
    GreenEnergy: [80.00],
    HealthInc: [120.00],
    AutoDrive: [150.00],
    FoodChain: [90.00]
};
let events = [];
let achievements = [];
const maxDays = 20;

const ctx = document.createElement('canvas');
ctx.setAttribute('aria-label', 'Stock price chart');
document.getElementById('stock-chart').appendChild(ctx);
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Day 1'],
        datasets: [
            { label: 'TechCorp', data: [100], borderColor: '#FFD700', fill: false },
            { label: 'GreenEnergy', data: [80], borderColor: '#38a169', fill: false },
            { label: 'HealthInc', data: [120], borderColor: '#ecc94b', fill: false },
            { label: 'AutoDrive', data: [150], borderColor: '#ed64a6', fill: false },
            { label: 'FoodChain', data: [90], borderColor: '#4299e1', fill: false }
        ]
    },
    options: {
        scales: {
            y: { beginAtZero: false, suggestedMin: 0, title: { display: true, text: 'Stock Price ($)' } },
            x: { title: { display: true, text: 'Day' } }
        }
    }
});

function calculatePortfolioValue() {
    let value = 0;
    for (const stock in portfolio) {
        value += portfolio[stock] * (stockPrices[stock][day - 1] || 0);
    }
    return value;
}

function updateUI() {
    document.getElementById('balance').textContent = balance.toFixed(2);
    document.getElementById('portfolio').textContent = calculatePortfolioValue().toFixed(2);
    document.getElementById('net-worth').textContent = (balance + calculatePortfolioValue()).toFixed(2);
    document.getElementById('day').textContent = day;
    
    const portfolioList = document.getElementById('portfolio-list');
    portfolioList.innerHTML = '';
    for (const stock in portfolio) {
        const li = document.createElement('li');
        li.textContent = `${stock}: ${portfolio[stock]} shares (Value: $${(portfolio[stock] * (stockPrices[stock][day - 1] || 0)).toFixed(2)})`;
        portfolioList.appendChild(li);
    }
    
    for (const stock in stockPrices) {
        document.getElementById(`price-${stock}`).textContent = (stockPrices[stock][day - 1] || 0).toFixed(2);
    }
}

function applyRandomEvent() {
    const eventTypes = [
        { stock: 'TechCorp', text: 'TechCorp announces new AI product!', change: 1.2 },
        { stock: 'TechCorp', text: 'TechCorp faces regulatory scrutiny.', change: 0.8 },
        { stock: 'GreenEnergy', text: 'GreenEnergy wins renewable energy contract!', change: 1.25 },
        { stock: 'GreenEnergy', text: 'GreenEnergy supply chain issues reported.', change: 0.75 },
        { stock: 'HealthInc', text: 'HealthInc releases breakthrough drug!', change: 1.3 },
        { stock: 'HealthInc', text: 'HealthInc recalls product.', change: 0.7 },
        { stock: 'AutoDrive', text: 'AutoDrive unveils self-driving tech!', change: 1.2 },
        { stock: 'AutoDrive', text: 'AutoDrive hit by production delays.', change: 0.8 },
        { stock: 'FoodChain', text: 'FoodChain expands globally!', change: 1.15 },
        { stock: 'FoodChain', text: 'FoodChain faces health safety concerns.', change: 0.85 }
    ];
    const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    events.push(`Day ${day}: ${randomEvent.text}`);
    stockPrices[randomEvent.stock][day - 1] = (stockPrices[randomEvent.stock][day - 2] || stockPrices[randomEvent.stock][0]) * randomEvent.change;
    
    const eventsList = document.getElementById('events-list');
    eventsList.innerHTML = '';
    events.slice(-3).forEach(event => {
        const li = document.createElement('li');
        li.textContent = event;
        eventsList.appendChild(li);
    });
}

function checkAchievements() {
    const netWorth = balance + calculatePortfolioValue();
    if (netWorth >= 15000 && !achievements.includes('Profitable Trader')) {
        achievements.push('Profitable Trader');
        alert('Achievement Unlocked: Profitable Trader - Net Worth reached $15,000!');
    }
    if (Object.keys(portfolio).length >= 3 && !achievements.includes('Diversified Investor')) {
        achievements.push('Diversified Investor');
        alert('Achievement Unlocked: Diversified Investor - Own shares in 3 different companies!');
    }
    
    const achievementsList = document.getElementById('achievements-list');
    achievementsList.innerHTML = '';
    achievements.forEach(achievement => {
        const li = document.createElement('li');
        li.textContent = achievement;
        achievementsList.appendChild(li);
    });
}

window.selectStock = function(stock) {
    selectedStock = stock;
    document.getElementById('trade-controls').style.display = 'block';
    document.getElementById('selected-stock').textContent = stock;
    document.getElementById('current-price').textContent = (stockPrices[stock][day - 1] || 0).toFixed(2);
};

window.buyStock = function() {
    const quantity = parseInt(document.getElementById('quantity').value);
    if (!quantity || quantity <= 0) {
        alert('Please enter a valid quantity');
        return;
    }
    const price = stockPrices[selectedStock][day - 1];
    if (!price || isNaN(price)) {
        document.getElementById('result').textContent = 'Error: Invalid stock price!';
        return;
    }
    const cost = quantity * price;
    if (cost > balance) {
        document.getElementById('result').textContent = 'Insufficient funds!';
        return;
    }
    balance -= cost;
    portfolio[selectedStock] = (portfolio[selectedStock] || 0) + quantity;
    updateUI();
    document.getElementById('result').textContent = `Bought ${quantity} shares of ${selectedStock}!`;
    checkAchievements();
};

window.sellStock = function() {
    const quantity = parseInt(document.getElementById('quantity').value);
    if (!quantity || quantity <= 0 || !portfolio[selectedStock] || quantity > portfolio[selectedStock]) {
        alert('Invalid quantity or insufficient shares');
        return;
    }
    const price = stockPrices[selectedStock][day - 1];
    if (!price || isNaN(price)) {
        document.getElementById('result').textContent = 'Error: Invalid stock price!';
        return;
    }
    balance += quantity * price;
    portfolio[selectedStock] -= quantity;
    if (portfolio[selectedStock] === 0) delete portfolio[selectedStock];
    updateUI();
    document.getElementById('result').textContent = `Sold ${quantity} shares of ${selectedStock}!`;
    checkAchievements();
};

window.resetGame = function() {
    // Reset game state
    balance = 10000;
    day = 1;
    portfolio = {};
    selectedStock = null;
    stockPrices = {
        TechCorp: [100.00],
        GreenEnergy: [80.00],
        HealthInc: [120.00],
        AutoDrive: [150.00],
        FoodChain: [90.00]
    };
    events = [];
    achievements = [];
    
    // Reset chart
    chart.data.labels = ['Day 1'];
    chart.data.datasets.forEach((dataset, index) => {
        const stock = Object.keys(stockPrices)[index];
        dataset.data = [stockPrices[stock][0]];
    });
    chart.update();
    
    // Reset UI
    document.getElementById('game-container').innerHTML = `
        <div class="flex flex-col lg:flex-row gap-8">
            <div class="w-full lg:w-1/2 space-y-6">
                <div>
                    <h3 class="text-xl font-semibold text-gold mb-4">Portfolio</h3>
                    <p>Balance: $<span id="balance">10000.00</span></p>
                    <p>Portfolio Value: $<span id="portfolio">0.00</span></p>
                    <p>Net Worth: $<span id="net-worth">10000.00</span></p>
                    <p>Day: <span id="day">1</span></p>
                    <ul id="portfolio-list" class="text-gray-300 text-sm mt-4 space-y-2"></ul>
                </div>
                <div>
                    <h3 class="text-xl font-semibold text-gold mb-4">Trade</h3>
                    <div id="trade-controls" class="hidden space-y-4">
                        <p>Selected Stock: <span id="selected-stock"></span></p>
                        <p>Current Price: $<span id="current-price">0.00</span></p>
                        <input type="number" id="quantity" placeholder="Quantity" min="1" class="w-full bg-gray-900 border border-gold/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-gold focus:outline-none">
                        <div class="flex gap-4">
                            <button onclick="buyStock()" class="flex-1 btn bg-gold text-black px-6 py-2 rounded-lg font-semibold hover:bg-dark-gold transition-colors">Buy</button>
                            <button onclick="sellStock()" class="flex-1 btn bg-gold text-black px-6 py-2 rounded-lg font-semibold hover:bg-dark-gold transition-colors">Sell</button>
                        </div>
                    </div>
                    <p id="result" class="text-gray-300 mt-4"></p>
                </div>
            </div>
            <div class="w-full lg:w-1/2 space-y-6">
                <div>
                    <h3 class="text-xl font-semibold text-gold mb-4">Market</h3>
                    <ul class="text-gray-300 text-sm space-y-3">
                        <li class="flex items-center gap-3">
                            <button onclick="selectStock('TechCorp')" class="text-gold hover:text-white font-medium py-1 px-3 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors">TechCorp</button>
                            <span>$<span id="price-TechCorp">100.00</span></span>
                        </li>
                        <li class="flex items-center gap-3">
                            <button onclick="selectStock('GreenEnergy')" class="text-gold hover:text-white font-medium py-1 px-3 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors">GreenEnergy</button>
                            <span>$<span id="price-GreenEnergy">80.00</span></span>
                        </li>
                        <li class="flex items-center gap-3">
                            <button onclick="selectStock('HealthInc')" class="text-gold hover:text-white font-medium py-1 px-3 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors">HealthInc</button>
                            <span>$<span id="price-HealthInc">120.00</span></span>
                        </li>
                        <li class="flex items-center gap-3">
                            <button onclick="selectStock('AutoDrive')" class="text-gold hover:text-white font-medium py-1 px-3 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors">AutoDrive</button>
                            <span>$<span id="price-AutoDrive">150.00</span></span>
                        </li>
                        <li class="flex items-center gap-3">
                            <button onclick="selectStock('FoodChain')" class="text-gold hover:text-white font-medium py-1 px-3 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors">FoodChain</button>
                            <span>$<span id="price-FoodChain">90.00</span></span>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-xl font-semibold text-gold mb-4">Stock Chart</h3>
                    <div id="stock-chart" class="relative h-64 w-full"></div>
                </div>
                <div>
                    <h3 class="text-xl font-semibold text-gold mb-4">Events</h3>
                    <ul id="events-list" class="text-gray-300 text-sm space-y-2"></ul>
                </div>
                <div>
                    <h3 class="text-xl font-semibold text-gold mb-4">Achievements</h3>
                    <ul id="achievements-list" class="text-gray-300 text-sm space-y-2"></ul>
                </div>
            </div>
        </div>
        <div class="mt-6 flex justify-center gap-4">
            <button id="next-day" onclick="nextDay()" class="btn bg-gold text-black px-6 py-3 rounded-lg font-semibold hover:bg-dark-gold transition-colors">Next Day</button>
            <button id="reset-game" onclick="resetGame()" class="btn bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors">Reset/New Game</button>
        </div>
    `;
    // Re-append chart canvas
    document.getElementById('stock-chart').appendChild(ctx);
    updateUI();
};

window.nextDay = function() {
    if (day >= maxDays) {
        const finalValue = balance + calculatePortfolioValue();
        document.getElementById('game-container').innerHTML = `<h3 class="text-xl font-semibold text-gold">Game Over! Final Net Worth: $${finalValue.toFixed(2)}</h3><p class="text-gray-300">Share your score!</p><div class="mt-6 text-center"><button id="reset-game" onclick="resetGame()" class="btn bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors">Play Again</button></div>`;
        document.getElementById('next-day').style.display = 'none';
        return;
    }
    day++;
    applyRandomEvent();
    for (const stock in stockPrices) {
        if (stockPrices[stock][day - 1] === undefined) {
            const lastPrice = stockPrices[stock][day - 2] || stockPrices[stock][0];
            const volatility = 0.05;
            const change = Math.random() * volatility * 2 - volatility;
            stockPrices[stock].push(lastPrice * (1 + change));
        }
    }
    
    chart.data.labels.push(`Day ${day}`);
    chart.data.datasets.forEach((dataset, index) => {
        const stock = Object.keys(stockPrices)[index];
        dataset.data.push(stockPrices[stock][day - 1]);
    });
    chart.update();
    updateUI();
};

    // Initialize
    loadCurrencies();
    updateUI();
});