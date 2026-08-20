// Merge der Sonnet-Ausgaben in data.mjs + Validierung. Aufruf: node merge.mjs [--write]
import { readFileSync, writeFileSync, existsSync } from 'fs';
const DIR = '/private/tmp/claude-501/-Users-ben-Documents-AO/0eddd404-02ba-463f-a048-52d78024291d/scratchpad/gen2';
const STRUCT = await import('/private/tmp/claude-501/-Users-ben-Documents-AO/0eddd404-02ba-463f-a048-52d78024291d/scratchpad/struct-kab-eli.mjs');
const DATA = '/Users/ben/Documents/AO/data.mjs';
const WRITE = process.argv.includes('--write');
const { N } = await import(DATA + '?t=' + Date.now());
const groups = ['b1', 'b2', 'b34', 'b5x', 'l1', 'l2'];
const IMAGES = STRUCT.IMAGES;
const TITLES = {};
const hard = [], soft = [];
const chkText = (id, k, v) => {
  if (!v) return;
  if (/[–—]/.test(v)) hard.push(`${id}.${k}: Gedankenstrich`);
  if (/(^|\n)\s*[-*•]\s/.test(v)) hard.push(`${id}.${k}: Liste`);
  if (/\b(z\. B\.|u\. a\.|bzw\. |ca\. |d\. h\.|vgl\. )/.test(v)) soft.push(`${id}.${k}: Abkürzung mit Punkt+Leerzeichen`);
};
const newNodes = []; const bestandT3 = [];
for (const g of groups) {
  const outF = `${DIR}/out-${g}.json`, taskF = `${DIR}/task-${g}.json`;
  if (!existsSync(outF)) { hard.push(`fehlt: out-${g}.json`); continue; }
  let out; try { out = JSON.parse(readFileSync(outF, 'utf8').replace(/^﻿/, '')); } catch (e) { hard.push(`${g}: JSON-Fehler ${e.message}`); continue; }
  const tasks = JSON.parse(readFileSync(taskF, 'utf8'));
  for (const t of tasks) {
    const o = out.find(x => x.id === t.id);
    if (!o) { hard.push(`${g}: ${t.id} fehlt in Ausgabe`); continue; }
    if (t.bestandT3) {
      if (!o.t3) { hard.push(`${t.id}: t3 fehlt (Bestand)`); continue; }
      if (!/Ab hier:/.test(o.t3)) soft.push(`${t.id}.t3 ohne 'Ab hier'`);
      chkText(t.id, 't3', o.t3);
      bestandT3.push({ id: t.id, t3: o.t3, pruefen: o.pruefen || [] });
      continue;
    }
    const n = { id: t.id, p: t.p, lv: t.lv, pa: t.pa, t: TITLES[t.id] || t.t, t1: o.t1, t2: o.t2 };
    if (!o.t1 || !o.t2) hard.push(`${t.id}: t1/t2 fehlt`);
    if (t.t3) { if (!o.t3) hard.push(`${t.id}: t3 fehlt`); else { n.t3 = o.t3; if (!/Ab hier:/.test(o.t3)) soft.push(`${t.id}.t3 ohne 'Ab hier'`); } }
    else if (o.t3 && t.p === 'e') soft.push(`${t.id}: Entwurfsknoten hat t3 (wird verworfen)`);
    else if (o.t3) n.t3 = o.t3;
    if (t.dach) { if (!o.dach || !o.dach.de || !o.dach.at || !o.dach.ch) hard.push(`${t.id}: dach unvollständig`); else n.dach = o.dach; }
    if (o.t2) { if (!/Häufigster Fehler/.test(o.t2)) soft.push(`${t.id}.t2 ohne 'Häufigster Fehler'`); if (!/Kostenlogik:/.test(o.t2)) soft.push(`${t.id}.t2 ohne 'Kostenlogik:'`); }
    if (n.t.length > 45) soft.push(`${t.id}: Titel ${n.t.length} Zeichen`);
    for (const k of ['t1', 't2', 't3']) chkText(t.id, k, o[k]);
    n.ln = Array.from(new Set([...(t.lnKandidaten || []).map(x => x.id), ...(o.ln || [])])).slice(0, 4);
    n.pruefen = o.pruefen || [];
    if (IMAGES[t.id]) n.images = [{ path: `images/${t.id}.svg`, credit: 'Eigene Schemazeichnung', lizenz: 'CC BY 4.0', caption: IMAGES[t.id] }];
    newNodes.push(n);
  }
}
// Verweise prüfen (auf Bestand oder neue Knoten)
const ids = new Set([...Object.keys(N), ...newNodes.map(n => n.id)]);
for (const n of newNodes) { n.ln = n.ln.filter(l => { if (!ids.has(l)) { soft.push(`${n.id}: ln ${l} existiert nicht, entfernt`); return false; } return l !== n.id; }); if (n.lv >= 3 && !n.ln.length) hard.push(`${n.id}: kein Querverweis`); if (n.pa && !ids.has(n.pa)) hard.push(`${n.id}: Eltern ${n.pa} fehlen`); }
console.log(`neue Knoten: ${newNodes.length}, Bestand-T3: ${bestandT3.length}`);
console.log('HART:', hard.length); hard.forEach(h => console.log('  ' + h));
console.log('WEICH:', soft.length); soft.forEach(h => console.log('  ' + h));
if (!WRITE) process.exit(hard.length ? 1 : 0);
if (hard.length) { console.log('nicht geschrieben (harte Fehler)'); process.exit(1); }

