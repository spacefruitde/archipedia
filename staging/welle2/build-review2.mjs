import { readFileSync, writeFileSync } from 'fs';
const DIR='/private/tmp/claude-501/-Users-ben-Documents-AO/0eddd404-02ba-463f-a048-52d78024291d/scratchpad/gen2';
const { N } = await import('/Users/ben/Documents/AO/data.mjs?t='+Date.now());
const R={ w2r1:['b1','b2'], w2r2:['b34','b5'], w2r3:['bx','bt2'], w2r4:['l1','lt2'], w2r5:['l2'] };
let total=0;
for(const [r,gs] of Object.entries(R)){ const items=[];
  for(const g of gs){ const out=JSON.parse(readFileSync(`${DIR}/out-${g}.json`,'utf8'));
    for(const o of out){ const n=N[o.id]; if(!n){console.log('fehlt',o.id);continue;} const bestand=!o.t1; const umfang = o.t1 ? 't1, t2, t3, dach' : (o.t2 && o.t3 ? 't2 und t3 (neu), t1 nur Kontext' : o.t2 ? 't2 (neu), t1 nur Kontext' : 't3 (neu) und t2 (ebenfalls neu, von anderem Agenten), t1 nur Kontext'); const seen=items.find(x=>x.id===o.id); if(seen){ seen.pruefUmfang='t2 und t3 (beide neu), t1 nur Kontext'; seen.pruefen=[...seen.pruefen,...(o.pruefen||[])]; continue; } items.push({id:o.id,p:n.p,lv:n.lv,t:n.t,eltern:n.pa?{id:n.pa,t:N[n.pa].t}:null,pruefUmfang:umfang,t1:n.t1,t2:n.t2,t3:n.t3||null,dach:n.dach||null,pruefen:o.pruefen||[]}); } }
  writeFileSync(`${DIR}/review-${r}.json`, JSON.stringify(items,null,1)); total+=items.length; console.log(r,items.length); }
console.log('total',total);
