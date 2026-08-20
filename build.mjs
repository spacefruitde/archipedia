import { writeFileSync, mkdirSync, readFileSync, existsSync, cpSync } from 'fs';
import * as D from './data.mjs';
const { P, N, ROOTS } = D;
const THREADS = D.THREADS || [];

/* Rückverweise: wer zeigt auf diesen Knoten? */
const BACK = {};
for (const [id, n] of Object.entries(N)) for (const l of n.ln || []) (BACK[l] ||= []).push(id);

/* Bilder im Teilbaum (für die Markierung in der Navigation) */
const IMGCACHE = {};
const imgsIn = id => {
  if (id in IMGCACHE) return IMGCACHE[id];
  let n = (N[id].images || []).length;
  for (const [kid, kn] of Object.entries(N)) if (kn.pa === id) n += imgsIn(kid);
  return IMGCACHE[id] = n;
};

/* Maximale Tiefe im Teilbaum („bis Ebene X") */
const LVCACHE = {};
const maxLv = id => {
  if (id in LVCACHE) return LVCACHE[id];
  let m = N[id].lv;
  for (const [kid, kn] of Object.entries(N)) if (kn.pa === id) m = Math.max(m, maxLv(kid));
  return LVCACHE[id] = m;
};

/* Thread-Zugehörigkeit je Knoten */
const THREADPOS = {};
THREADS.forEach((th, ti) => th.ids.forEach((id, i) => (THREADPOS[id] ||= []).push({ ti, i })));

const DEPTHS = [['t1','Überblick'],['t2','Vertiefung'],['t3','Spezifikation']];
const LVNAME = {1:'Themenfeld',2:'Hauptgruppe',3:'Thema',4:'Variante',5:'Komponente',6:'Eigenschaft',7:'Ausschreibungsdetail'};
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const kidsOf = id => Object.entries(N).filter(([,n]) => n.pa === id).map(([k]) => k);
const pathOf = id => { const p=[]; let c=id; while(c){p.unshift(c); c=N[c].pa;} return p; };
/* Perspektivfarben: gedeckte Notation nach Redesign „Papier & Graphit" */
const colOf = p => p==='k' ? '#343A3C' : p==='e' ? '#B7502C' : p==='p' ? '#46586E' : '#57694F';
const sq = p => `<span class="sq" style="background:${colOf(p)}"></span>`;

/* Satz-Extraktion aus T2: „Kostenlogik: …" und „Häufigster Fehler …" */
const satzAb = (txt, marker) => {
  if (!txt) return null;
  const i = txt.indexOf(marker);
  if (i < 0) return null;
  const rest = txt.slice(i);
  const ende = rest.indexOf('. ');
  return (ende < 0 ? rest : rest.slice(0, ende + 1)).trim();
};
const kostenVon = n => { const s = satzAb(n.t2, 'Kostenlogik:'); return s ? s.replace(/^Kostenlogik:\s*/, '') : null; };
const fehlerVon = n => satzAb(n.t2, 'Häufigster Fehler');

/* Quellen-Typ (Heuristik für das Tag rechts) */
const srcTyp = t =>
  /Gesetz|Verordnung|BauO|LBO|GEG|HOAI|BGB|MBO|BauGB/i.test(t) ? 'Recht'
  : /Richtlinie|OIB|VDI|MuKEn|VKF/.test(t) ? 'Richtlinie'
  : /\bDIN\b|\bEN\b|ÖNORM|ONORM|SIA \d|\bISO\b/.test(t) ? 'Norm'
  : /Leitfaden|Merkblatt/i.test(t) ? 'Leitfaden'
  : /ift|Institut|Rosenheim|Verband|DBV|Gütegemeinschaft/i.test(t) ? 'Institut'
  : 'Quelle';
