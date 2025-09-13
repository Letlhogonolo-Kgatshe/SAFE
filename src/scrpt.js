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

    // Quiz Functionality
    const quizButtons = document.querySelectorAll('.quiz-btn');
    const quizResult = document.getElementById('quiz-result');
    quizButtons.forEach(button => {
        button.addEventListener('click', () => {
            const answer = button.getAttribute('data-answer');
            if (answer === 'True') {
                quizResult.textContent = 'Correct! Budgeting helps manage income and expenses effectively.';
                quizResult.style.color = '#0dcff1';
            } else {
                quizResult.textContent = 'Incorrect. Budgeting is key to managing your finances. Try again!';
                quizResult.style.color = '#ff5555';
            }
        });
    });

    // Money Personality Quiz Logic
    const quizForm = document.getElementById('money-personality-quiz');
    const resultElement = document.getElementById('money-personality-result');

    if (quizForm && resultElement) {
        quizForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(quizForm);
            let score = 0;

            // Scoring logic: Assign points based on answers
            const budgetingAnswer = formData.get('budgeting');
            if (budgetingAnswer === 'strict') {
                score += 3; // Strict budgeting = Saver
            } else if (budgetingAnswer === 'try') {
                score += 2; // Tries to budget = Balanced
            } else if (budgetingAnswer === 'none') {
                score += 1; // No budgeting = Spender
            }

            // Determine personality based on score
            let personality = '';
            let description = '';
            if (score >= 3) {
                personality = 'Saver';
                description = 'You’re a disciplined saver who prioritizes budgeting and financial security. Keep it up, but don’t forget to enjoy life a little!';
            } else if (score === 2) {
                personality = 'Balanced';
                description = 'You strike a balance between saving and spending, making thoughtful financial decisions. Continue refining your budgeting skills!';
            } else {
                personality = 'Spender';
                description = 'You enjoy spending and may not prioritize budgeting. Consider setting small financial goals to build better habits!';
            }

            // Display result
            resultElement.textContent = `Your Money Personality: ${personality} - ${description}`;
            resultElement.style.color = '#0dcff1';
        });
    }
});
