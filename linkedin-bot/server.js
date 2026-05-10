require('dotenv').config();
const express = require('express');
const { chromium } = require('playwright');
const fs = require('fs');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
/** Bump when login/health behavior changes — curl /health to confirm EC2 picked up new code */
const SERVER_BUILD = 'login-poll-v4-2026-05-10';

// Per-account browser state
const accounts = {};

const sessionPath = (accountId) => `./session_${accountId}.json`;

const delay = (min, max) => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, ms));
};

async function getBrowser(accountId = 'account1') {
  const acc = accounts[accountId];
  if (acc && acc.browser.isConnected()) return acc;

  const browser = await chromium.launch({
    headless: true,
    timeout: 120_000,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
  });

  const sessionFile = sessionPath(accountId);
  const sessionExists = fs.existsSync(sessionFile);

  const context = await browser.newContext({
    storageState: sessionExists ? sessionFile : undefined,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    window.chrome = { runtime: {} };
  });

  const page = await context.newPage();
  page.setDefaultNavigationTimeout(60_000);
  page.setDefaultTimeout(60_000);
  accounts[accountId] = { browser, context, page };
  return accounts[accountId];
}

async function saveSession(accountId) {
  const acc = accounts[accountId];
  if (acc) await acc.context.storageState({ path: sessionPath(accountId) });
}

async function ensureLoggedIn(page, accountId) {
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
  const url = page.url();
  if (url.includes('/login') || url.includes('/authwall')) {
    throw new Error(`NOT_LOGGED_IN: Call /login with account="${accountId}" first`);
  }
}

function getAccountId(req) {
  return (req.body.account || 'account1').replace(/[^a-zA-Z0-9_]/g, '');
}