// Schreiben
let s = readFileSync(DATA, 'utf8');
const q = v => JSON.stringify(v);
const blockRange = id => { const m = s.match(new RegExp(`\\n${id}:\\{`)); if (!m) throw new Error('Block nicht gefunden: ' + id); const start = m.index + 1; const rest = s.slice(start); const m2 = rest.slice(1).match(/\n[A-Za-z0-9_]+:\{|\n\};/); const end = start + 1 + m2.index + 1; return [start, end]; };
const nodeStr = n => { const head = `${n.id}:{p:'${n.p}',lv:${n.lv},${n.pa ? `pa:'${n.pa}',` : ''}t:${q(n.t)},`; const rest = ['t1', 't2', 't3', 'ln', 'dach', 'images'].filter(k => n[k] !== undefined && !(Array.isArray(n[k]) && !n[k].length)).map(k => ` ${k}:${q(n[k])}`); return head + '\n' + rest.join(',\n') + '},\n'; };
// Bestand-T3: nach der t2-Zeile einfügen
for (const b of bestandT3) { const [st, en] = blockRange(b.id); let blk = s.slice(st, en); if (/\n t3:/.test(blk)) { soft.push(`${b.id}: hatte schon t3`); continue; } blk = blk.replace(/\n t2:([^\n]*)\n/, (m, line) => { if (line.endsWith('},')) return `\n t2:${line.slice(0, -2)},\n t3:${q(b.t3)}},\n`; if (line.endsWith(',')) return `\n t2:${line}\n t3:${q(b.t3)},\n`; throw new Error('t2-Zeile unerwartet: ' + b.id); }); if (!/\n t3:/.test(blk)) throw new Error('t3 nicht eingefügt: ' + b.id); s = s.slice(0, st) + blk + s.slice(en); }
// neue Knoten: nach dem Elternblock einfügen; Wurzeln (efe1) vor 'erp1:{'
const byLv = [...newNodes].sort((a, b) => a.lv - b.lv);
for (const n of byLv) {
  const str = nodeStr(n);
  if (!n.pa) { const i = s.indexOf('\nerp1:{'); if (i < 0) throw new Error('erp1 nicht gefunden'); s = s.slice(0, i + 1) + str + s.slice(i + 1); continue; }
  const [, en] = blockRange(n.pa); s = s.slice(0, en) + str + s.slice(en);
}
// ROOTS: efe1
const efe = newNodes.find(n => n.id === 'efe1');
if (efe) { const lead = efe.t1.split(/(?<=\.)\s/)[0]; s = s.replace('export const ROOTS = [\n', `export const ROOTS = [\n [\n  "efe1",\n  ${q(lead)}\n ],\n`); }
writeFileSync(DATA, s);
// Prüfliste
const pr = [...newNodes.map(n => ({ id: n.id, t: n.t, pruefen: n.pruefen })), ...bestandT3.map(b => ({ id: b.id, t: N[b.id].t, pruefen: b.pruefen }))].filter(x => x.pruefen && x.pruefen.length);
const md = `# Prüfliste Fenster-Welle (generiert 20.08.2026)\n\nAlle Knoten Status generiert. Jede Zeile ist eine Zahl, Norm oder Klasse aus einem T3-Text, die in der Verifikations-Welle gegen Quelle und Stand geprüft werden muss.\n\n` + pr.map(x => `## ${x.id} · ${x.t}\n` + x.pruefen.map(p => `- ${p}`).join('\n')).join('\n\n') + '\n';
writeFileSync('/Users/ben/Documents/AO/docs/pruefliste-bauphysik-licht-2026-08-21.md', md.replace('Fenster-Welle (generiert 20.08.2026)','Welle Bauphysik und Licht (generiert 21.08.2026)'));
console.log('geschrieben. Prüfliste:', pr.length, 'Knoten');