const srcKurz = t => t.split(/ [—–] |: | \(/)[0].trim();

function netzSVG(id){
  const n = N[id];
  const nodes = [{id, x:0, y:0, c:true}];
  if (n.pa) nodes.push({id:n.pa, x:0, y:-132});
  /* Kinder: ALLE zeigen; ab 6 Stück versetzt in zwei Zeilen, damit die Beschriftungen nicht kollidieren */
  const kids = kidsOf(id);
  const zickzack = kids.length > 5;
  kids.forEach((k,i)=>{ const step=440/Math.max(kids.length,2);
    nodes.push({id:k, x:(i-(kids.length-1)/2)*step, y: zickzack ? (i%2 ? 200 : 132) : 144}); });
  /* rechts: ausgehende Querverweise · links: eingehende. Bis 6 je Seite, darüber Zähler. */
  const rausAlle = (n.ln||[]).filter(l=>N[l] && !nodes.some(m=>m.id===l));
  const reinAlle = (BACK[id]||[]).filter(l=>N[l] && !nodes.some(m=>m.id===l));
  const seite = (alle) => alle.length > 6 ? { zeig: alle.slice(0,5), rest: alle.length-5 } : { zeig: alle, rest: 0 };
  const raus = seite(rausAlle), rein = seite(reinAlle);
  raus.zeig.forEach((l,i)=>nodes.push({id:l, x:150, y:-86+i*64, xl:true}));
  rein.zeig.forEach((l,i)=>nodes.push({id:l, x:-150, y:-86+i*64, xl:true}));
  /* Höhe an den Inhalt anpassen */
  const seitZeilen = Math.max(raus.zeig.length + (raus.rest?1:0), rein.zeig.length + (rein.rest?1:0));
  const seitUnten = seitZeilen ? -86 + (seitZeilen-1)*64 + 40 : 0;
  const kidsUnten = kids.length ? (zickzack ? 200 : 144) + 40 : 0;
  const unten = Math.max(seitUnten, kidsUnten, 0);
  const W=480, H=190+unten+42, cx=W/2, cy=176;
  const mehr = (r, x) => r.rest ? `<text x="${cx+x}" y="${cy-86+r.zeig.length*64+4}" text-anchor="middle" font-size="10.5" fill="#8B867E">+${r.rest} weitere</text>` : '';
  /* Beschriftung: zentriert, Zeilenumbruch; Zentrum darf drei Zeilen */
  const zeilenOf = (t, max) => {
    const zeilen = ['']; let z = 0;
    for (const w of t.split(' ')) {
      if ((zeilen[z] + ' ' + w).trim().length > 19 && zeilen[z]) { if (z === max-1) { zeilen[z] = zeilen[z].slice(0,17).trim() + '…'; return zeilen; } zeilen[++z] = w; }
      else zeilen[z] = (zeilen[z] + ' ' + w).trim();
    }
    return zeilen;
  };
  const wrap = (zeilen, x, y, ctr) =>
    `<text x="${x}" y="${y}" text-anchor="middle" ${ctr?'class="ctr"':''}>${zeilen.map((s,i)=>`<tspan x="${x}" dy="${i?12.5:0}">${esc(s)}</tspan>`).join('')}</text>`;
  const edges = nodes.filter(m=>!m.c).map(m=>{
    const dash = m.xl ? 'stroke-dasharray="4 4"' : '';
    const col = m.xl ? colOf(N[m.id].p) : '#C9C3B7';
    return `<line x1="${cx}" y1="${cy}" x2="${cx+m.x}" y2="${cy+m.y}" stroke="${col}" stroke-width="1.2" ${dash} opacity="${m.xl?0.55:1}"/>`;
  }).join('');
  const circles = nodes.map(m=>{
    const col = colOf(N[m.id].p);
    const oben = m.id === n.pa || m.c; /* Eltern und Zentrum: Beschriftung über dem Knoten */
    const zeilen = zeilenOf(N[m.id].t, m.c ? 3 : 2);
    const ty = oben ? cy+m.y-(m.c?23:20)-12.5*(zeilen.length-1) : cy+m.y+20;
    const inner = `<circle cx="${cx+m.x}" cy="${cy+m.y}" r="${m.c?13:8}" fill="${m.c?col:'#FBFAF8'}" stroke="${col}" stroke-width="2"/>${wrap(zeilen, cx+m.x, ty, m.c)}`;
    return m.c ? `<g>${inner}</g>` : `<a href="#${m.id}">${inner}</a>`;
  }).join('');
  const lgd = (rein.zeig.length?`<text x="8" y="${H-8}" font-size="10" fill="#8B867E">← verweist hierher</text>`:'')+(raus.zeig.length?`<text x="${W-8}" y="${H-8}" font-size="10" fill="#8B867E" text-anchor="end">verweist auf →</text>`:'');
  return `<svg viewBox="0 0 ${W} ${H}">${edges}${circles}${mehr(rein,-150)}${mehr(raus,150)}${lgd}</svg>`;
}

/* Kicker: Perspektive · Ebenen-Balken · Label */
const ebenenBalken = lv => {
  const H = [6,7,8,9,10,11,12];
  return `<span class="ebar">${[1,2,3,4,5,6,7].map(i =>
    `<i style="height:${i<=lv?15:H[i-1]}px${i<=lv?';background:var(--ink)':''}"></i>`).join('')}</span>`;
};
const kicker = n => `<div class="kick">
  <span class="kp">${sq(n.p)}${P[n.p].name}</span>
  <span class="kdiv"></span>
  ${ebenenBalken(n.lv)}
  <span class="klbl">Ebene ${n.lv} von 7 — ${LVNAME[n.lv]}</span>
</div>`;

/* Meta-Zeile unter Kind-/Themenfeld-Titeln */
const kidMeta = id => {
  const teile = [`bis Ebene ${maxLv(id)}`];
  const k = kidsOf(id).length; if (k) teile.push(`${k} Unterthemen`);
  const b = imgsIn(id); if (b) teile.push(`${b} Bild${b>1?'er':''}`);
  return teile.join(' · ');
};

function nodeSection(id){
  const n = N[id], pp = P[n.p];
  const path = pathOf(id);
  const crumbs = [`<a href="#home">Start</a>`]
    .concat(path.map((pid,i)=> i===path.length-1
      ? `<span class="here">${esc(N[pid].t)}</span>`
      : `<a href="#${pid}">${esc(N[pid].t)}</a>`))
    .join('<span class="sep">/</span>');

  /* Linke Leiste: Geschwister im Ast (bei Ebene 1: alle Themenfelder der Perspektive) */
  const geschwister = n.lv === 1
    ? ROOTS.filter(([rid]) => N[rid].p === n.p).map(([rid]) => rid)
    : kidsOf(n.pa);
  const railTitel = n.lv === 1 ? pp.name : N[n.pa].t;
  const railL = `<aside class="rail rail-l"><div class="rail-h">${sq(n.p)}${esc(railTitel)}</div>${
    geschwister.map(g => `<a class="rl-row${g===id?' on':''}" href="#${g}"><span>${esc(N[g].t)}</span><span class="num">${kidsOf(g).length||''}</span></a>`).join('')
  }</aside>`;

  /* Lesetiefen */
  let depths = `<p class="lead">${esc(n.t1)}</p>`;
  for (const [d,label] of DEPTHS.slice(1)) {
    if (n[d]) depths += `<details class="depth"><summary>${label} <span class="chev">▾</span></summary><div class="dbody">${esc(n[d])}${d==='t3'?'<p class="unchecked">Status: KI-generiert, noch nicht fachgeprüft.</p>':''}</div></details>`;
  }
  if (!n.t3 && n.lv>=3 && n.p!=='k') {
    depths += `<p class="nohint">Keine Stufe „Spezifikation": Entwurfs- und Kontextwissen endet hier bewusst mit dem Querverweis in die Konstruktions-Perspektive.</p>`;
  }

  /* Bilder: eigene Zeichnungen im Papier-Kasten, Fotos frei stehend */
  let imgHTML = '';
  if (n.images && n.images.length) {
    imgHTML = n.images.map(im => {
      let inhalt = '';
      if (im.u) inhalt = `<img src="${im.u}" alt="${esc(im.caption || '')}" loading="lazy">`;
      else if (im.path && existsSync(im.path)) inhalt = readFileSync(im.path, 'utf8').replace(/<\?xml[^>]*\?>\s*/, '');
      else return '';
      const quelle = im.quelle ? ` · <a href="${im.quelle}" target="_blank" rel="noopener">Quelle ↗</a>` : '';
      return `<figure class="zeichnung${im.u ? ' foto' : ''}">${inhalt}<figcaption><span class="cap">${esc(im.caption || '')}</span><span class="credit">${esc(im.credit || '')}${im.lizenz ? ' · ' + esc(im.lizenz) : ''}${quelle}</span></figcaption></figure>`;
    }).join('');
  }

  /* DACH-Besonderheiten (Klassen bleiben: das Länder-Skript hängt daran) */
  let dachHTML = '';
  if (n.dach) {
    const row = (cc,label,txt)=> txt?`<div class="dach-row dr-${label}"><span class="cc">${cc}</span><span>${esc(txt)}</span></div>`:'';
    dachHTML = `<div class="dach"><p class="sec-title">DACH: nationale Besonderheiten</p>${row('DE','de',n.dach.de)}${row('AT','at',n.dach.at)}${row('CH','ch',n.dach.ch)}<p class="dach-hint" hidden></p></div>`;
  }

  /* Normen & Quellen */
  let srcHTML = '';
  if (n.src && n.src.length) {
    srcHTML = `<div class="srcbox"><p class="sec-title">Normen und Quellen</p>${
      n.src.map(s=>{
        const stand = s.stand ? `<span class="stand">Stand: ${esc(s.stand)}</span>` : '';
        const body = s.u ? `<a href="${s.u}" target="_blank" rel="noopener">${esc(s.t)} ↗</a>` : esc(s.t);
        return `<div class="src-row"><span>${body}${stand}</span><span class="typ">${srcTyp(s.t)}</span></div>`;
      }).join('')
    }<p class="srcnote">Im Projekt stets aktuelle Fassung und Landesrecht prüfen; Angaben ohne Stand sind noch nicht quellengeprüft.</p></div>`;
  }

  /* Tiefer eintauchen */
  const kids = kidsOf(id);
  const kidsHTML = kids.length
    ? `<div class="section"><div class="sec-head"><span class="sec-title">Ebene ${Math.min(n.lv+1,7)} — Tiefer eintauchen</span><span class="sec-n">${kids.length} ${kids.length===1?'Feld':'Felder'}</span></div><div class="raster">${
        kids.map(k=>`<a class="child" href="#${k}"><span><span class="ct">${esc(N[k].t)}</span><small>${kidMeta(k)}</small></span><span class="arr">→</span></a>`).join('')
      }</div></div>`
    : (n.p === 'k' && !n.t3
        ? `<p class="endnote">Vertiefung und Spezifikation zu diesem Thema folgen.</p>`
        : '');

  /* Entdeckungs-Threads */
  let threadHTML = '';
  if (THREADPOS[id]) {
    threadHTML = THREADPOS[id].map(({ti,i})=>{
      const th = THREADS[ti];
      const prev = i > 0 ? th.ids[i-1] : null, next = i < th.ids.length-1 ? th.ids[i+1] : null;
      return `<div class="thread"><p class="sec-title">Entdeckungs-Thread · ${esc(th.titel)} · Station ${i+1}/${th.ids.length}</p><div class="th-row">${
        prev ? `<a class="th-nav" href="#${prev}">‹ ${esc(N[prev].t)}</a>` : '<span></span>'}${
        next ? `<a class="th-nav th-next" href="#${next}">${esc(N[next].t)} ›</a>` : '<span class="th-ende">Ende des Threads</span>'}</div></div>`;
    }).join('');
  }

  /* Rechte Leiste: Kostenlogik · Quer einsteigen · Normenbezug · Häufigster Fehler · Netz */
  const kosten = kostenVon(n), fehler = fehlerVon(n);
  const links = (n.ln||[]).filter(l=>N[l]);
  const verb = (n.ln||[]).filter(l=>N[l]).length + (BACK[id]||[]).length + kids.length + (n.pa?1:0);
  const mini = `<div class="rr-b"><div class="rail-h">Netzansicht</div><div class="netzmini">
    <span class="nm-c" style="background:${colOf(n.p)}"></span>
    <span class="nm-s" style="left:18%;top:22%"></span><span class="nm-s" style="left:78%;top:30%"></span>
    <span class="nm-s" style="left:26%;top:74%"></span><span class="nm-s" style="left:70%;top:70%"></span>
    <span class="nm-s" style="left:46%;top:12%"></span>
    <span class="nm-t">${verb} Verbindung${verb===1?'':'en'}</span></div></div>`;
  const railR = `<aside class="rail rail-r">${
    kosten ? `<div class="rr-b pull"><div class="pull-h">Kostenlogik</div><div class="pull-t">${esc(kosten)}</div></div>` : ''}${
    links.length ? `<div class="rr-b"><div class="rail-h">Quer einsteigen</div>${links.map(l=>`<a class="rr-row" href="#${l}">${sq(N[l].p)}<span>${esc(N[l].t)}</span></a>`).join('')}</div>` : ''}${
    n.src && n.src.length ? `<div class="rr-b"><div class="rail-h">Normenbezug</div><div class="rr-mono">${n.src.map(s=>esc(srcKurz(s.t))).join('<br>')}</div></div>` : ''}${
    fehler ? `<div class="rr-b"><div class="rail-h">Häufigster Fehler</div><div class="rr-serif">${esc(fehler)}</div></div>` : ''}${
    mini}</aside>`;

  return `<section id="${id}" class="pp-${n.p}">
  <div class="crumbbar"><nav class="shell crumbs">${crumbs}</nav></div>
  <div class="shell g3">
  ${railL}
  <article>
  ${kicker(n)}
  <h1 class="node${n.lv===1?' gross':''}">${esc(n.t)}</h1>
  <div class="content">${depths}</div>
  ${imgHTML}${dachHTML}${kidsHTML}${srcHTML}${threadHTML}
  <details class="netz"><summary>Netz-Ansicht <span class="chev">▾</span></summary>
    <div class="netzbox">${netzSVG(id)}</div>
    <p class="netz-note">Durchgezogen: Hierarchie (oben Eltern, unten Kinder) · Gestrichelt: Querverweise. Antippen zum Navigieren.</p>
  </details>
  </article>
  ${railR}
  </div>
</section>`;
}

/* Perspektiven als Einstiegsebene */
const PDESC = {
  k: 'Das Bauteilwissen — vom Themenfeld bis zum Ausschreibungsdetail.',
  e: 'Die gestalterische Absicht — Licht, Öffnung, Proportion, Haltung.',
  x: 'Ort, Bestand und Recht — was das Grundstück vorgibt.',
  p: 'Leistungsphasen, Vergabe, Ausführung — wer wann entscheidet.'
};
const PDESCLANG = {
  k: 'Das Bauteilwissen: vom Themenfeld bis zum Ausschreibungsdetail, so tief wie das Thema es verlangt.',
  e: 'Das gestalterische Wissen: Entwurfsfragen quer zu den Bauteilen, von der Proportion bis zur Fügung.',
  x: 'Das Referenzwissen: Fallstudien und Haltungen, vom Städtebau bis zum Türgriff erschlossen.',
  p: 'Das Berufswissen: Ablauf, Honorar, Recht, Kosten und Vergabe, immer im Vergleich DE, AT, CH.'
};
const PORDER = ['k','e','x','p'];
const perspRoots = p => ROOTS.filter(([id]) => N[id].p === p);

/* Startseite */
const leitFoto = (N.kfe1 && (N.kfe1.images||[]).find(i=>i.u)) || null;
const themaDerWoche = THREADS[0] || null;
const perspStrip = `<div class="pstrip">${PORDER.map((p,i)=>`<a class="ps" href="#persp-${p}">
  <span class="ps-k">${sq(p)}0${i+1}</span>
  <span class="ps-t">${P[p].name}</span>
  <span class="ps-d">${esc(PDESC[p])}</span></a>`).join('')}</div>`;

const threadRows = THREADS.map((th,i)=>`<a class="throw" href="#${th.ids[0]}">
  <span class="th-n">0${i+1}</span>
  <span><span class="th-t">${esc(th.titel)}</span><span class="th-d">${esc(th.kurz)}</span></span>
  <span class="th-s"><span class="th-sc">${th.ids.length} Stationen</span>${th.ids.map(x=>esc((N[x]||{t:x}).t)).join('<br>')}</span></a>`).join('');

const home = `<section id="home">
  <div class="shell">
  <div class="hero">
    <div>
      <p class="kickline">Wissensraum Architektur · DACH</p>
      <h1 class="display">Ein Wissensraum.<br>Vier Perspektiven.<br><em>Jede Tiefe.</em></h1>
    </div>
    <div class="hero-r">
      <p class="hero-p">Vom Themenfeld bis zur Ausschreibungsposition — dieselbe Sache, sieben Auflösungen. Sie steigen ein, wo Ihre Frage liegt, und gehen so tief, wie das Detail es verlangt.</p>
      <div class="fakten">
        <div><span>Perspektiven</span><span>4</span></div>
        <div><span>Tiefen-Ebenen</span><span>7</span></div>
        <div><span>Themen</span><span>${Object.keys(N).length}</span></div>
        <div><span>Normenbezug</span><span>DIN · SIA · ÖNORM</span></div>
      </div>
    </div>
  </div>
  ${perspStrip}
  ${leitFoto && themaDerWoche ? `<a class="leit" href="#${themaDerWoche.ids[0]}"><img src="${leitFoto.u.replace('w=900','w=1600')}" alt="${esc(leitFoto.caption||'')}" loading="lazy"></a>
  <div class="leitzeile"><span>Thema der Woche — ${esc(themaDerWoche.titel)}</span><span>${esc(leitFoto.credit||'')}</span></div>` : ''}
  <div class="threads">
    <div class="threads-h"><h2>Kuratierte Threads</h2><span class="th-i">quer durch die Perspektiven</span></div>
    ${threadRows}
  </div>
  </div>
  <footer><div class="shell frow"><span>ArchiPedia — Prototyp · Inhalte KI-generiert, nicht fachgeprüft</span><span>Stand 08/2026 · Normbezüge ohne Gewähr</span></div></footer>
</section>`;

/* Perspektiv-Seiten: Index der Themenfelder */
const perspSections = PORDER.map(p => `<section id="persp-${p}">
  <div class="crumbbar"><nav class="shell crumbs"><a href="#home">Start</a><span class="sep">/</span><span class="here">${P[p].name}</span></nav></div>
  <div class="shell pcol">
  <div class="kick"><span class="kp">${sq(p)}Perspektive</span></div>
  <h1 class="node gross">${P[p].name}</h1>
  <p class="lead">${esc(PDESCLANG[p])}</p>
  <div class="section"><div class="sec-head"><span class="sec-title">Ebene 1 — Themenfelder</span><span class="sec-n">${perspRoots(p).length} Felder</span></div>${
    perspRoots(p).map(([id,desc])=>`<a class="child pfeld" href="#${id}"><span><span class="ct">${esc(N[id].t)}</span><small>${kidMeta(id)}</small><span class="pdesc">${esc(desc)}</span></span><span class="arr">→</span></a>`).join('')
  }</div>
  </div>
</section>`).join('\n');

/* Index-Menü: alle Themenfelder, nach Perspektive gruppiert */
const menu = `<details class="menu"><summary>Index ⌘K</summary><div class="menu-panel">${
  PORDER.map(p => `<p class="menu-h"><a href="#persp-${p}">${sq(p)}${P[p].name}</a></p>${
    perspRoots(p).map(([id]) => `<a class="menu-a" href="#${id}">${esc(N[id].t)}</a>`).join('')
  }`).join('')
}</div></details>`;

const sections = home + perspSections + Object.keys(N).map(nodeSection).join('\n');

/* Suchindex: id, Titel, Perspektive, Elterntitel, Überblick (klein) */
const SUCHINDEX = JSON.stringify(Object.entries(N).map(([id, n]) => [id, n.t, n.p, n.pa ? N[n.pa].t : '', (n.t1 || '').toLowerCase()]));

const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ArchiPedia · Navigations-Prototyp</title>
<style>
  @font-face{font-family:'Archivo';src:url(fonts/Archivo-var.woff2) format('woff2');font-weight:100 900;font-display:swap}
  @font-face{font-family:'Newsreader';src:url(fonts/Newsreader-var.woff2) format('woff2');font-weight:200 800;font-style:normal;font-display:swap}
  @font-face{font-family:'Newsreader';src:url(fonts/Newsreader-italic-var.woff2) format('woff2');font-weight:200 800;font-style:italic;font-display:swap}
  @font-face{font-family:'IBM Plex Mono';src:url(fonts/IBMPlexMono-400.woff2) format('woff2');font-weight:400;font-display:swap}
  @font-face{font-family:'IBM Plex Mono';src:url(fonts/IBMPlexMono-500.woff2) format('woff2');font-weight:500;font-display:swap}
  :root{
    --bg:#F4F2ED; --panel:#FBFAF8; --ink:#1A1917; --body:#33312D; --sec:#55524C; --muted:#8B867E; --faint:#A9A39A;
    --line:#DAD5CB; --bar:#C9C3B7; --accent:#B7502C;
    --sans:'Archivo',-apple-system,BlinkMacSystemFont,sans-serif;
    --serif:'Newsreader',Georgia,serif;
    --mono:'IBM Plex Mono',ui-monospace,SFMono-Regular,monospace;
  }
  [data-theme="dark"]{
    --bg:#191816; --panel:#201E1C; --ink:#EAE7E1; --body:#D6D1C7; --sec:#B5AFA4; --muted:#8B867E; --faint:#6E6961;
    --line:#37342F; --bar:#4A463F; --accent:#D07A50;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--bg);color:var(--ink);font:16px/1.6 var(--sans)}
  a{color:inherit;text-decoration:none}
  .shell{max-width:1400px;margin:0 auto;padding:0 40px}
  .sq{display:inline-block;width:6px;height:6px;flex:none}
  /* Kopf */
  header{background:var(--bg);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:20}
  .hrow{display:flex;align-items:center;justify-content:space-between;gap:28px;padding:18px 40px;flex-wrap:wrap}
  .wordmark{font-size:23px;font-weight:700;letter-spacing:-.035em}
  .wordmark span{font-family:var(--mono);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-left:12px;font-weight:400;vertical-align:2px}
  .topnav{display:flex;align-items:center;gap:24px;font-family:var(--mono);font-size:11px;letter-spacing:.13em;text-transform:uppercase;flex-wrap:wrap}
  .topnav a{display:flex;align-items:center;gap:7px;color:var(--sec);padding-bottom:3px;border-bottom:2px solid transparent}
  .topnav a:hover{color:var(--ink)}
  .hctl{display:flex;align-items:center;gap:20px;flex-wrap:wrap}
  .such{position:relative}
  .such input{width:150px;background:transparent;border:0;border-bottom:1px solid var(--faint);padding:5px 0;font-family:var(--mono);font-size:12px;color:var(--ink);outline:none}
  .such input:focus{border-bottom-color:var(--ink)}
  .such-panel{position:absolute;right:0;top:calc(100% + 10px);background:var(--panel);border:1px solid var(--ink);width:min(84vw,400px);max-height:64vh;overflow:auto;z-index:40}
  .such-t{display:block;padding:10px 14px;border-bottom:1px solid var(--line)}
  .such-t:hover{background:var(--bg)}
  .such-p{display:inline-block;font-family:var(--mono);font-size:9px;letter-spacing:.16em;text-transform:uppercase;margin-right:8px;color:var(--muted)}
  .such-titel{font-size:14px;font-weight:600}
  .such-pfad{display:block;font-family:var(--mono);font-size:10px;color:var(--muted);margin-top:2px}
  .such-leer{padding:12px 14px;font-family:var(--mono);font-size:11px;color:var(--muted)}
  .menu{position:relative}
  .menu summary{list-style:none;cursor:pointer;font-family:var(--mono);font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:var(--sec)}
  .menu summary:hover{color:var(--ink)}
  .menu summary::-webkit-details-marker{display:none}
  .menu-panel{position:absolute;right:0;top:calc(100% + 14px);background:var(--panel);border:1px solid var(--ink);padding:20px 24px;width:min(84vw,380px);max-height:72vh;overflow:auto;z-index:30}
  .menu-h{font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;margin:18px 0 6px;font-weight:500}
  .menu-h a{display:flex;align-items:center;gap:8px}
  .menu-h:first-child{margin-top:0}
  .menu-a{display:block;font-size:14px;color:var(--sec);padding:5px 0;border-bottom:1px solid var(--line)}
  .menu-a:hover{color:var(--ink)}
  .menu-a:last-of-type{border-bottom:0}
  .thema,.landwahl select{font-family:var(--mono);font-size:11px;letter-spacing:.08em;color:var(--sec);background:transparent;border:0;border-bottom:1px solid var(--faint);padding:5px 0;cursor:pointer;max-width:140px}
  .landwahl{display:flex;gap:12px}
  /* Router */
  main>section{display:none}
  main>section:target{display:block}
  main:not(:has(section:target))>#home{display:block}
  /* Krümelpfad */
  .crumbbar{border-bottom:1px solid var(--line)}
  .crumbs{padding-top:13px;padding-bottom:13px;font-family:var(--mono);font-size:11px;letter-spacing:.05em;color:var(--muted);display:flex;flex-wrap:wrap;gap:7px}
  .crumbs a:hover{color:var(--ink)}
  .crumbs .sep{color:var(--faint)}
  .crumbs .here{color:var(--ink)}
  /* Raster: Leiste · Artikel · Leiste */
  .g3{display:grid;grid-template-columns:222px minmax(0,1fr) 260px;gap:52px;padding-top:44px;padding-bottom:80px}
  .pcol{max-width:960px;padding-top:44px;padding-bottom:80px}
  /* Linke Leiste */
  .rail-h{display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:10px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:var(--ink);padding-bottom:11px;border-bottom:1px solid var(--ink)}
  .rl-row{display:flex;justify-content:space-between;gap:10px;padding:11px 0;border-bottom:1px solid var(--line);font-size:14px;color:var(--sec)}
  .rl-row:hover{color:var(--ink)}
  .rl-row .num{font-family:var(--mono);font-size:10px;color:var(--faint)}
  .rl-row.on{font-weight:600;color:var(--ink);padding-left:11px;box-shadow:inset 3px 0 0 var(--accent)}
  /* Kicker */
  .kick{display:flex;align-items:center;gap:22px;margin-bottom:22px;flex-wrap:wrap}
  .kp{display:flex;align-items:center;gap:7px;font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase}
  .kdiv{width:1px;height:12px;background:var(--line)}
  .ebar{display:flex;align-items:flex-end;gap:4px;height:15px}
  .ebar i{width:3px;background:var(--bar)}
  .klbl{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
  /* Artikel */
  h1.node{font-size:50px;font-weight:700;line-height:1.02;letter-spacing:-.035em;margin-bottom:26px}
  h1.node.gross{font-size:60px;line-height:.98;letter-spacing:-.038em;margin-bottom:22px}
  .lead{font-family:var(--serif);font-size:20px;line-height:1.6;color:var(--body);margin-bottom:24px;text-wrap:pretty;max-width:68ch}
  .content{margin-bottom:34px}
  details.depth{border-top:1px solid var(--line);margin-top:18px}
  details.depth summary{list-style:none;cursor:pointer;padding:13px 0;font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;display:flex;gap:8px;align-items:center}
  details.depth summary:hover{color:var(--accent)}
  details.depth summary::-webkit-details-marker{display:none}
  .chev{font-size:10px;line-height:1;transition:transform .15s ease}
  details[open] > summary .chev{transform:rotate(180deg)}
  details.depth .dbody{padding:4px 0 18px;font-family:var(--serif);font-size:18px;line-height:1.65;color:var(--body);max-width:68ch;text-wrap:pretty}
  .unchecked{margin-top:12px;font-family:var(--mono);font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:#8a6a3a;background:var(--panel);border:1px solid var(--line);padding:5px 9px;display:inline-block}
  .nohint{margin-top:14px;padding-top:12px;border-top:1px solid var(--line);font-family:var(--mono);font-size:11px;color:var(--muted);line-height:1.6}
  /* Bilder */
  figure.zeichnung{border:1px solid #DAD5CB;background:#FBFAF8;padding:20px;margin:0 0 32px}
  figure.zeichnung svg{width:100%;height:auto;display:block}
  figure.zeichnung.foto{padding:0;border:0;background:none}
  figure.zeichnung.foto img{width:100%;height:auto;display:block}
  figure.zeichnung figcaption{display:flex;justify-content:space-between;gap:24px;align-items:flex-end;padding-top:14px}
  figure.zeichnung .cap{font-family:var(--serif);font-style:italic;font-size:16px;line-height:1.45;color:var(--sec);max-width:58ch}
  figure.zeichnung .credit{font-family:var(--mono);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);white-space:nowrap;text-align:right}
  figure.zeichnung .credit a{text-decoration:underline;text-underline-offset:2px;text-transform:none;letter-spacing:.04em}
  /* Abschnitte */
  .sec-title{font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:var(--ink)}
  .sec-head{display:flex;align-items:baseline;justify-content:space-between;border-bottom:1px solid var(--ink);padding-bottom:11px}
  .sec-n{font-family:var(--mono);font-size:10px;letter-spacing:.1em;color:var(--muted)}
  .section{margin:44px 0}
  .raster{display:grid;grid-template-columns:1fr;column-gap:44px}
  @media(min-width:900px){.raster{grid-template-columns:1fr 1fr}}
  .child{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:17px 0;border-bottom:1px solid var(--line)}
  .child .ct{display:block;font-size:17px;font-weight:600;letter-spacing:-.015em;margin-bottom:4px}
  .child:hover .ct{text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:4px}
  .child small{display:block;font-family:var(--mono);font-size:10px;letter-spacing:.08em;color:var(--muted)}
  .child .arr{font-family:var(--mono);color:var(--faint);padding-top:2px}
  .child .pdesc{display:block;font-family:var(--serif);font-size:15.5px;line-height:1.5;color:var(--sec);margin-top:7px;max-width:62ch}
  .endnote{font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:30px}
  /* DACH */
  .dach{border:1px solid var(--line);background:var(--panel);padding:18px 22px 14px;margin-bottom:36px}
  .dach .sec-title{display:block;border-bottom:1px solid var(--ink);padding-bottom:10px;margin-bottom:4px}
  .dach-row{display:flex;gap:14px;font-family:var(--serif);font-size:16px;line-height:1.55;color:var(--body);padding:9px 0;border-bottom:1px solid var(--line)}
  .dach-row:last-of-type{border-bottom:0}
  .dach-row .cc{flex:0 0 26px;font-family:var(--mono);font-size:10px;font-weight:500;letter-spacing:.1em;color:var(--muted);padding-top:5px}
  .dach-hint{font-family:var(--mono);font-size:10.5px;color:var(--muted);margin-top:6px;border-top:1px solid var(--line);padding-top:9px;line-height:1.6}
  body[data-land="de"] .dach-row.dr-at,body[data-land="de"] .dach-row.dr-ch,
  body[data-land="at"] .dach-row.dr-de,body[data-land="at"] .dach-row.dr-ch,
  body[data-land="ch"] .dach-row.dr-de,body[data-land="ch"] .dach-row.dr-at{display:none}
  /* Quellen */
  .srcbox{margin:44px 0}
  .srcbox .sec-title{display:block;border-bottom:1px solid var(--ink);padding-bottom:11px}
  .src-row{display:flex;justify-content:space-between;gap:20px;padding:13px 0;border-bottom:1px solid var(--line);font-size:14.5px;color:var(--body)}
  .src-row a{text-decoration:underline;text-underline-offset:3px;text-decoration-color:var(--line)}
  .src-row a:hover{text-decoration-color:var(--ink)}
  .src-row .typ{font-family:var(--mono);font-size:10px;color:var(--muted);white-space:nowrap;padding-top:3px}
  .src-row .stand{display:inline-block;margin-left:10px;font-family:var(--mono);font-size:9.5px;color:var(--muted)}
  .srcnote{font-family:var(--mono);font-size:10px;color:var(--muted);margin-top:10px;line-height:1.6}
  /* Threads am Knoten */
  .thread{border-top:1px solid var(--ink);border-bottom:1px solid var(--line);padding:14px 0 16px;margin-bottom:42px}
  .thread .sec-title{color:var(--muted);font-size:10px}
  .th-row{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:10px}
  .th-nav{font-family:var(--serif);font-size:16px;text-decoration:underline;text-underline-offset:3px;text-decoration-color:var(--line)}
  .th-nav:hover{text-decoration-color:var(--accent);color:var(--accent)}
  .th-next{margin-left:auto;text-align:right}
  .th-ende{font-family:var(--mono);font-size:10px;color:var(--muted);margin-left:auto;text-transform:uppercase;letter-spacing:.1em}
  /* Netz */
  details.netz{border-top:1px solid var(--line);margin-top:8px}
  details.netz summary{list-style:none;cursor:pointer;padding:13px 0;font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);display:flex;gap:8px;align-items:center}
  details.netz summary::-webkit-details-marker{display:none}
  .netzbox{background:#FBFAF8;border:1px solid #DAD5CB;padding:8px}
  svg{width:100%;height:auto;display:block}
  svg text{font-size:11px;fill:#33312D;font-family:var(--sans)}
  svg text.ctr{font-size:12.5px;font-weight:600}
  .netz-note{font-family:var(--mono);font-size:10px;color:var(--muted);text-align:center;margin-top:10px;line-height:1.6}
  /* Rechte Leiste */
  .rail-r{display:flex;flex-direction:column;gap:36px}
  .rr-b .rail-h{margin-bottom:2px}
  .rr-row{display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid var(--line);font-size:13.5px;color:var(--body)}
  .rr-row:hover{color:var(--accent)}
  .rr-mono{font-family:var(--mono);font-size:11px;line-height:1.7;color:var(--sec);padding-top:10px}
  .rr-serif{font-family:var(--serif);font-size:16px;line-height:1.5;color:var(--sec);padding-top:10px;text-wrap:pretty}
  .pull{border-top:2px solid var(--accent);padding-top:16px}
  .pull-h{font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:12px}
  .pull-t{font-family:var(--serif);font-size:21px;line-height:1.35;color:var(--ink);text-wrap:pretty}
  .netzmini{position:relative;height:150px;margin-top:12px;border:1px solid var(--line);background:var(--panel)}
  .nm-c{position:absolute;left:50%;top:50%;width:11px;height:11px;margin:-5.5px}
  .nm-s{position:absolute;width:7px;height:7px;border:1px solid var(--muted)}
  .nm-t{position:absolute;left:12px;bottom:10px;font-family:var(--mono);font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
  /* Startseite */
  .hero{display:grid;grid-template-columns:1.45fr .85fr;gap:88px;padding:66px 0 52px}
  .kickline{font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:28px}
  .display{font-size:72px;font-weight:700;line-height:.97;letter-spacing:-.038em}
  .display em{font-family:var(--serif);font-weight:300;font-style:italic;letter-spacing:-.01em}
  .hero-r{padding-top:44px}
  .hero-p{font-family:var(--serif);font-size:19px;line-height:1.55;color:var(--sec);margin-bottom:28px;text-wrap:pretty}
  .fakten{border-top:1px solid var(--ink)}
  .fakten div{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--line);font-family:var(--mono);font-size:11px;letter-spacing:.06em}
  .fakten div:last-child{border-bottom:0}
  .fakten span:first-child{color:var(--muted);text-transform:uppercase}
  .pstrip{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--ink)}
  .ps{padding:22px 24px 26px 0;border-right:1px solid var(--line)}
  .ps+.ps{padding-left:24px}
  .ps:last-child{border-right:0;padding-right:0}
  .ps-k{display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:10px;letter-spacing:.18em;color:var(--muted);margin-bottom:14px}
  .ps-t{display:block;font-size:23px;font-weight:600;letter-spacing:-.02em;margin-bottom:8px}
  .ps:hover .ps-t{text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:4px}
  .ps-d{display:block;font-family:var(--serif);font-size:16px;line-height:1.45;color:var(--sec)}
  .leit{display:block;margin-top:56px;max-height:480px;overflow:hidden}
  .leit img{width:100%;height:auto;display:block}
  .leitzeile{display:flex;justify-content:space-between;gap:20px;padding:12px 0 0;font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
  .threads{padding:72px 0 24px}
  .threads-h{display:flex;align-items:baseline;gap:20px;border-bottom:1px solid var(--ink);padding-bottom:12px}
  .threads-h h2{font-family:var(--mono);font-size:12px;font-weight:500;letter-spacing:.18em;text-transform:uppercase}
  .th-i{font-family:var(--serif);font-style:italic;font-size:17px;color:var(--muted)}
  .throw{display:grid;grid-template-columns:56px 1fr 300px;gap:32px;padding:30px 0;border-bottom:1px solid var(--line);align-items:start}
  .throw:last-of-type{border-bottom:0}
  .throw:hover{background:var(--panel)}
  .th-n{font-family:var(--mono);font-size:12px;color:var(--muted);padding-top:6px}
  .th-t{display:block;font-size:34px;font-weight:600;letter-spacing:-.028em;line-height:1.06;margin-bottom:12px}
  .th-d{display:block;font-family:var(--serif);font-size:18px;line-height:1.5;color:var(--sec);max-width:62ch;text-wrap:pretty}
  .th-s{font-family:var(--mono);font-size:10.5px;line-height:1.9;letter-spacing:.04em;color:var(--muted);padding-top:8px}
  .th-sc{display:block;color:var(--ink);margin-bottom:6px;text-transform:uppercase}
  footer{border-top:1px solid var(--line);margin-top:40px}
  .frow{display:flex;justify-content:space-between;gap:20px;padding-top:28px;padding-bottom:32px;font-family:var(--mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);flex-wrap:wrap}
  /* Schmale Viewports */
  @media(max-width:1160px){
    .g3{grid-template-columns:minmax(0,1fr);gap:0}
    .rail-l{display:none}
    .rail-r{margin-top:48px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:32px;align-items:start}
    .hero{grid-template-columns:1fr;gap:36px;padding-top:44px}
    .display{font-size:52px}
    .hero-r{padding-top:0}
    .pstrip{grid-template-columns:1fr 1fr}
    .ps{padding:22px 24px 26px 0 !important;border-right:0;border-bottom:1px solid var(--line)}
    .throw{grid-template-columns:40px 1fr}
    .th-s{display:none}
    h1.node,.h1 .node.gross{font-size:40px}
    h1.node.gross{font-size:44px}
  }
</style>
<script>var SUCHINDEX=${SUCHINDEX};</script>
<script>(function(){var t=localStorage.getItem('ao_theme')||'auto';var d=t==='dark'||(t==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';})();</script>
</head>
<body>
<header><div class="hrow">
  <a class="wordmark" href="#home">ArchiPedia<span>Prototyp</span></a>
  <nav class="topnav">
    <a href="#persp-k">${sq('k')}Konstruktion</a>
    <a href="#persp-e">${sq('e')}Entwurf</a>
    <a href="#persp-x">${sq('x')}Kontext</a>
    <a href="#persp-p">${sq('p')}Prozess</a>
  </nav>
  <div class="hctl">
    <span class="such"><input id="suche" type="search" placeholder="Suche" autocomplete="off"><div class="such-panel" id="suchpanel" hidden></div></span>
    ${menu}
    <button class="thema" id="thema" type="button">◐ Auto</button>
    <span class="landwahl">
      <select id="land" aria-label="Land wählen">
        <option value="alle">DACH: alle</option>
        <option value="de">Deutschland</option>
        <option value="at">Österreich</option>
        <option value="ch">Schweiz</option>
      </select>
      <select id="region" aria-label="Region wählen" hidden></select>
    </span>
  </div>
</div></header>
<main>
${sections}
</main>
<script>
(function(){
  function sync(){
    var h = location.hash.slice(1) || 'home';
    var any = false;
    document.querySelectorAll('main>section').forEach(function(s){
      var on = s.id === h; s.style.display = on ? 'block' : 'none'; if(on) any = true;
    });
    if(!any) document.getElementById('home').style.display = 'block';
    document.querySelectorAll('details.menu').forEach(function(d){ d.open = false; });
    window.scrollTo(0,0);
  }
  window.addEventListener('hashchange', sync); sync();

  /* Stichwortsuche über Titel und Überblick */
  var inp = document.getElementById('suche');
  var panel = document.getElementById('suchpanel');
  var PNAME = { k:'Konstruktion', e:'Entwurf', x:'Kontext', p:'Prozess' };
  function suchen(){
    var q = inp.value.trim().toLowerCase();
    if (q.length < 2) { panel.hidden = true; panel.innerHTML = ''; return; }
    var treffer = [];
    for (var i = 0; i < SUCHINDEX.length; i++) {
      var e = SUCHINDEX[i]; var t = e[1].toLowerCase();
      var s = t === q ? 0 : t.indexOf(q) === 0 ? 1 : t.indexOf(q) >= 0 ? 2 : e[4].indexOf(q) >= 0 ? 3 : -1;
      if (s >= 0) treffer.push([s, e]);
    }
    treffer.sort(function(a, b){ return a[0] - b[0]; });
    treffer = treffer.slice(0, 12);
    panel.innerHTML = treffer.length
      ? treffer.map(function(x){ var e = x[1];
          return '<a class="such-t" href="#' + e[0] + '"><span class="such-p">' + PNAME[e[2]] + '</span><span class="such-titel">' + e[1] + '</span>' + (e[3] ? '<span class="such-pfad">' + e[3] + '</span>' : '') + '</a>'; }).join('')
      : '<p class="such-leer">Nichts gefunden.</p>';
    panel.hidden = false;
  }
  inp.addEventListener('input', suchen);
  inp.addEventListener('keydown', function(ev){
    if (ev.key === 'Enter') { var a = panel.querySelector('a'); if (a) location.hash = a.getAttribute('href'); }
    if (ev.key === 'Escape') { panel.hidden = true; inp.blur(); }
  });
  document.addEventListener('keydown', function(ev){
    if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'k') { ev.preventDefault(); inp.focus(); return; }
    if (ev.key === '/' && document.activeElement !== inp && !/SELECT|INPUT|TEXTAREA/.test(document.activeElement.tagName)) { ev.preventDefault(); inp.focus(); }
  });
  window.addEventListener('hashchange', function(){ panel.hidden = true; inp.value = ''; });
  document.addEventListener('click', function(ev){ if (!panel.contains(ev.target) && ev.target !== inp) panel.hidden = true; });

  /* Land- und Regionswahl (wie eine Sprachauswahl; Auswahl bleibt gespeichert) */
  var REGIONEN = {
    de: ['Baden-Württemberg','Bayern','Berlin','Brandenburg','Bremen','Hamburg','Hessen','Mecklenburg-Vorpommern','Niedersachsen','Nordrhein-Westfalen','Rheinland-Pfalz','Saarland','Sachsen','Sachsen-Anhalt','Schleswig-Holstein','Thüringen'],
    at: ['Burgenland','Kärnten','Niederösterreich','Oberösterreich','Salzburg','Steiermark','Tirol','Vorarlberg','Wien'],
    ch: ['Aargau','Appenzell Ausserrhoden','Appenzell Innerrhoden','Basel-Landschaft','Basel-Stadt','Bern','Freiburg','Genf','Glarus','Graubünden','Jura','Luzern','Neuenburg','Nidwalden','Obwalden','Schaffhausen','Schwyz','Solothurn','St. Gallen','Tessin','Thurgau','Uri','Waadt','Wallis','Zug','Zürich']
  };
  var REGIONWORT = { de: 'Bundesland', at: 'Bundesland', ch: 'Kanton' };
  var selLand = document.getElementById('land');
  var selRegion = document.getElementById('region');
  function fuelleRegionen(land){
    if (land === 'alle') { selRegion.hidden = true; selRegion.innerHTML = ''; return; }
    var opts = '<option value="">' + REGIONWORT[land] + ' wählen</option>';
    REGIONEN[land].forEach(function(r){ opts += '<option value="' + r + '">' + r + '</option>'; });
    selRegion.innerHTML = opts; selRegion.hidden = false;
  }
  function wende(){
    var land = localStorage.getItem('ao_land') || 'alle';
    var region = localStorage.getItem('ao_region') || '';
    document.body.dataset.land = land;
    selLand.value = land;
    fuelleRegionen(land);
    if (region && !selRegion.hidden) selRegion.value = region;
    var titel = { alle:'DACH: nationale Besonderheiten', de:'Nationale Regelung: Deutschland', at:'Nationale Regelung: Österreich', ch:'Nationale Regelung: Schweiz' };
    document.querySelectorAll('.dach .sec-title').forEach(function(t){ t.textContent = titel[land]; });
    document.querySelectorAll('.dach-hint').forEach(function(h){
      if (land === 'alle') { h.hidden = true; return; }
      h.hidden = false;
      h.textContent = region
        ? 'Ausgewählt: ' + region + '. Landesspezifische Angaben folgen mit der Vertiefung; bis dahin gilt die nationale Systematik.'
        : 'Gefiltert auf ' + selLand.options[selLand.selectedIndex].text + '. Über „DACH: alle" erscheinen wieder alle drei Länder.';
    });
  }
  selLand.addEventListener('change', function(){
    localStorage.setItem('ao_land', selLand.value);
    localStorage.setItem('ao_region', '');
    wende();
  });
  selRegion.addEventListener('change', function(){
    localStorage.setItem('ao_region', selRegion.value);
    wende();
  });
  wende();

  /* Darstellung: Auto / Dunkel / Hell */
  var themaBtn = document.getElementById('thema');
  var THEMA_LABEL = { auto: '◐ Auto', dark: '● Dunkel', light: '○ Hell' };
  function themaAnwenden(){
    var t = localStorage.getItem('ao_theme') || 'auto';
    var dunkel = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dunkel ? 'dark' : 'light';
    themaBtn.textContent = THEMA_LABEL[t];
  }
  themaBtn.addEventListener('click', function(){
    var reihe = ['auto','dark','light'];
    var t = localStorage.getItem('ao_theme') || 'auto';
    localStorage.setItem('ao_theme', reihe[(reihe.indexOf(t)+1)%3]);
    themaAnwenden();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', themaAnwenden);
  themaAnwenden();
})();
</script>
</body>
</html>`;

mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', html);
cpSync('fonts', 'dist/fonts', { recursive: true });
console.log('nodes:', Object.keys(N).length, '· bytes:', html.length, '→ dist/index.html (+fonts)');

/* Konsistenzprüfung nach Autoren-Spezifikation */
let warn = 0;
for (const [id,n] of Object.entries(N)) {
  if (n.pa && !N[n.pa]) { console.log('⚠ fehlender Eltern-Knoten:', id, '→', n.pa); warn++; }
  for (const l of n.ln||[]) if (!N[l]) { console.log('⚠ toter Querverweis:', id, '→', l); warn++; }
  const maxKinder = n.lv === 1 ? 10 : 7; /* Wurzelknoten dürfen bis 10 (Bens Entscheidung 20.08.2026) */
  if (kidsOf(id).length > maxKinder) { console.log(`⚠ mehr als ${maxKinder} Kinder:`, id); warn++; }
  if (n.t3 && !/Ab hier/.test(n.t3)) { console.log('⚠ T3 ohne "Ab hier"-Absprung:', id); warn++; }
  if (!n.t1) { console.log('⚠ T1 fehlt:', id); warn++; }
}
console.log(warn ? warn+' Warnungen' : 'Konsistenzprüfung: keine Warnungen');
