import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp, readFile, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

assert.equal(process.env.CI, 'true', 'Only for disposable CI');
const base = 'http://127.0.0.1:8401';
const org = process.argv[2];
assert.ok(org);
const profile = await mkdtemp(join(tmpdir(), 'gl-chrome-'));
const chrome = spawn(process.env.CHROME_BIN || 'google-chrome', [
  '--headless=new', '--no-sandbox', '--disable-dev-shm-usage',
  '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank',
], {stdio: 'ignore'});
chrome.on('error', () => {});
let socket;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(action) {
  for (let i = 0; i < 120; i++) {
    try { const result = await action(); if (result) return result; } catch { /* Retry until timeout. */ }
    await delay(250);
  }
  throw new Error('Browser readiness or expected page timed out');
}
try {
  const port = await until(async () => (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]);
  const target = await until(async () => (await (await fetch('http://127.0.0.1:' + port + '/json/list')).json()).find(t => t.type === 'page'));
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, {once: true});
    socket.addEventListener('error', reject, {once: true});
  });
  let seq = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    const handler = pending.get(message.id);
    if (handler) { pending.delete(message.id); handler(message); }
  });
  function cdp(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++seq;
      const timer = setTimeout(() => {pending.delete(id); reject(new Error('CDP timeout: ' + method));}, 15000);
      pending.set(id, message => {
        clearTimeout(timer);
        if (message.error) reject(new Error('CDP failure: ' + method));
        else resolve(message.result);
      });
      socket.send(JSON.stringify({id, method, params}));
    });
  }
  const evaluate = async expression => (await cdp('Runtime.evaluate', {expression, returnByValue: true})).result.value;
  await cdp('Page.enable');
  await cdp('Network.enable');
  await cdp('Emulation.setDeviceMetricsOverride', {width: 1280, height: 900, deviceScaleFactor: 1, mobile: false});
  await mkdir('recipe-screenshots', {recursive: true});
  async function page(path, title, screenshot) {
    await cdp('Page.navigate', {url: base + path});
    await until(async () => {
      const state = await evaluate('({path:location.pathname, heading:document.querySelector("h1")?.textContent, ready:document.readyState})');
      return state?.path === path && state.heading?.includes(title) && state.ready === 'complete';
    });
    console.log('Browser verified:', path, title);
    if (screenshot) {
      const image = await cdp('Page.captureScreenshot', {format: 'png'});
      await writeFile(join('recipe-screenshots', screenshot + '.png'), Buffer.from(image.data, 'base64'));
    }
  }
  async function session(email) {
    const res = await fetch(base + '/api/saas/auth/login', {
      method: 'POST', headers: {Origin: 'https://rec.example.invalid', 'Content-Type': 'application/json'},
      body: JSON.stringify({email, organizationId: org, password: 'CI-only-recipe-password-2026'}),
      signal: AbortSignal.timeout(15000),
    });
    assert.equal(res.status, 200);
    const token = res.headers.get('set-cookie')?.match(/gl_session=([^;]+)/)?.[1];
    assert.ok(token);
    await cdp('Network.clearBrowserCookies');
    assert.equal((await cdp('Network.setCookie', {name: 'gl_session', value: token, url: base, path: '/', secure: true, httpOnly: true, sameSite: 'Strict'})).success, true);
  }
  await page('/saas/login', 'Connexion', '01-connexion');
  await session('ci-admin@example.invalid');
  await page('/saas', 'Bienvenue', '02-administration');
  await page('/saas/members', 'Membres', '03-membres');
  await page('/saas/logistics', 'Clients et expéditions', '04-logistique');
  await page('/saas/billing', 'Gestion commerciale', '05-facturation');
  await page('/saas/billing/journal', 'Journal financier', '06-journal');
  await page('/saas/billing/mobile', 'Suivi Mobile Money', '07-mobile-money');
  await page('/saas/commercial', 'Paramètres commerciaux', '08-parametres');
  await session('recipe-client@example.invalid');
  await page('/saas/portal', 'Mes expéditions', '09-portail-client');
  assert.equal(await evaluate('document.body.innerText.includes("Mamou")'), false, 'Hidden shipment visible');
  await session('recipe-driver@example.invalid');
  await cdp('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 1, mobile: true});
  await page('/saas/missions', 'Mes missions', '10-missions-mobile');
} finally {
  socket?.close();
  chrome.kill();
  await new Promise(resolve => {if (chrome.exitCode !== null || chrome.signalCode !== null) resolve(); else {chrome.once('exit', resolve); setTimeout(resolve, 3000);}});
  await rm(profile, {recursive: true, force: true, maxRetries: 3});
}
