/* Link-Checker für die ArchiPedia-Datenbasis.
   Läuft im Build/CI (z. B. Netlify-Build oder GitHub Action), prüft jede src-URL
   auf Erreichbarkeit und meldet Knoten, deren Quellen tot sind.
   Aufruf: node check-links.mjs  (Exit-Code 1 bei toten Links) */
import { P, N } from './data.mjs';

const urls = [];
for (const [id, n] of Object.entries(N)) {
  for (const s of n.src || []) if (s.u) urls.push({ id, t: s.t, u: s.u });
}
console.log(urls.length + ' Quellen-Links zu prüfen …');

let dead = 0;
for (const { id, t, u } of urls) {
  try {
    const r = await fetch(u, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(10000) });
    // Manche Portale beantworten HEAD nicht sauber; bei 405/403 mit GET nachfassen
    const status = (r.status === 405 || r.status === 403)
      ? (await fetch(u, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(10000) })).status
      : r.status;
    if (status >= 400) { console.log(`✗ ${status}  ${id} → ${t}  (${u})`); dead++; }
  } catch (e) {
    console.log(`✗ ERR  ${id} → ${t}  (${u}): ${e.message}`); dead++;
  }
}
console.log(dead ? `${dead} tote Links — betroffene Knoten fallen auf Status "generiert" zurück.` : 'Alle Links erreichbar.');
process.exit(dead ? 1 : 0);
