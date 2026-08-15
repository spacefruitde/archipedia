/* Supabase → data.mjs: Supabase ist die führende Datenquelle, data.mjs wird zum Build-Artefakt.
   Zieht alle Knoten aus public.nodes und regeneriert data.mjs (P/ROOTS bleiben wortwörtlich erhalten). */
import { readFileSync, writeFileSync, copyFileSync, unlinkSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ygdorhwlautrfekhvlbd.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_AiQDV_3NA4xqMIiItkxCBg_8ehwGPk-'; // Publishable Key, öffentlich per Design (RLS erlaubt anon-Lesen)

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, 'data.mjs');
const BAK_PATH = DATA_PATH + '.bak';

/* JS-String-Literal in einfachen Anführungszeichen, escaped */
const qs = s => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, '\\n') + "'";

/* Alle Zeilen aus public.nodes holen, paginiert (robust bis mind. 10000 Zeilen) */
async function fetchAllNodes() {
  const pageSize = 1000;
  const rows = [];
  let offset = 0;
  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/nodes?select=*&order=ord.asc&limit=${pageSize}&offset=${offset}`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) throw new Error(`Supabase-Fetch fehlgeschlagen (${res.status}): ${await res.text()}`);
    const page = await res.json();
    rows.push(...page);
    if (page.length < pageSize) break;
    offset += pageSize;
    if (offset > 10000) throw new Error('Abbruch: Pagination-Limit (10000 Zeilen) erreicht');
  }
  return rows;
}

/* Eine DB-Zeile → ein serialisierter Knoten-Block im Stil der bestehenden data.mjs */
function serializeNode(row) {
  const {
    id, perspective: p, level: lv, parent_id: pa, title: t,
    t1, t2, t3, links: ln, sources: src, dach, images,
    status, reviewed_by, reviewed_at,
  } = row;

  const fields = [`t1:${qs(t1)}`];
  if (t2) fields.push(`t2:${qs(t2)}`);
  if (t3) fields.push(`t3:${qs(t3)}`);
  if (ln && ln.length) fields.push(`ln:${JSON.stringify(ln)}`);
  if (src && src.length) fields.push(`src:${JSON.stringify(src)}`);
  if (dach) fields.push(`dach:${JSON.stringify(dach)}`);
  if (images && images.length) fields.push(`images:${JSON.stringify(images)}`);
  if (status && status !== 'generiert') fields.push(`status:${qs(status)}`);
  if (reviewed_by) fields.push(`review:${JSON.stringify({ wer: reviewed_by, wann: reviewed_at })}`);

  const head = `${id}:{p:${qs(p)},lv:${lv}${pa ? `,pa:${qs(pa)}` : ''},t:${qs(t)},`;
  const body = fields.map(f => ' ' + f).join(',\n');
  return `${head}\n${body}},`;
}

async function main() {
  const rows = await fetchAllNodes();
  if (!rows.length) throw new Error('Supabase lieferte keine Knoten – Abbruch ohne Änderung');

  /* Header-Kommentar, P und ROOTS wortwörtlich aus der bestehenden data.mjs übernehmen */
  const current = readFileSync(DATA_PATH, 'utf8');
  const marker = current.indexOf('export const N');
  if (marker === -1) throw new Error('Marker "export const N" nicht in bestehender data.mjs gefunden');
  const header = current.slice(0, marker);

  const body = rows.map(serializeNode).join('\n');
  const next = `${header}export const N = {\n${body}\n};\n`;

  /* Sicherheitsnetz: Backup, schreiben, validieren, ggf. zurückrollen */
  copyFileSync(DATA_PATH, BAK_PATH);
  writeFileSync(DATA_PATH, next);

  try {
    const mod = await import(`${pathToFileURLNoCache(DATA_PATH)}`);
    const { N } = mod;
    const ids = Object.keys(N);
    if (ids.length === 0) throw new Error('N ist leer');
    for (const [id, n] of Object.entries(N)) {
      if (!n.p || !n.lv || !n.t || !n.t1) throw new Error(`Knoten ${id}: p/lv/t/t1 unvollständig`);
      if (n.pa && !N[n.pa]) throw new Error(`Knoten ${id}: Eltern-Knoten ${n.pa} existiert nicht`);
    }
    console.log(`${ids.length} Knoten aus Supabase → data.mjs`);
    unlinkSync(BAK_PATH);
  } catch (err) {
    copyFileSync(BAK_PATH, DATA_PATH);
    unlinkSync(BAK_PATH);
    console.error('Fehler beim Validieren der neuen data.mjs, Backup wiederhergestellt:', err.message);
    process.exit(1);
  }
}

/* Cache-freier dynamischer Import derselben Datei (Node cached ESM-Module per URL) */
function pathToFileURLNoCache(p) {
  return `file://${p}?t=${Date.now()}`;
}

main().catch(err => {
  if (existsSync(BAK_PATH)) { copyFileSync(BAK_PATH, DATA_PATH); unlinkSync(BAK_PATH); }
  console.error('pull-data fehlgeschlagen:', err.message);
  process.exit(1);
});
