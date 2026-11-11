// Usa la misma fuente de verdad que la app (Node 24 admite TypeScript sin transpilar).
import { event, whatsappUrl } from '../src/data/event.ts';
for (const url of [event.ceremony.mapsUrl, event.reception.mapsUrl, whatsappUrl]) {
  try {
    const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
    console.log(JSON.stringify({ url, status: response.status, destination: response.url }));
    await response.body?.cancel();
    if (!response.ok) process.exitCode = 1;
  } catch (error) {
    console.log(JSON.stringify({ url, error: error.message }));
    process.exitCode = 1;
  }
}
