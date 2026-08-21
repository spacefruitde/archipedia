// Befunde der Opus-Gegenlesung einspielen. Aufruf: node apply-review.mjs [--write]
import { readFileSync, writeFileSync, existsSync } from 'fs';
const DIR = '/private/tmp/claude-501/-Users-ben-Documents-AO/0eddd404-02ba-463f-a048-52d78024291d/scratchpad/gen2';
const DATA = '/Users/ben/Documents/AO/data.mjs';
const WRITE = process.argv.includes('--write');
const { N } = await import(DATA + '?t=' + Date.now());
let s = readFileSync(DATA, 'utf8');
const q = v => JSON.stringify(v);
const blockRange = id => { const m = s.match(new RegExp(`\\n${id}:\\{`)); if (!m) throw new Error('Block: ' + id); const start = m.index + 1; const rest = s.slice(start + 1); const m2 = rest.match(/\n[A-Za-z0-9_]+:\{|\n\};/); return [start, start + 1 + m2.index + 1]; };
const ALLOWED = /dinmedia\.de|austrian-standards\.at|sia\.ch|oib\.or\.at|vkf\.ch|gesetze-im-internet\.de|ris\.bka\.gv\.at|fedlex\.admin\.ch|verwaltungsvorschriften-im-internet\.de|crb\.ch|ift-rosenheim\.de|bundesverband-flachglas\.de|recht\.nrw\.de|gesetze-bayern\.de|endk\.ch/;
const log = [], stats = { ok: 0, korrigieren: 0, unsicher: 0, ersetzt: 0, manuell: 0, quellen: 0 };
const setField = (id, field, value) => {
  const [st, en] = blockRange(id); let blk = s.slice(st, en);
  if (field.startsWith('dach.')) {
    const cc = field.split('.')[1]; const m = blk.match(/\n dach:([^\n]*)\n/); if (!m) throw new Error('dach fehlt: ' + id);
    const line = m[1]; let tail = ',', d; try { d = JSON.parse(line.slice(0, -1)); } catch { tail = '},'; d = JSON.parse(line.slice(0, -2)); } d[cc] = value; blk = blk.replace(m[0], `\n dach:${q(d)}${tail}\n`);
  } else {
    const re = new RegExp(`\\n ${field}:([^\\n]*)\\n`); const m = blk.match(re); if (!m) throw new Error(`${field} fehlt: ${id}`);
    const tail = m[1].endsWith('},') ? '},' : ',';
    blk = blk.replace(m[0], `\n ${field}:${q(value)}${tail}\n`);
  }
  s = s.slice(0, st) + blk + s.slice(en);
};
const addSrc = (id, quellen) => {
  const [st, en] = blockRange(id); let blk = s.slice(st, en);
  const have = N[id].src || []; const merged = [...have];
  for (const qq of quellen) { if (!qq.u || !qq.stand || !ALLOWED.test(qq.u)) { log.push(`${id}: Quelle verworfen (Portal/Stand): ${qq.t} ${qq.u || ''}`); continue; } if (!merged.some(x => x.u === qq.u)) { merged.push({ t: qq.t, u: qq.u, stand: qq.stand, geprueft: qq.geprueft || '2026-08-21' }); stats.quellen++; } }
  if (merged.length === have.length) return;
  if (/\n src:/.test(blk)) blk = blk.replace(/\n src:\[[^\n]*\](,|\})\n/, (m, tail) => `\n src:${q(merged)}${tail}\n`);
  else { const key = /\n ln:/.test(blk) ? ' ln:' : (/\n t3:/.test(blk) ? ' t3:' : ' t2:'); blk = blk.replace(new RegExp(`(\\n${key}[^\\n]*)\\n`), (m, line) => line.endsWith('},') ? `${line.slice(0, -2)},\n src:${q(merged)}},\n` : `${line}\n src:${q(merged)},\n`); }
  s = s.slice(0, st) + blk + s.slice(en);
};
const replaceByZitat = (val, zitat, ersatz) => {
  const i = val.indexOf(zitat); const e = ersatz.trim();
  const isFull = /^[A-ZÄÖÜ0-9„"]/.test(e) && /[.!?]$/.test(e);
  if (!isFull) return val.slice(0, i) + e + val.slice(i + zitat.length);
  const a = val.lastIndexOf('. ', i); const start = a < 0 ? 0 : a + 2;
  const b = val.indexOf('. ', i + zitat.length - 1); const end = b < 0 ? val.length : b + 1;
  return val.slice(0, start) + e + (end < val.length ? ' ' : '') + val.slice(end).replace(/^\s+/, '');
};
const getField = (n, field) => field.startsWith('dach.') ? (n.dach || {})[field.split('.')[1]] : n[field];
for (const r of ['w2r1', 'w2r2', 'w2r3', 'w2r4', 'w2r5']) {
  const f = `${DIR}/ergebnis-${r}.json`; if (!existsSync(f)) { log.push(`fehlt: ${f}`); continue; }
  let res; try { res = JSON.parse(readFileSync(f, 'utf8').replace(/^﻿/, '')); } catch (e) { log.push(`${r}: JSON-Fehler ${e.message}`); continue; }
  for (const e of res) {
    const n = N[e.id]; if (!n) { log.push(`${r}: unbekannte id ${e.id}`); continue; }
    stats[e.urteil] = (stats[e.urteil] || 0) + 1;
    const cur = { t1: n.t1, t2: n.t2, t3: n.t3, dach: n.dach ? { ...n.dach } : null };
    for (const b of (e.befunde || [])) {
      if (!b.ersatz) { log.push(`${e.id} [${b.art}] ${b.feld}: ${b.problem}`); continue; }
      if (/[–—]/.test(b.ersatz)) { log.push(`${e.id} ${b.feld}: Ersatz mit Gedankenstrich, MANUELL: ${b.problem}`); stats.manuell++; continue; }
      const val = b.feld.startsWith('dach.') ? (cur.dach || {})[b.feld.split('.')[1]] : cur[b.feld];
      if (!val || !b.zitat || !val.includes(b.zitat)) { log.push(`${e.id} ${b.feld}: Zitat nicht gefunden, MANUELL: ${b.problem} | Ersatz: ${b.ersatz.slice(0, 120)}`); stats.manuell++; continue; }
      const nv = replaceByZitat(val, b.zitat, b.ersatz);
      if (b.feld.startsWith('dach.')) cur.dach[b.feld.split('.')[1]] = nv; else cur[b.feld] = nv;
      stats.ersetzt++; log.push(`${e.id} ${b.feld}: ersetzt (${b.art}): ${b.problem}`);
    }
    if (cur.t2 && n.t2 && (/Häufigster Fehler/.test(n.t2) && !/Häufigster Fehler/.test(cur.t2) || /Kostenlogik:/.test(n.t2) && !/Kostenlogik:/.test(cur.t2))) log.push(`${e.id}: MARKER in t2 verloren`);
    if (cur.t3 && !/Ab hier:/.test(cur.t3)) log.push(`${e.id}: 'Ab hier' in t3 verloren`);
    if (WRITE) {
      for (const k of ['t1', 't2', 't3']) if (cur[k] !== n[k] && cur[k]) setField(e.id, k, cur[k]);
      if (cur.dach) for (const cc of ['de', 'at', 'ch']) if (n.dach && cur.dach[cc] !== n.dach[cc]) setField(e.id, 'dach.' + cc, cur.dach[cc]);
      if (e.quellen && e.quellen.length) addSrc(e.id, e.quellen);
    }
  }
}
if (WRITE) writeFileSync(DATA, s);
writeFileSync(`${DIR}/apply-log.txt`, log.join('\n'));
console.log(JSON.stringify(stats)); console.log(log.slice(0, 80).join('\n'));
