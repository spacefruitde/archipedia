import { writeFileSync } from 'fs';
import { N } from './data.mjs';
const q = s => s == null ? 'NULL' : "'" + String(s).replace(/'/g, "''") + "'";
const rows = Object.entries(N).map(([id, n], i) => {
  const links = n.ln && n.ln.length ? `ARRAY[${n.ln.map(q).join(',')}]::text[]` : `'{}'::text[]`;
  const src = n.src ? q(JSON.stringify(n.src)) + '::jsonb' : `'[]'::jsonb`;
  const dach = n.dach ? q(JSON.stringify(n.dach)) + '::jsonb' : 'NULL';
  const imgs = n.images && n.images.length ? q(JSON.stringify(n.images)) + '::jsonb' : `'[]'::jsonb`;
  return `(${q(id)},${q(n.p)},${n.lv},${q(n.pa ?? null)},${q(n.t)},${q(n.t1)},${q(n.t2 ?? null)},${q(n.t3 ?? null)},${links},${src},${dach},${imgs},${i + 1})`;
});
// Batches à 15 Zeilen
const batches = [];
for (let i = 0; i < rows.length; i += 15) {
  batches.push(`insert into public.nodes (id,perspective,level,parent_id,title,t1,t2,t3,links,sources,dach,images,ord) values\n${rows.slice(i, i+15).join(',\n')};`);
}
writeFileSync('seed_all.sql', batches.join('\n'));
console.log(rows.length + ' Zeilen in ' + batches.length + ' Batches → seed_all.sql');
