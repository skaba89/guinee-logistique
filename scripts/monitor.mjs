// One-shot probe for cron/systemd or an existing monitoring platform.
// Exit 1 on an unavailable service, 2 on invalid configuration.
const ports = {dev: 8400, rec: 8401, prod: 8402};
const environment = process.argv[2];
if (!Object.hasOwn(ports, environment) || process.argv.length > 4) {
  console.error('Usage: node scripts/monitor.mjs dev|rec|prod [https://public-origin]');
  process.exit(2);
}
const targets = [{scope: 'local', origin: 'http://127.0.0.1:' + ports[environment]}];
if (process.argv[3]) {
  try {
    const url = new URL(process.argv[3]);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error();
    targets.push({scope: 'public', origin: url.origin});
  } catch {
    console.error('Public origin must be HTTPS without credentials, path or query');
    process.exit(2);
  }
}
let failed = false;
for (const {scope, origin} of targets) {
  for (const [endpoint, expected] of [['health', 'ok'], ['ready', 'ready']]) {
    const start = performance.now();
    let status = 0, ok = false;
    try {
      const response = await fetch(origin + '/api/' + endpoint, {redirect: 'manual', signal: AbortSignal.timeout(10000)});
      status = response.status;
      if (status === 200) {
        const result = await response.json();
        ok = result.status === expected && result.service === 'guinee-logistique';
      }
    } catch { /* Never log exceptions or remote bodies. */ }
    if (!ok) failed = true;
    console.log(JSON.stringify({event: 'availability_probe', timestamp: new Date().toISOString(),
      environment, scope, endpoint, status, ok, durationMs: Math.round(performance.now() - start)}));
  }
}
process.exitCode = failed ? 1 : 0;
