import { readFileSync, writeFileSync, mkdirSync } from 'fs';
const SP='/private/tmp/claude-501/-Users-ben-Documents-AO/0eddd404-02ba-463f-a048-52d78024291d/scratchpad';
const { N } = await import('/Users/ben/Documents/AO/data.mjs'); for (const k in N) N[k].id=k;
const S = await import(SP+'/struct-kab-eli.mjs');
const OUT=SP+'/gen2'; mkdirSync(OUT,{recursive:true});
const a=Object.values(N); const kids=id=>a.filter(n=>n.pa===id);
const all=Object.values(S.GROUPS).flat();
const bestand=a.filter(n=>n.id.startsWith('kab')&&n.lv>=3&&!n.t3).map(n=>n.id);
const AG={ b1:S.GROUPS.b1_luft, b2:S.GROUPS.b2_waermebruecke, b34:[...S.GROUPS.b3_schlagregen,...S.GROUPS.b4_fuge], b5x:[...S.GROUPS.b5_nassraum, ...bestand.map(id=>({id,bestandT3:true}))], l1:S.GROUPS.l1_tag, l2:S.GROUPS.l2_verh_kunst };
const titleOf=id=>N[id]?N[id].t:((all.find(n=>n.id===id)||{}).t+' (neu, entsteht parallel)');
const nodeDump=id=>{const n=N[id]; if(!n) return null; const o={id,p:n.p,lv:n.lv,pa:n.pa,t:n.t,t1:n.t1}; if(n.t2)o.t2=n.t2; if(n.t3)o.t3=n.t3; return o;};
let shared=readFileSync(SP+'/gen/shared.md','utf8');
const neg=`
## Negativliste aus der fachlichen Gegenlesung der Fenster-Welle (verbindlich)
Diese Fehlerklassen sind in der letzten Welle aufgetreten und werden von der Gegenlesung markiert. Vermeide sie aktiv:
1. Falsche Normzuordnung: Nenne eine Norm nur, wenn du sicher bist, dass sie genau das regelt (Beispiele aus der letzten Welle: Windwiderstandsklasse von Raffstoren steht in EN 13659, nicht EN 13561; punktförmige Wärmebrücken rechnet DIN EN ISO 10211, nicht DIN 4108 Beiblatt 2; sommerlicher Wärmeschutz in Österreich ist OIB-Richtlinie 6, nicht 3). Im Zweifel „nach der einschlägigen Norm" schreiben und die vermutete Norm in "pruefen" nennen.
2. Begriffe: Psi ist längenbezogen, Chi punktbezogen. Verklotzung ist die Lastübertragung der Scheibe im Falz, keine Eckverbindung. Fenster tragen CE-Kennzeichnung mit Leistungserklärung nach DIN EN 14351-1, keine „bauaufsichtliche Zulassung"; Dübel haben eine Europäische Technische Bewertung oder eine allgemeine Bauartgenehmigung.
3. Keine erfundenen Zahlenregeln: keine Maß-, Prozent- oder Kennwerte, die du nicht einer Norm oder einem Regelwerk zuordnen kannst. Lieber die Größe benennen, an der sich etwas entscheidet, und sagen, wer sie festlegt (Systemnachweis, Norm, Fachplaner).
4. DACH: deutsche Regel nie als allgemein. Wenn DE, AT, CH sich unterscheiden (Absturzsicherung, Barrierefreiheit, Schallschutz, Wärmeschutz, Brandschutz, Abdichtungsnormen, LV-Systematik, Denkmalrecht), entweder dach-Feld (wenn in der Aufgabe vorgesehen) oder im Text „je nach Land: in Deutschland …, in Österreich …, in der Schweiz …" mit den jeweiligen Regelwerken (DIN, OIB-Richtlinien und ÖNORM, SIA und VKF).
5. Bautechnische Logik prüfen, bevor du den Satz schreibst: Fensterband nimmt Aussteifung weg und ersetzt sie nicht, jede Öffnung in einer tragenden Wand braucht einen Sturz, fassadenbündig meint die Bekleidungsebene und nicht die Dämmebene, Festverglasung scheidet aus, wenn der zweite Rettungsweg über das Fenster führt, Rollladenkästen zählen im GEG zur Außenwand.
6. Innere Widersprüche zwischen Eltern, Kind und Geschwistern vermeiden: Der Kontext steht in der Aufgabe, lies ihn, bevor du schreibst.
`;
shared=shared.replace('## Längen', neg+'\n## Längen');
writeFileSync(OUT+'/shared.md',shared);
writeFileSync(OUT+'/ids.txt', a.filter(n=>n.lv<=3||/^(kfe|kab|eli|efe)/.test(n.id)).map(n=>`${n.id} [${n.p}${n.lv}] ${n.t}`).join('\n'));
for(const [g,items] of Object.entries(AG)){
  const tasks=items.map(it=>{ if(it.bestandT3){ const n=N[it.id]; return {id:it.id,bestandT3:true,knoten:nodeDump(it.id),eltern:nodeDump(n.pa),geschwister:kids(n.pa).filter(s=>s.id!==it.id).map(s=>({id:s.id,t:s.t})),kinder:kids(it.id).map(s=>({id:s.id,t:s.t,t1:s.t1})), kinderNeu: all.filter(n=>n.pa===it.id).map(n=>({id:n.id,t:n.t,neu:true}))}; }
    const paDump=nodeDump(it.pa)||{id:it.pa,t:titleOf(it.pa),hinweis:'entsteht in derselben Welle'};
    return {id:it.id,p:it.p,lv:it.lv,pa:it.pa,t:it.t,t3:!!it.t3,dach:!!it.dach,hint:it.hint||null,lnKandidaten:(it.ln||[]).map(l=>({id:l,t:titleOf(l)})),eltern:paDump,geschwister:[...kids(it.pa).map(s=>({id:s.id,t:s.t,t1:s.t1})),...all.filter(n=>n.pa===it.pa&&n.id!==it.id).map(n=>({id:n.id,t:n.t,neu:true}))]}; });
  writeFileSync(`${OUT}/task-${g}.json`, JSON.stringify(tasks,null,1)); console.log(g, tasks.length);
}
// Doku aktualisieren
let md=readFileSync('/Users/ben/Documents/AO/docs/struktur-bauphysik-licht.md','utf8');
for(const n of all){ md=md.replace(new RegExp('- '+n.id+' · [^·]*·'), '- '+n.id+' · '+n.t+' ·'); }
md=md.replace('(Redaktion Ben, 21.08.2026)','(21.08.2026; pauschale Freigabe durch Ben, keine Einzelredaktion)');
writeFileSync('/Users/ben/Documents/AO/docs/struktur-bauphysik-licht.md',md); console.log('doc updated, Titel>45:', all.filter(n=>n.t.length>45).length);
