import { readFileSync, writeFileSync } from 'fs';
const DIR='/private/tmp/claude-501/-Users-ben-Documents-AO/0eddd404-02ba-463f-a048-52d78024291d/scratchpad/gen';
const DATA='/Users/ben/Documents/AO/data.mjs';
const { N } = await import(DATA+'?t='+Date.now());
let s=readFileSync(DATA,'utf8'); const q=v=>JSON.stringify(v);
const ERG=[]; for(const r of ['r1','r2','r3','r4']) ERG.push(...JSON.parse(readFileSync(DIR+'/ergebnis-'+r+'.json','utf8')));
const find=(id,feld,zitatStart)=>{const e=ERG.find(x=>x.id===id); const b=(e.befunde||[]).find(b=>b.feld===feld&&(b.zitat||'').startsWith(zitatStart)); if(!b) throw new Error('Befund fehlt '+id+' '+feld+' '+zitatStart); return b.ersatz;};
const blockRange=id=>{const m=s.match(new RegExp(`\\n${id}:\\{`)); if(!m) throw new Error('Block '+id); const start=m.index+1; const rest=s.slice(start+1); const m2=rest.match(/\n[A-Za-z0-9_]+:\{|\n\};/); return [start,start+1+m2.index+1];};
const setField=(id,field,value)=>{const [st,en]=blockRange(id); let blk=s.slice(st,en); const re=new RegExp(`\\n ${field}:([^\\n]*)\\n`); const m=blk.match(re); if(m){const tail=m[1].endsWith('},')?'},':','; blk=blk.replace(m[0],`\n ${field}:${q(value)}${tail}\n`);} else { const order=['t1','t2','t3','ln','src','dach','images']; const idx=order.indexOf(field); let anchor=null; for(let i=idx-1;i>=0;i--){ if(new RegExp(`\\n ${order[i]}:`).test(blk)){anchor=order[i];break;} } const mm=blk.match(new RegExp(`(\\n ${anchor}:[^\\n]*)\\n`)); if(!mm) throw new Error('anchor '+id); const line=mm[1]; blk=blk.replace(mm[0], line.endsWith('},')?`${line.slice(0,-2)},\n ${field}:${q(value)}},\n`:`${line}\n ${field}:${q(value)},\n`);} s=s.slice(0,st)+blk+s.slice(en);};
const replSentence=(txt,needle,ersatz)=>{const i=txt.indexOf(needle); if(i<0) throw new Error('needle '+needle); const a=txt.lastIndexOf('. ',i); const b=txt.indexOf('. ',i); const start=a<0?0:a+2; const end=b<0?txt.length:b+1; return txt.slice(0,start)+ersatz.replace(/\.?$/,'.')+txt.slice(end);};
// 1, 2: dach für Dichtebenen-Knoten
setField('kfe4dichtinnen','dach',{de:'In Deutschland gelten der Leitfaden zur Montage des RAL-Gütegemeinschaft Fenster und Haustüren als anerkannte Regel der Technik und DIN 4108-7 für die Luftdichtheitsebene.', at:find('kfe4dichtinnen','dach.at','RAL'), ch:find('kfe4dichtinnen','dach.ch','RAL')});
setField('kfe4dichtecke','dach',{de:'In Deutschland folgen Ecken, Stöße und Durchdringungen dem Leitfaden zur Montage der RAL-Gütegemeinschaft und DIN 4108-7 für die Luftdichtheitsebene.', at:find('kfe4dichtecke','dach.at','Detail'), ch:find('kfe4dichtecke','dach.ch','Detail')});
// 3: banksitz dach
setField('kfe4banksitz','dach',{de:find('kfe4banksitz','dach.de','in Konflikt'), at:find('kfe4banksitz','dach.at','in Konflikt'), ch:find('kfe4banksitz','dach.ch','in Konflikt')});
// 4: Uf-Sätze
let t=N.kfe4rahmkunst.t3; if(t.includes('0,9 und 1,3')) { t=replSentence(t,'0,9 und 1,3',find('kfe4rahmkunst','t3','meist zwischen 0,9')); setField('kfe4rahmkunst','t3',t); }
t=N.kfe4rahmalu.t3; if(t.includes('1,0 und 1,4')) t=replSentence(t,'1,0 und 1,4',find('kfe4rahmalu','t3','erreichen Uf-Werte')); if(t.includes('60 und 90')) t=replSentence(t,'60 und 90',find('kfe4rahmalu','t3','liegt bei Standardfenstern')); t=t.replace(/Die Profilbautiefe Die Profilbautiefe[^.]*\.,[^.]*mitbestimmt\./, 'Die Profilbautiefe richtet sich nach Systemaufbau und Statik, bei großformatigen Pfosten-Riegel- oder Hebeschiebeelementen liegt sie deutlich höher als beim Standardfenster.'); if(/Die Profilbautiefe Die/.test(t)) throw new Error('rahmalu Satz'); setField('kfe4rahmalu','t3',t);
// 5: fixreinigung t3 neu
setField('kfe5fixreinigung','t3',find('kfe5fixreinigung','t3',''));
// 6: klappladen dach-Satz vor 'Ab hier'
t=N.kfe4klappladen.t3; const kl=find('kfe4klappladen','t3','nach den Windlastregeln'); if(!t.includes('Österreich')) t=t.replace(/\s*Ab hier:/, ' '+kl.replace(/\.?$/,'.')+' Ab hier:'); setField('kfe4klappladen','t3',t);
// 7: efe3sitz dach-Satz anhängen
t=N.efe3sitz.t2; const es=find('efe3sitz','t2','im Abgleich mit der zulässigen'); if(!t.includes('unterschiedlich geregelt')) t=t.replace(/\s*Kostenlogik:/, ' '+es.replace(/\.?$/,'.')+' Kostenlogik:'); setField('efe3sitz','t2',t);
if(/[–—]/.test([N.kfe4dichtinnen,N.kfe4dichtecke].map(()=>'').join('')+s.slice(s.indexOf('kfe1:{')))) console.log('WARN Gedankenstrich im k-Bereich');
writeFileSync(DATA,s); console.log('manual ok');
