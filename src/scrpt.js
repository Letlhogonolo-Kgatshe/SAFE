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
            const content = card.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || content.includes(searchTerm) || searchTerm === '') {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
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
        // Clear image source to prevent memory issues
        document.getElementById('lightbox-image').src = '';
        document.getElementById('lightbox-caption').textContent = '';
    };

    // Stock Market Game Functionality (unchanged from previous version)
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

    window.nextDay = function() {
        if (day >= maxDays) {
            const finalValue = balance + calculatePortfolioValue();
            document.getElementById('game-container').innerHTML = `<h3 class="text-xl font-semibold text-gold">Game Over! Final Net Worth: $${finalValue.toFixed(2)}</h3><p class="text-gray-300">Share your score!</p>`;
            document.getElementById('next-day').style.display = 'none';
            return;
        }
        day++;
        applyRandomEvent();
        for (const stock in stockPrices) {
            const lastPrice = stockPrices[stock][day - 2] || stockPrices[stock][0];
            const change = (Math.random() - 0.5) * 30;
            const newPrice = Math.max(10, lastPrice + change);
            stockPrices[stock].push(newPrice);
            const priceSpan = document.getElementById(`price-${stock}`);
            priceSpan.textContent = newPrice.toFixed(2);
            priceSpan.classList.remove('price-up', 'price-down');
            if (newPrice > lastPrice) {
                priceSpan.classList.add('price-up');
            } else if (newPrice < lastPrice) {
                priceSpan.classList.add('price-down');
            }
        }
        chart.data.labels.push(`Day ${day}`);
        chart.data.datasets.forEach((dataset, index) => {
            const stock = Object.keys(stockPrices)[index];
            dataset.data.push(stockPrices[stock][day - 1]);
        });
        chart.update();
        updateUI();
        checkAchievements();
    };

    function applyRandomEvent() {
        const eventChance = Math.random();
        if (eventChance < 0.3) {
            const eventTypes = [
                { name: 'Market Boom', effect: 1.15, desc: 'Bull market! All stocks up 15%.' },
                { name: 'Market Crash', effect: 0.85, desc: 'Bear market! All stocks down 15%.' },
                { name: 'Tech Breakthrough', effect: 1.2, stock: 'TechCorp', desc: 'TechCorp surges due to innovation!' },
                { name: 'Energy Crisis', effect: 0.8, stock: 'GreenEnergy', desc: 'GreenEnergy dips from policy changes.' },
                { name: 'Health Scandal', effect: 0.9, stock: 'HealthInc', desc: 'HealthInc affected by news.' },
                { name: 'Auto Recall', effect: 0.85, stock: 'AutoDrive', desc: 'AutoDrive faces recall issues.' },
                { name: 'Food Boom', effect: 1.1, stock: 'FoodChain', desc: 'FoodChain benefits from demand spike.' }
            ];
            const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            if (event.stock) {
                const currentPrice = stockPrices[event.stock][day - 1] || stockPrices[event.stock][0];
                stockPrices[event.stock][day - 1] = Math.max(10, currentPrice * event.effect);
            } else {
                for (const stock in stockPrices) {
                    const currentPrice = stockPrices[stock][day - 1] || stockPrices[stock][0];
                    stockPrices[stock][day - 1] = Math.max(10, currentPrice * event.effect);
                }
            }
            events.push(`${event.name}: ${event.desc}`);
            updateEvents();
        }
    }

    function updateEvents() {
        const list = document.getElementById('events-list');
        list.innerHTML = '';
        events.slice(-5).forEach(ev => {
            const li = document.createElement('li');
            li.textContent = ev;
            list.appendChild(li);
        });
    }

    function checkAchievements() {
        const netWorth = balance + calculatePortfolioValue();
        if (netWorth > 15000 && !achievements.includes('Novice Investor')) {
            achievements.push('Novice Investor');
        }
        if (netWorth > 25000 && !achievements.includes('Market Maven')) {
            achievements.push('Market Maven');
        }
        if (Object.keys(portfolio).length >= 4 && !achievements.includes('Diversified Portfolio')) {
            achievements.push('Diversified Portfolio');
        }
        if (day > 10 && netWorth > 20000 && !achievements.includes('Long-Term Player')) {
            achievements.push('Long-Term Player');
        }
        updateAchievements();
    }

    function updateAchievements() {
        const list = document.getElementById('achievements-list');
        list.innerHTML = '';
        achievements.forEach(ach => {
            const li = document.createElement('li');
            li.textContent = ach;
            list.appendChild(li);
        });
    }

    function calculatePortfolioValue() {
        let value = 0;
        for (const stock in portfolio) {
            const price = stockPrices[stock][day - 1] || stockPrices[stock][0];
            if (!isNaN(price)) {
                value += portfolio[stock] * price;
            }
        }
        return value;
    }

    function updateUI() {
        document.getElementById('balance').textContent = balance.toFixed(2);
        document.getElementById('day').textContent = day;
        const portfolioValue = calculatePortfolioValue();
        document.getElementById('portfolio').textContent = portfolioValue.toFixed(2);
        document.getElementById('net-worth').textContent = (balance + portfolioValue).toFixed(2);
        if (selectedStock) {
            const price = stockPrices[selectedStock][day - 1] || stockPrices[selectedStock][0];
            document.getElementById('current-price').textContent = (price || 0).toFixed(2);
        }
        const portList = document.getElementById('portfolio-list');
        portList.innerHTML = '';
        for (const stock in portfolio) {
            const price = stockPrices[stock][day - 1] || stockPrices[stock][0];
            if (!isNaN(price)) {
                const li = document.createElement('li');
                li.textContent = `${stock}: ${portfolio[stock]} shares @ $${price.toFixed(2)}`;
                portList.appendChild(li);
            }
        }
    }

    // Initialize UI and achievements
    updateUI();
    updateAchievements();
});