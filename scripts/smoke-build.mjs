import { spawn } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';
import assert from 'node:assert/strict';

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4179', '--strictPort', '--base', '/romina-xv/'], { stdio: ['ignore', 'pipe', 'pipe'] });
let output = '';
server.stdout.on('data', chunk => { output += chunk; });
server.stderr.on('data', chunk => { output += chunk; });
const origin = 'http://127.0.0.1:4179/romina-xv/';
try {
  let html;
  for (let attempt = 0; attempt < 50; attempt++) {
    if (server.exitCode !== null) throw new Error(`Preview terminó: ${output}`);
    if (output.includes('4179')) {
      try {
        const response = await fetch(origin, { signal: AbortSignal.timeout(1000) });
        assert.equal(response.status, 200);
        html = await response.text();
        break;
      } catch { /* Permitir que el servidor termine de iniciar. */ }
    }
    await setTimeout(100);
  }
  assert.ok(html, `Preview no disponible: ${output}`);
  assert.match(html, /lang="es-MX"/);
  assert.ok(!html.includes('referencias/'));
  const files = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map(match => match[1]);
  assert.ok(files.length >= 2);
  for (const file of files) {
    const url = new URL(file, origin);
    assert.ok(url.pathname.startsWith('/romina-xv/assets/'));
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    assert.equal(response.status, 200);
    assert.ok(!(response.headers.get('content-type') ?? '').includes('text/html'));
    await response.body?.cancel();
    console.log(`OK HTTP 200 ${url.pathname}`);
  }
  console.log('OK HTML y recursos relativos bajo /romina-xv/. Comprobación HTTP, sin navegador.');
} finally {
  server.kill();
}
