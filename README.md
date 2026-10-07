# SAFE: South African Financial Education

![HTML](https://img.shields.io/badge/HTML5-E34F26) ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E) ![Chart.js](https://img.shields.io/badge/Chart.js-FF6384) ![Pages](https://img.shields.io/badge/deployed-GitHub%20Pages-222)

**Free, beginner-friendly financial education for South Africans**, in one place. It was my solo entry (Team Arctic) to the **South African Intervarsity Hackathon 2025**.

**Live site:** https://letlhogonolo-kgatshe.github.io/SAFE/

![SAFE homepage](assets/screenshot.jpg)

## Why I built it

When I started learning about money, the useful resources were scattered across dozens of sites, channels and podcasts. SAFE is the site I wish I'd had: the basics explained simply, tools to try ideas risk-free, and the local resources I still use, all on one page.

## Features

| Feature | What it does |
|---|---|
| **Stock market game** | Start with $10,000 of virtual cash and trade 5 fictional stocks day by day. Prices move with random market events, a Chart.js price chart and achievements. |
| **Financial calculators** | Investment growth (compound interest), loan repayments, property purchase costs using South African transfer duty rates, and a currency converter. |
| **Definitions** | Plain-language explanations of financial terms, with examples, diagrams and a quiz to check understanding. |
| **Curated learning** | South African and international YouTube channels, podcasts, articles, news and courses for beginners. |
| **Community & FAQ** | A community section and answers to common questions on budgeting, credit scores and investing. |
| **Responsive** | Works on phones and desktops, with a dedicated mobile menu. |

> **Disclaimer:** SAFE provides financial *information*, not financial advice. For personalised advice, consult a professional registered with the FSCA.

## Tech

A static site: **HTML**, **Tailwind CSS** (CDN), vanilla **JavaScript** (`src/scrpt.js`) and **Chart.js**. It has no build step and is deployed to GitHub Pages with GitHub Actions (`.github/workflows/static.yml` publishes `src/`).

## Running locally

```bash
npx http-server src -p 5501
```

Then open http://localhost:5501. You can also open `src/index.html` directly in a browser.

## Repository layout

```
src/        The website: index.html, style.css, scrpt.js, images
demo/       Hackathon presentation (.pptx), screen recording and overview
docs/       Setup, usage, team and acknowledgements
assets/     Screenshot and sponsor artwork
```

## Author

Built by **Letlhogonolo Kgatshe**, Computer Science student at IIE Varsity College, Cape Town. [Portfolio](https://letlhogonolo-kgatshe.github.io/) · [LinkedIn](https://www.linkedin.com/in/letlhogonolo-kgatshe-69aa2a2b7/)

Licensed under the [MIT License](LICENSE).
