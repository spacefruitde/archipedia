import { readFileSync, writeFileSync, existsSync } from 'fs';
const DIR='/private/tmp/claude-501/-Users-ben-Documents-AO/0eddd404-02ba-463f-a048-52d78024291d/scratchpad/gen2';
const DATA='/Users/ben/Documents/AO/data.mjs'; let s=readFileSync(DATA,'utf8');
const { N } = await import(DATA+'?t='+Date.now()); const q=v=>JSON.stringify(v);
let n=0, bad=[]; const pr=[];
for (const g of ['bt2','lt2']) { const f=`${DIR}/out-${g}.json`; if(!existsSync(f)){bad.push('fehlt '+g);continue;}
  for (const o of JSON.parse(readFileSync(f,'utf8'))) { const node=N[o.id]; if(!node){bad.push('unbekannt '+o.id);continue;} if(node.t2){bad.push('hat t2 '+o.id);continue;}
    if(!o.t2||/[–—]/.test(o.t2)||!/Häufigster Fehler/.test(o.t2)||!/Kostenlogik:/.test(o.t2)){bad.push('Regel '+o.id);continue;}
    const m=s.match(new RegExp(`\\n${o.id}:\\{`)); const st=m.index+1; const rest=s.slice(st+1); const m2=rest.match(/\n[A-Za-z0-9_]+:\{|\n\};/); const en=st+1+m2.index+1; let blk=s.slice(st,en);
    blk=blk.replace(/\n t1:([^\n]*)\n/, (mm,line)=> line.endsWith('},') ? `\n t1:${line.slice(0,-2)},\n t2:${q(o.t2)}},\n` : `\n t1:${line}\n t2:${q(o.t2)},\n`);
    if(!/\n t2:/.test(blk)) {bad.push('nicht eingefügt '+o.id);continue;}
    s=s.slice(0,st)+blk+s.slice(en); n++; if(o.pruefen&&o.pruefen.length) pr.push({id:o.id,t:node.t,pruefen:o.pruefen}); } }
writeFileSync(DATA,s);
if(pr.length){ const p='/Users/ben/Documents/AO/docs/pruefliste-bauphysik-licht-2026-08-21.md'; let md=readFileSync(p,'utf8'); md+='\n\n## Nachgelieferte T2 (E2/E3 Bestand)\n\n'+pr.map(x=>`## ${x.id} · ${x.t}\n`+x.pruefen.map(y=>`- ${y}`).join('\n')).join('\n\n')+'\n'; writeFileSync(p,md); }
console.log('t2 eingefügt:',n,'| Probleme:',bad.join(', ')||'keine');
