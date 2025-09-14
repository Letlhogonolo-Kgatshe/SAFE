    SAFE - South African Financial Education Website
Overview

SAFE is a South African Financial Education website designed to empower beginners and intermediate learners with accessible, practical knowledge on topics like budgeting, saving, investing, debt management, financial goals, and taxes. The platform aims to make financial education as common as everyday conversation, offering curated resources, a community forum, and interactive tools like quizzes to enhance learning. The website features a modern, user-friendly design with a focus on accessibility and engagement.

Disclaimer: None of the information provided on SAFE constitutes financial advice. For personalized financial advice, consult a professional registered and certified with the Financial Sector Conduct Authority (FSCA). This is financial information only.
Features

Home Page: Welcomes users with a clear mission statement and a call-to-action to explore resources or join the community.
About Section: Outlines SAFE’s mission to normalize financial conversations and support novice investors.
How to Start: Guides beginners with links to definitions, YouTube channels, and investment platforms like EasyEquities.
Definitions Page: Provides simple explanations of financial terms (e.g., budgeting, saving) with examples, diagrams, and a true/false quiz to test understanding.
YouTube Page: Curates South African and international YouTube channels (e.g., Financial Bunny, Nischa) and specific videos for deeper learning.
Podcasts Page: Highlights financial podcasts like Honest Money Podcast for on-the-go education.
Articles Page: Links to trusted articles from sources like QuickBooks and Daily Investor.
News Page: Displays financial news via static content (RSS feed integration planned) on topics like the Magnificent 7 vs. Terrific 10 and zero-rated VAT items.
Community Section: Encourages user interaction through a Quora-like forum and a high school demo trading challenge to engage younger audiences.
Contact Section: Includes contact details and a form for user inquiries.

Project Structure
SAFE/

    ├── index.html          # Main HTML file with all sections
    ├── script.js           # JavaScript for navigation, smooth scrolling, and quiz functionality
    ├── styles.css          # CSS for styling the website
    ├── favicon.png         # Website favicon
    ├── SAFE(1).img.JPG   # Logo image
    ├── images/             # Placeholder for images (e.g., financial-bunny.jpg, budgeting-diagram.jpg)
    └── README.md           # This file

Setup Instructions

Clone the Repository:
git clone <repository-url> https://github.com/Letlhogonolo-Kgatshe/SAFE.git
cd SAFE


Install Dependencies:

No external dependencies are required for the front-end, as it uses CDN-hosted libraries (Font Awesome, Google Fonts).
Ensure you have a modern web browser (e.g., Chrome, Firefox) to view the site.


Run Locally:

Open index.html in a browser directly, or use a local server for better testing:npx http-server


Navigate to http://localhost:5501 in your browser.


Formspree Configuration:

Replace YOUR_FORM_ID in the contact form (index.html) with a valid Formspree ID to enable form submissions.
Sign up at Formspree to get your form ID.


Image Assets:

Replace placeholder images (e.g., financial-bunny.jpg, budgeting-diagram.jpg) with actual images in the images/ folder.
Ensure SAFE(1).img.JPG exists or update the logo path in index.html.



Customization

Community Forum: The forum link is a placeholder. To implement, integrate a backend (e.g., Node.js with MongoDB) or use a third-party service like Discourse.
RSS Feeds: The news section uses static content. To enable dynamic RSS feeds, add a JavaScript library like rss-parser and configure feeds from sources like Yahoo Finance.
Diagrams: Create or source diagrams (e.g., for budgeting) to enhance the Definitions page. Update image paths in index.html.
Styling: Adjust styles.css for custom colors, fonts, or layouts to match your brand.

Technologies Used

HTML5: For semantic structure and accessibility.
CSS3: For responsive design and animations, using Google Fonts and a dark theme.
JavaScript: For interactive features like the hamburger menu, smooth scrolling, and quiz functionality.
CDNs: Font Awesome for icons, Google Fonts for typography.

Future Enhancements

Implement a fully functional community forum with user authentication and post moderation.
Add dynamic RSS feed parsing for real-time news updates.
Add more diagrams and infographics for visual learning.

Contributing
Contributions are welcome! Please fork the repository, create a new branch, and submit a pull request with your changes. Ensure code follows the existing style and includes comments for clarity.
License
© 2025 SAFE. All rights reserved.
Contact
For questions or feedback, reach out to:

Email: Tlhogikgatshe@gmail.com
Phone: +27 66 420 7144
LinkedIn: Letlhogonolo Kgatshe
