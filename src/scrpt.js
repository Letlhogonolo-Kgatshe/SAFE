document.addEventListener('DOMContentLoaded', () => {
    // Hamburger Menu Toggle (mobile menu is a separate panel; the desktop nav is hidden below lg)
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const moreMenu = document.getElementById('more-menu');

    function setMobileMenu(open) {
        mobileMenu.classList.toggle('hidden', !open);
        hamburger.setAttribute('aria-expanded', open);
        hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        hamburger.textContent = open ? '✕' : '☰';
    }

    hamburger.addEventListener('click', () => {
        setMobileMenu(mobileMenu.classList.contains('hidden'));
    });

    // Close the desktop "More" dropdown when clicking outside it
    document.addEventListener('click', (e) => {
        if (moreMenu && moreMenu.open && !moreMenu.contains(e.target)) moreMenu.open = false;
    });

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
            setMobileMenu(false);
            if (moreMenu) moreMenu.open = false;
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

    // Initialize
    loadCurrencies();
});