// POST /login — { email, password, account }
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const accountId = getAccountId(req);
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    if (accounts[accountId]) {
      await accounts[accountId].browser.close().catch(() => {});
      delete accounts[accountId];
    }

    console.log(`[login:${accountId}] starting browser…`);
    const { page } = await getBrowser(accountId);
    console.log(`[login:${accountId}] navigating to LinkedIn login…`);
    await page.goto('https://www.linkedin.com/login', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    console.log(`[login:${accountId}] filling credentials…`);
    await delay(1000, 2000);
    await page.fill('#username', email);
    await delay(500, 1200);
    await page.fill('#password', password);
    await delay(500, 1000);
    console.log(`[login:${accountId}] submitting…`);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20_000 }).catch(() => {}),
      page.click('[type="submit"]'),
    ]);

    console.log(`[login:${accountId}] waiting for /feed (polling)…`);
    const feedRe = /linkedin\.com\/feed/i;
    const deadline = Date.now() + 90_000;
    while (Date.now() < deadline) {
      const url = page.url();
      if (feedRe.test(url)) break;
      const u = url.toLowerCase();
      if (u.includes('checkpoint') || u.includes('challenge') || u.includes('captcha')) {
        await page.screenshot({ path: `login_fail_${accountId}.png` }).catch(() => {});
        throw new Error(
          `LinkedIn security checkpoint. URL: ${url}. Screenshot: login_fail_${accountId}.png`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    const finalUrl = page.url();
    if (!feedRe.test(finalUrl)) {
      await page.screenshot({ path: `login_fail_${accountId}.png` }).catch(() => {});
      let hint = 'Did not reach /feed within 90s. ';
      if (finalUrl.includes('/login')) {
        hint +=
          'Still on login — wrong password, CAPTCHA, 2FA, or datacenter IP blocked. ';
      }
      hint += `Last URL: ${finalUrl}. Screenshot: login_fail_${accountId}.png`;
      throw new Error(hint);
    }

    await saveSession(accountId);
    res.json({ success: true, account: accountId, message: `Session saved to session_${accountId}.json` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /view-profile — { profileUrl, account }
app.post('/view-profile', async (req, res) => {
  try {
    const { profileUrl } = req.body;
    const accountId = getAccountId(req);
    if (!profileUrl) return res.status(400).json({ error: 'profileUrl required' });

    const { page } = await getBrowser(accountId);
    await ensureLoggedIn(page, accountId);
    await page.goto(profileUrl, { waitUntil: 'domcontentloaded' });
    await delay(3000, 6000);
    await page.evaluate(() => window.scrollBy(0, 400));
    await delay(1500, 3000);
    await page.evaluate(() => window.scrollBy(0, 400));
    await delay(1000, 2000);

    const connectBtn = await page.$('button[aria-label*="Connect"]');
    const messageBtn = await page.$('button[aria-label*="Message"]');
    const pendingBtn = await page.$('button[aria-label*="Pending"]');

    let connectionStatus = 'unknown';
    if (pendingBtn) connectionStatus = 'pending';
    else if (messageBtn) connectionStatus = 'connected';
    else if (connectBtn) connectionStatus = 'not_connected';

    const name = await page.$eval('h1', el => el.innerText).catch(() => '');
    res.json({ success: true, account: accountId, connectionStatus, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /connect — { profileUrl, note, account }
app.post('/connect', async (req, res) => {
  try {
    const { profileUrl, note } = req.body;
    const accountId = getAccountId(req);
    if (!profileUrl) return res.status(400).json({ error: 'profileUrl required' });

    const { page } = await getBrowser(accountId);
    await ensureLoggedIn(page, accountId);
    await page.goto(profileUrl, { waitUntil: 'domcontentloaded' });
    await delay(2000, 4000);

    let connectBtn = await page.$('button[aria-label*="Connect"]');
    if (!connectBtn) {
      const moreBtn = await page.$('button[aria-label*="More actions"]');
      if (moreBtn) {
        await moreBtn.click();
        await delay(800, 1500);
        connectBtn = await page.$('[aria-label*="Connect"]');
      }
    }

    if (!connectBtn) return res.status(400).json({ error: 'Connect button not found' });

    await connectBtn.click();
    await delay(1000, 2000);

    if (note) {
      const addNoteBtn = await page.$('button[aria-label="Add a note"]');
      if (addNoteBtn) {
        await addNoteBtn.click();
        await delay(500, 1000);
        await page.fill('textarea[name="message"]', note);
        await delay(500, 1000);
      }
    }

    const sendBtn = await page.$('button[aria-label="Send now"]') ||
                    await page.$('button[aria-label="Send invitation"]');
    if (sendBtn) { await sendBtn.click(); await delay(1000, 2000); }

    await saveSession(accountId);
    res.json({ success: true, account: accountId, message: 'Connection request sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /message — { profileUrl, message, account }
app.post('/message', async (req, res) => {
  try {
    const { profileUrl, message } = req.body;
    const accountId = getAccountId(req);
    if (!profileUrl || !message) return res.status(400).json({ error: 'profileUrl and message required' });

    const { page } = await getBrowser(accountId);
    await ensureLoggedIn(page, accountId);
    await page.goto(profileUrl, { waitUntil: 'domcontentloaded' });
    await delay(2000, 4000);

    const messageBtn = await page.$('button[aria-label*="Message"]');
    if (!messageBtn) return res.status(400).json({ error: 'Message button not found' });

    await messageBtn.click();
    await delay(1500, 2500);

    const msgBox = await page.$('.msg-form__contenteditable');
    if (!msgBox) return res.status(500).json({ error: 'Message box not found' });

    await msgBox.click();
    for (const char of message) {
      await page.keyboard.type(char, { delay: Math.random() * 80 + 20 });
    }

    await delay(800, 1500);
    await page.keyboard.press('Enter');
    await delay(1000, 2000);

    await saveSession(accountId);
    res.json({ success: true, account: accountId, message: 'Message sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /check-reply — { profileUrl, account }
app.post('/check-reply', async (req, res) => {
  try {
    const { profileUrl } = req.body;
    const accountId = getAccountId(req);
    if (!profileUrl) return res.status(400).json({ error: 'profileUrl required' });

    const { page } = await getBrowser(accountId);
    await ensureLoggedIn(page, accountId);
    await page.goto('https://www.linkedin.com/messaging/', { waitUntil: 'domcontentloaded' });
    await delay(2000, 3000);

    const slug = profileUrl.split('/in/')[1]?.replace(/\//g, '');
    const searchBox = await page.$('[placeholder*="Search"]');
    if (searchBox) {
      await searchBox.click();
      await delay(500, 1000);
      await searchBox.type(slug || '', { delay: 60 });
      await delay(1500, 2500);
    }

    const conversations = await page.$$('.msg-conversation-listitem');
    let replied = false;
    for (const conv of conversations.slice(0, 5)) {
      const snippet = await conv.$eval('.msg-conversation-card__message-snippet', el => el.innerText).catch(() => '');
      const sender = await conv.$eval('.msg-conversation-card__participant-names', el => el.innerText).catch(() => '');
      if (!snippet.startsWith('You:') && sender.toLowerCase().includes(slug?.toLowerCase() || '')) {
        replied = true; break;
      }
    }

    res.json({ success: true, account: accountId, replied });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /health
app.get('/health', (req, res) => {
  const activeAccounts = Object.entries(accounts).map(([id, acc]) => ({
    account: id,
    browserActive: acc.browser.isConnected(),
    sessionExists: fs.existsSync(sessionPath(id)),
  }));
  res.json({ status: 'ok', serverBuild: SERVER_BUILD, accounts: activeAccounts });
});

// GET /accounts
app.get('/accounts', (req, res) => {
  const sessions = fs.readdirSync('.').filter(f => f.startsWith('session_') && f.endsWith('.json'));
  res.json({ accounts: sessions.map(f => f.replace('session_', '').replace('.json', '')) });
});

process.on('SIGINT', async () => {
  for (const acc of Object.values(accounts)) await acc.browser.close().catch(() => {});
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`LinkedIn bot running on http://localhost:${PORT}`);
  console.log(`Login: POST /login { email, password, account: "account1" }`);
});
