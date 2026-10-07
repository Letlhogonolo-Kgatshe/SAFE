// Retakes the learning-library screenshots in src/img/library/<id>.jpg.
// Runs weekly in GitHub Actions (.github/workflows/refresh-screenshots.yml).
//
// Local run (uses your installed Edge, no browser download):
//   cd scripts && npm install && BROWSER_CHANNEL=msedge node refresh-screenshots.mjs [id ...]
//
// A screenshot is only replaced when the new capture is usable. Bot checks,
// error pages and blank renders are skipped, so the previous image (or the
// page's icon fallback) stays in place.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import { chromium } from 'playwright';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'src', 'img', 'library');
const W = 640, H = 400;

const BLOCKED = /captcha|verify (you are|you're) (a )?human|security verification|access denied|are you a robot|just a moment|unusual traffic|request blocked|enable javascript and cookies|attention required/i;
const CONSENT = /^\s*(reject all( cookies)?|decline( all)?|(strictly )?necessary( cookies)? only|only (strictly )?necessary( cookies)?|use necessary cookies only|accept all( cookies)?)\s*$/i;

function loadLibrary() {
    const ctx = { window: {} };
    vm.runInNewContext(readFileSync(path.join(root, 'src', 'data', 'library.js'), 'utf8'), ctx);
    return ctx.window.SAFE_LIBRARY;
}

const toJpeg = (buf, fit = 'cover', position = 'top') =>
    sharp(buf).resize(W, H, { fit, position }).jpeg({ quality: 78, mozjpeg: true }).toBuffer();

async function isBlank(jpg) {
    const { channels } = await sharp(jpg).stats();
    return channels.slice(0, 3).every((c) => c.stdev < 8);
}

// Spotify's web player doesn't render headless, so use the show's official cover via oEmbed.
async function spotifyCover(url) {
    const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error(`oEmbed ${res.status}`);
    const { thumbnail_url } = await res.json();
    const img = Buffer.from(await (await fetch(thumbnail_url)).arrayBuffer());
    return toJpeg(img, 'cover', 'centre');
}

async function capture(browser, url) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, locale: 'en-ZA' });
    try {
        const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        if (res && res.status() >= 400) throw new Error(`HTTP ${res.status()}`);
        // Let client-rendered pages finish loading (some never go fully idle, so cap the wait).
        await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
        await page.waitForTimeout(2500);
        // Dismiss a cookie/consent dialog if one is covering the page, preferring "reject".
        const buttons = page.getByRole('button', { name: CONSENT });
        const n = await buttons.count();
        if (n) {
            const labels = await buttons.allInnerTexts();
            const i = Math.max(0, labels.findIndex((t) => /reject|decline|necessary/i.test(t)));
            await buttons.nth(i).click({ timeout: 3000 }).catch(() => {});
            await page.waitForTimeout(2500);
        }
        const text = `${await page.title()} ${(await page.locator('body').innerText({ timeout: 5000 }).catch(() => '')).slice(0, 3000)}`;
        if (BLOCKED.test(text)) throw new Error('bot check or block page');
        return toJpeg(await page.screenshot({ type: 'png' }));
    } finally {
        await page.close();
    }
}

const only = new Set(process.argv.slice(2));
const items = loadLibrary().filter((it) => !only.size || only.has(it.id));
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || undefined });
const summary = { updated: [], kept: [] };

for (const it of items) {
    const file = path.join(outDir, `${it.id}.jpg`);
    try {
        const jpg = /open\.spotify\.com/.test(it.url) ? await spotifyCover(it.url) : await capture(browser, it.url);
        if (await isBlank(jpg)) throw new Error('blank render');
        writeFileSync(file, jpg);
        summary.updated.push(it.id);
        console.log(`OK    ${it.id}`);
    } catch (err) {
        summary.kept.push(it.id);
        console.log(`KEEP  ${it.id} (${err.message.split('\n')[0]})${existsSync(file) ? '' : ' [no image yet, icon fallback]'}`);
    }
}
await browser.close();
console.log(`\n${summary.updated.length} updated, ${summary.kept.length} kept unchanged.`);
