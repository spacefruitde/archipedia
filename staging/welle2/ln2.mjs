import { readFileSync, writeFileSync } from 'fs';
const DATA='/Users/ben/Documents/AO/data.mjs'; let s=readFileSync(DATA,'utf8');
const { N } = await import(DATA+'?t='+Date.now());
const ADD = {
  kab3luftdicht:['kfe4dichtinnen','kiw1'], kab3dampfbremse:['kda1','kbe1'], kab3konstruktiv:['kfa1','kfe4montagewand'], kab3geometrisch:['kfe6tau','kda3attika'], kab3vermeidung:['pna3nachweis','kfe6psi'], kab3fassade:['kfa1','kfe4dichtaussen'], kab3sockel:['kgr3sockel','kau3sockelanschl'], kab3bewegungsfuge:['kfa1','kbo2sockel'], kab3abdichtfuge:['kfe4dichtaussen','kbo1'], kab3anschlussfuge:['kfe3raldicht','kiw1'], kab3feuchtraum:['ktg1','kbo1'],
  kfe4dichtinnen:['kab4luftfenster'], kfe4dichtecke:['kab4luftstoss'], kfe3raldicht:['kab4anschlussfenster'], kfe4montagewand:['kab4wbfenster'], kfe3daemmkeil:['kab4wbfenster'], kfe6tau:['kab4isothermen'], kfe6psi:['kab4psichi'], kfe4bankmontage:['kab4anschlussunten'], kfe5hsschwelle:['kab4bodentief'], kfe4laibaussen:['kab4sockelwdvs'], kfe4dichtaussen:['kab4anschlussseite'], kfe4dichtmitte:['kab4anschlussfenster'], kfe4sommer:['eli4sonnenstand'], kfe4gwert:['eli4orientierung'], efe3ecke:['eli4eckfenster'], efe2laibung:['eli4laibungfarbe'], efe3laibtief:['eli4laibungfarbe'], efe2format:['eli4liegend'], kfe4fix:['eli4lichtband'], kda3attika:['kab4attika'], kgr3waermebr:['kab4wbsockel'], kgr2perim:['kab4sockelwdvs'], kfa3befestvhf:['kab4fassfuge'], kiw1:['kab4anschlusstrocken'], ktg1:['kab4luftdurch','eli4schichten'], pna3nachweis:['kab4nachweis'], kbo1:['kab4dusche'], ema3licht:['eli4lichtfarbe'], erp1:['eli4raumtiefe'], eer1:['eli4durchblick'], kde1:['eli4voute'],
};
const q=v=>JSON.stringify(v); let done=0, skipped=[];
for (const [id, add] of Object.entries(ADD)) {
  if(!N[id]) { skipped.push('fehlt '+id); continue; }
  for (const t of add) if (!N[t]) throw new Error(`Ziel fehlt: ${t}`);
  const have=N[id].ln||[]; const ln=Array.from(new Set([...have, ...add])).slice(0,4);
  if (ln.length===have.length && add.every(x=>have.includes(x))) continue;
  if (ln.length===4 && !add.every(x=>ln.includes(x))) skipped.push(id+' voll');
  const m=s.match(new RegExp(`\\n${id}:\\{`)); if(!m) throw new Error('Block '+id);
  const start=m.index+1; const rest=s.slice(start+1); const m2=rest.match(/\n[A-Za-z0-9_]+:\{|\n\};/); const end=start+1+m2.index+1; let blk=s.slice(start,end);
  if (/\n ln:/.test(blk)) blk=blk.replace(/\n ln:\[[^\]]*\]/, `\n ln:${q(ln)}`);
  else { const key=/\n t3:/.test(blk)?' t3:':(/\n t2:/.test(blk)?' t2:':' t1:'); blk=blk.replace(new RegExp(`(\\n${key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}[^\\n]*)\\n`),(mm,line)=>{ if(line.endsWith('},')) return `${line.slice(0,-2)},\n ln:${q(ln)}},\n`; if(line.endsWith(',')) return `${line}\n ln:${q(ln)},\n`; throw new Error('Zeile '+id);}); if(!/\n ln:/.test(blk)) throw new Error('ln fehlt '+id); }
  s=s.slice(0,start)+blk+s.slice(end); done++;
}
writeFileSync(DATA,s); console.log('ln gesetzt:',done,'| übersprungen:',skipped.join(', ')||'keine');
