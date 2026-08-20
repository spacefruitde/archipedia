import { writeFileSync, mkdirSync, readFileSync, existsSync, cpSync, copyFileSync } from 'fs';
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

/* Ebenen-Benennung laut Design-Handoff */
const LVNAME = {1:'Themenfeld',2:'Feld',3:'Prinzip',4:'Vertiefung',5:'Ausführung',6:'Spezifikation',7:'LV-Position'};
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const kidsOf = id => Object.entries(N).filter(([,n]) => n.pa === id).map(([k]) => k);
const pathOf = id => { const p=[]; let c=id; while(c){p.unshift(c); c=N[c].pa;} return p; };
/* Perspektivfarben: Koralle · Butter · Mint · Periwinkle (Text darauf immer ink) */
const colOf = p => `var(--c-${p==='k'||p==='e'||p==='p' ? p : 'x'})`;

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
  const mehr = (r, x) => r.rest ? `<text x="${cx+x}" y="${cy-86+r.zeig.length*64+4}" text-anchor="middle" font-size="10.5" fill="var(--ink4)">+${r.rest} weitere</text>` : '';
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
    const col = m.xl ? colOf(N[m.id].p) : 'var(--hair)';
    return `<line x1="${cx}" y1="${cy}" x2="${cx+m.x}" y2="${cy+m.y}" stroke="${col}" stroke-width="1.4" ${dash} opacity="${m.xl?0.8:1}"/>`;
  }).join('');
  const circles = nodes.map(m=>{
    const col = colOf(N[m.id].p);
    const oben = m.id === n.pa || m.c; /* Eltern und Zentrum: Beschriftung über dem Knoten */
    const zeilen = zeilenOf(N[m.id].t, m.c ? 3 : 2);
    const ty = oben ? cy+m.y-(m.c?23:20)-12.5*(zeilen.length-1) : cy+m.y+20;
    const inner = `<circle cx="${cx+m.x}" cy="${cy+m.y}" r="${m.c?13:8}" fill="${m.c?col:'var(--card)'}" stroke="${m.c?'var(--ink)':col}" stroke-width="${m.c?2.5:2}"/>${wrap(zeilen, cx+m.x, ty, m.c)}`;
    return m.c ? `<g>${inner}</g>` : `<a href="#${m.id}">${inner}</a>`;
  }).join('');
  const lgd = (rein.zeig.length?`<text x="8" y="${H-8}" font-size="10" fill="var(--ink4)">← verweist hierher</text>`:'')+(raus.zeig.length?`<text x="${W-8}" y="${H-8}" font-size="10" fill="var(--ink4)" text-anchor="end">verweist auf →</text>`:'');
  return `<svg viewBox="0 0 ${W} ${H}">${edges}${circles}${mehr(rein,-150)}${mehr(raus,150)}${lgd}</svg>`;
}

/* Ebenen-Indikator: sieben Quadrate, gefüllt in Perspektivfarbe, aktuelle Ebene mit Outline.
   Quadrate bis zur aktuellen Ebene verlinken auf die Vorfahren desselben Strangs. */
const indikator = (n, id) => {
  const path = id ? pathOf(id) : [];
  const farbe = colOf(n.p);
  const felder = [1,2,3,4,5,6,7].map(i => {
    const voll = i <= n.lv;
    const akt = i === n.lv;
    const ziel = voll && path[i-1] && path[i-1] !== id ? path[i-1] : null;
    const stil = voll ? `background:${farbe}` : '';
    const kl = `eq${voll?' voll':''}${akt?' akt':''}`;
    const dn = akt ? ` data-n="${i}"` : '';
    return ziel ? `<a class="${kl}" style="${stil}" href="#${ziel}"${dn} title="Ebene ${i}: ${esc(N[ziel].t)}"></a>`
                : `<span class="${kl}" style="${stil}"${dn}></span>`;
  }).join('');
  return `<span class="ebenen">${felder}</span><span class="elbl">Ebene ${n.lv} von 7 — ${LVNAME[n.lv]}</span>`;
};
const chip = p => `<span class="chip" style="background:${colOf(p)}">${P[p].name}</span>`;

function nodeSection(id){
  const n = N[id], pp = P[n.p];
  const farbe = colOf(n.p);
  const path = pathOf(id);
  const crumbs = [`<a href="#home">Start</a>`]
    .concat(path.map((pid,i)=> i===path.length-1
      ? `<span class="here">${esc(N[pid].t)}</span>`
      : `<a href="#${pid}">${esc(N[pid].t)}</a>`))
    .join('<span class="sep">/</span>');

  /* Titelband: Ebene 1 volle Farbfläche, tiefer weiß mit 8px-Farbkante */
  const band = n.lv === 1
    ? `<div class="band" style="background:${farbe}"><div class="shell">
        <nav class="crumbs">${crumbs}</nav>
        <div class="band-g"><div>
          <div class="kick">${chip(n.p)}${indikator(n, id)}</div>
          <h1 class="t1">${esc(n.t)}</h1>
        </div><p class="band-lead">${esc(n.t1)}</p></div>
      </div></div>`
    : `<div class="band bandw" style="border-top:8px solid ${farbe}"><div class="shell">
        <nav class="crumbs cg">${crumbs}</nav>
        <div class="kick">${chip(n.p)}${indikator(n, id)}</div>
        <h1 class="t3">${esc(n.t)}</h1>
      </div></div>`;

  /* Fließtext: T1 als Lead (auf tiefen Seiten), T2 offen, T3 als Spezifikation */
  let text = '';
  if (n.lv > 1) text += `<p class="lead">${esc(n.t1)}</p>`;
  if (n.t2) text += n.t2.split(/(?<=\.)\s+(?=[A-ZÄÖÜ„])/).map(a=>`<p class="fl">${esc(a)}</p>`).join('');
  if (n.t3) text += `<details class="spez"><summary>Spezifikation <span class="chev">▾</span></summary><div class="dbody">${esc(n.t3)}<p class="unchecked">Status: KI-generiert, noch nicht fachgeprüft.</p></div></details>`;
  if (!n.t3 && n.lv>=3 && n.p!=='k') {
    text += `<p class="nohint">Keine Stufe „Spezifikation": Entwurfs- und Kontextwissen endet hier bewusst mit dem Querverweis in die Konstruktions-Perspektive.</p>`;
  }

  /* Bilder */
  let imgHTML = '';
  if (n.images && n.images.length) {
    imgHTML = n.images.map(im => {
      let inhalt = '';
      if (im.u) inhalt = `<img src="${im.u}" alt="${esc(im.caption || '')}" loading="lazy">`;
      else if (im.path && existsSync(im.path)) inhalt = readFileSync(im.path, 'utf8').replace(/<\?xml[^>]*\?>\s*/, '');
      else return '';
      const quelle = im.quelle ? ` · <a href="${im.quelle}" target="_blank" rel="noopener">Quelle ↗</a>` : '';
      return `<figure class="fig${im.u ? ' foto' : ''}">${inhalt}<figcaption><span class="cap">${esc(im.caption || '')}</span><span class="credit">${esc(im.credit || '')}${im.lizenz ? ' · ' + esc(im.lizenz) : ''}${quelle}</span></figcaption></figure>`;
    }).join('');
  }

  /* DACH-Besonderheiten (Klassen bleiben: das Länder-Skript hängt daran) */
  let dachHTML = '';
  if (n.dach) {
    const row = (cc,label,txt)=> txt?`<div class="dach-row dr-${label}"><span class="cc">${cc}</span><span>${esc(txt)}</span></div>`:'';
    dachHTML = `<div class="dach"><p class="sec-title">DACH: nationale Besonderheiten</p>${row('DE','de',n.dach.de)}${row('AT','at',n.dach.at)}${row('CH','ch',n.dach.ch)}<p class="dach-hint" hidden></p></div>`;
  }

  /* Normen & Quellen: Zeilen als eigene weiße Flächen */
  let srcHTML = '';
  if (n.src && n.src.length) {
    srcHTML = `<div class="srcbox"><h2 class="h2s">Normen und Quellen</h2>${
      n.src.map(s=>{
        const stand = s.stand ? `<span class="stand">Stand: ${esc(s.stand)}</span>` : '';
        const body = s.u ? `<a href="${s.u}" target="_blank" rel="noopener">${esc(s.t)} ↗</a>` : esc(s.t);
        return `<div class="src-row"><span>${body}${stand}</span><span class="typ">${srcTyp(s.t)}</span></div>`;
      }).join('')
    }<p class="srcnote">Im Projekt stets aktuelle Fassung und Landesrecht prüfen; Angaben ohne Stand sind noch nicht quellengeprüft.</p></div>`;
  }

  /* Kinder als Kartenraster in der Mitte, auf JEDER Ebene gleich (gelernter Klick-Flow);
     das tiefste Feld als schwarze Fokus-Karte */
  const kids = kidsOf(id);
  let kidsHTML = '';
  if (kids.length) {
    const tiefstes = kids.reduce((a,b)=> maxLv(b) > maxLv(a) ? b : a, kids[0]);
    const fokus = kids.length >= 4 && kids.filter(k=>maxLv(k)===maxLv(tiefstes)).length === 1 ? tiefstes : null;
    kidsHTML = `<div class="sec"><div class="sec-h"><h2 class="h2g">Ebene ${Math.min(n.lv+1,7)} — tiefer</h2><span class="sec-n">${kids.length} ${kids.length===1?'Feld':'Felder'}</span></div><div class="kraster">${
      kids.map(k=>{
        const uk = kidsOf(k).length;
        const meta = [`bis Ebene ${maxLv(k)}`].concat(uk?[`${uk} Unterthemen`]:[]).join(' · ');
        return `<a class="kcard${k===fokus?' fokus':''}" href="#${k}"><span class="kt">${esc(N[k].t)}</span><span class="kfuss"><span>${meta}</span><span class="arr">→</span></span></a>`;
      }).join('')
    }</div></div>`;
  } else if (n.p === 'k' && !n.t3) {
    kidsHTML = `<p class="endnote">Vertiefung und Spezifikation zu diesem Thema folgen.</p>`;
  }

  /* Entdeckungs-Threads */
  let threadHTML = '';
  if (THREADPOS[id]) {
    threadHTML = THREADPOS[id].map(({ti,i})=>{
      const th = THREADS[ti];
      const prev = i > 0 ? th.ids[i-1] : null, next = i < th.ids.length-1 ? th.ids[i+1] : null;
      return `<div class="thread"><p class="th-k">Entdeckungs-Thread · ${esc(th.titel)} · Station ${i+1}/${th.ids.length}</p><div class="th-row">${
        prev ? `<a class="th-nav" href="#${prev}">← ${esc(N[prev].t)}</a>` : '<span></span>'}${
        next ? `<a class="th-nav th-next" href="#${next}">${esc(N[next].t)} →</a>` : '<span class="th-ende">Ende des Threads</span>'}</div></div>`;
    }).join('');
  }

  /* Linker Themen-Index nur auf Ebene 1 */
  const railL = n.lv === 1
    ? `<aside class="rail-l"><p class="rl-t">${pp.name}</p><div class="rl-liste">${
        ROOTS.filter(([rid]) => N[rid].p === n.p).map(([rid]) =>
          `<a class="rl-row${rid===id?' on':''}"${rid===id?` style="background:${farbe}"`:''} href="#${rid}"><span>${esc(N[rid].t)}</span><span class="num">${kidsOf(rid).length||''}</span></a>`).join('')
      }</div></aside>`
    : '';

  /* Rechte Randspalte */
  const kosten = kostenVon(n), fehler = fehlerVon(n);
  const links = (n.ln||[]).filter(l=>N[l]);
  const verb = links.length + (BACK[id]||[]).length + kids.length + (n.pa?1:0);
  const quer = links.length ? `<div class="rr" style="background:${colOf('p')}"><p class="rr-t">Quer einsteigen</p>${
    links.map(l=>`<a class="rr-l" href="#${l}">${esc(N[l].t)} →</a>`).join('')}</div>` : '';
  const normen = n.src && n.src.length ? `<div class="rr rw"><p class="rr-t">Normenbezug</p><p class="rr-liste">${
    n.src.map(s=> s.u
      ? `<a href="${s.u}" target="_blank" rel="noopener" title="${esc(s.t)}">${esc(srcKurz(s.t))} ↗</a>`
      : `<span title="${esc(s.t)}">${esc(srcKurz(s.t))}</span>`).join('<br>')}</p></div>` : '';
  const netzmini = `<button class="rr netzknopf" style="background:${colOf('x')}" type="button"><p class="rr-t">Netzansicht</p><span class="nm">
    <span class="nm-c"></span>
    <span class="nm-s" style="left:22%;top:24%"></span><span class="nm-s" style="left:74%;top:30%"></span>
    <span class="nm-s" style="left:30%;top:70%"></span><span class="nm-s" style="left:68%;top:66%"></span>
    </span><span class="nm-t">${verb} Verbindung${verb===1?'':'en'}</span></button>`;
  const railR = `<aside class="rail-r">${
    kosten ? `<div class="rr" style="background:${colOf('e')}"><p class="rr-t">Kostenlogik</p><p class="rr-gross">${esc(kosten)}</p></div>` : ''}${
    fehler ? `<div class="rr" style="background:${colOf('k')}"><p class="rr-t">Häufigster Fehler</p><p class="rr-text">${esc(fehler)}</p></div>` : ''}${
    quer}${normen}${netzmini}</aside>`;

  const gridKlasse = n.lv === 1 ? 'g3' : 'g2';
  return `<section id="${id}" class="pp-${n.p}">
  ${band}
  <div class="shell ${gridKlasse}">
  ${railL}
  <article>
  ${n.lv === 1 ? imgHTML : ''}
  <div class="content">${text}</div>
  ${n.lv > 1 ? imgHTML : ''}${dachHTML}${kidsHTML}${srcHTML}${threadHTML}
  <details class="netz"><summary>Netz-Ansicht <span class="chev">▾</span></summary>
    <div class="netzbox">${netzSVG(id)}</div>
    <p class="netz-note">Durchgezogen: Hierarchie (oben Eltern, unten Kinder) · Gestrichelt: Querverweise. Antippen zum Navigieren.</p>
  </details>
  </article>
  ${railR}
  </div>
</section>`;
}

/* Perspektiven */
const PDESC = {
  k: 'Das Bauteilwissen — vom Themenfeld bis zum Ausschreibungsdetail.',
  e: 'Die gestalterische Absicht — Licht, Öffnung, Proportion, Haltung.',
  x: 'Ort, Bestand und Recht — was das Grundstück vorgibt.',
  p: 'Leistungsphasen, Vergabe, Ausführung — wer wann entscheidet.'
};
const PORDER = ['k','e','x','p'];
const perspRoots = p => ROOTS.filter(([id]) => N[id].p === p);
const perspCount = p => Object.values(N).filter(n => n.p === p).length;

/* Startseite */
const themaDerWoche = THREADS[0] || null;
const heroNode = themaDerWoche ? N[themaDerWoche.ids[0]] : null;
const heroFarbe = heroNode ? colOf(heroNode.p) : colOf('k');
const leitFoto = (N.kfe1 && (N.kfe1.images||[]).find(i=>i.u)) || null;
const threadPersp = th => [...new Set(th.ids.map(i=>N[i]?.p).filter(Boolean))];

const home = `<section id="home">
  ${themaDerWoche ? `<div class="hero" style="background:${heroFarbe}"><div class="shell hero-g">
    <div class="hero-bild">${themaDerWoche.bild
      ? `<img src="${themaDerWoche.bild.path}" alt="${esc(themaDerWoche.titel)}">${themaDerWoche.bild.credit?`<span class="hero-credit">${themaDerWoche.bild.quelle?`<a href="${themaDerWoche.bild.quelle}" target="_blank" rel="noopener">${esc(themaDerWoche.bild.credit)}</a>`:esc(themaDerWoche.bild.credit)}</span>`:''}`
      : leitFoto?`<img src="${leitFoto.u.replace('w=900','w=1200')}" alt="" loading="lazy">`:''}</div>
    <div>
      <span class="labelchip">Thema der Woche</span>
      <h1 class="hero-t">${esc(themaDerWoche.titel)}</h1>
      <p class="hero-lead">${esc(themaDerWoche.kurz)}</p>
      <p class="hero-cta"><a class="cta" href="#${themaDerWoche.ids[0]}">Thread starten</a><span class="hero-meta">${themaDerWoche.ids.length} Stationen · Ebene 1–7</span></p>
    </div>
  </div></div>` : ''}
  <div class="shell">
  <div class="sekt">
    <h2 class="h2g">Vier Perspektiven</h2>
    <p class="sekt-lead">Dieselbe Sache, vier Blickwinkel, sieben Auflösungen. Sie steigen ein, wo Ihre Frage liegt.</p>
    <div class="praster">${PORDER.map((p,i)=>`<a class="pkarte" href="#persp-${p}" style="background:${colOf(p)}">
      <span class="pnr">0${i+1}</span>
      <span><span class="pname">${P[p].name}</span>
      <span class="pdesc">${esc(PDESC[p])}</span>
      <span class="pzahl">${perspCount(p)} Themen →</span></span></a>`).join('')}</div>
  </div>
  <div class="sekt">
    <div class="sekt-h"><h2 class="h2g">Kuratierte Threads</h2><span class="alle">${THREADS.length} Threads</span></div>
    <div class="thraster">${THREADS.map(th=>`<a class="thkarte" href="#${th.ids[0]}">
      <span class="balken">${threadPersp(th).map(p=>`<i style="background:${colOf(p)}"></i>`).join('')}</span>
      <span class="tht">${esc(th.titel)}</span>
      <span class="thd">${esc(th.kurz)}</span>
      <span class="thm">${th.ids.length} Stationen · ${threadPersp(th).map(p=>P[p].name).join(' + ')}</span></a>`).join('')}</div>
  </div>
  </div>
</section>`;

/* Themen A–Z */
const azListe = Object.entries(N).map(([id,n])=>({id,t:n.t,p:n.p,pa:n.pa?N[n.pa].t:''}))
  .sort((a,b)=>a.t.localeCompare(b.t,'de'));
const azGruppen = {};
for (const e of azListe) { const b = e.t[0].toUpperCase(); (azGruppen[b] ||= []).push(e); }
const azHTML = `<section id="index">
  <div class="band bandw" style="border-top:8px solid var(--solid)"><div class="shell">
    <nav class="crumbs cg"><a href="#home">Start</a><span class="sep">/</span><span class="here">Themen A–Z</span></nav>
    <h1 class="t3">Themen A–Z</h1>
  </div></div>
  <div class="shell azody">${Object.keys(azGruppen).sort((a,b)=>a.localeCompare(b,'de')).map(b=>`
    <div class="azgrp"><p class="azb">${b}</p><div class="azliste">${
      azGruppen[b].map(e=>`<a class="azrow" href="#${e.id}"><span class="azdot" style="background:${colOf(e.p)}"></span><span class="azt">${esc(e.t)}</span><span class="azp">${e.pa?esc(e.pa):P[e.p].name}</span></a>`).join('')
    }</div></div>`).join('')}
  </div>
</section>`;

/* Normen-Register: alle Quellen aggregiert */
const NORMEN = {};
for (const [id,n] of Object.entries(N)) for (const s of n.src||[]) {
  const key = s.t;
  NORMEN[key] ||= { t:s.t, u:s.u, stand:s.stand, anz:0 };
  NORMEN[key].anz++;
  if (!NORMEN[key].u && s.u) NORMEN[key].u = s.u;
  if (!NORMEN[key].stand && s.stand) NORMEN[key].stand = s.stand;
}
const normListe = Object.values(NORMEN).sort((a,b)=>a.t.localeCompare(b.t,'de'));
const normHTML = `<section id="normen">
  <div class="band bandw" style="border-top:8px solid var(--solid)"><div class="shell">
    <nav class="crumbs cg"><a href="#home">Start</a><span class="sep">/</span><span class="here">Normen</span></nav>
    <h1 class="t3">Normen und Quellen</h1>
  </div></div>
  <div class="shell azody">
    <p class="normhinweis">${normListe.length} Quellen im Bestand, sortiert nach Titel. Zahl rechts: Themen, die darauf verweisen. Angaben ohne Stand sind noch nicht quellengeprüft.</p>
    ${normListe.map(s=>`<div class="src-row"><span>${s.u?`<a href="${s.u}" target="_blank" rel="noopener">${esc(s.t)} ↗</a>`:esc(s.t)}${s.stand?`<span class="stand">Stand: ${esc(s.stand)}</span>`:''}</span><span class="typ">${srcTyp(s.t)} · ${s.anz}</span></div>`).join('')}
  </div>
</section>`;

/* Perspektiv-Seiten: Farbband + Kartenraster der Themenfelder */
const perspSections = PORDER.map(p => `<section id="persp-${p}">
  <div class="band" style="background:${colOf(p)}"><div class="shell">
    <nav class="crumbs"><a href="#home">Start</a><span class="sep">/</span><span class="here">${P[p].name}</span></nav>
    <div class="kick">${chip(p)}</div>
    <h1 class="t1">${P[p].name}</h1>
    <p class="band-lead pl2">${esc(PDESC[p])}</p>
  </div></div>
  <div class="shell azody">
    <div class="sec-h"><h2 class="h2g">Ebene 1 — Themenfelder</h2><span class="sec-n">${perspRoots(p).length} Felder</span></div>
    <div class="kraster">${perspRoots(p).map(([id,desc])=>`<a class="kcard" href="#${id}"><span class="kt">${esc(N[id].t)}</span><span class="kdesc">${esc(desc)}</span><span class="kfuss"><span>bis Ebene ${maxLv(id)}${kidsOf(id).length?` · ${kidsOf(id).length} Unterthemen`:''}</span><span class="arr">→</span></span></a>`).join('')}</div>
  </div>
</section>`).join('\n');

const sections = home + azHTML + normHTML + perspSections + Object.keys(N).map(nodeSection).join('\n');

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
  :root{
    --ink:#16161A; --ink2:#3A3A40; --ink3:#55555C; --ink4:#8A8A90;
    --surface:#F0F0F0; --card:#FFFFFF; --pill:#EDEDED; --hair:#C4C4C8; --hover:#FAFAFA;
    --c-k:#FF6B5E; --c-e:#F2E4A8; --c-p:#C0C4F5; --c-x:#A8DCC6;
    --solid:#16161A; --solid-h:#2E2E34; --onsolid:#FFFFFF; --foot:#16161A; --warn:#8A6A3A; --shadow:rgba(22,22,26,.18);
    --sans:'Archivo',-apple-system,BlinkMacSystemFont,sans-serif;
  }
  [data-theme="dark"]{
    --ink:#ECECEE; --ink2:#C4C4C9; --ink3:#9E9EA4; --ink4:#78787E;
    --surface:#202023; --card:#2A2A2E; --pill:#343439; --hair:#48484E; --hover:#313136;
    --c-k:#C4665B; --c-e:#BDB283; --c-p:#9599C8; --c-x:#82B09C;
    --solid:#ECECEE; --solid-h:#D8D8DC; --onsolid:#16161A; --foot:#151517; --warn:#C9A46A; --shadow:rgba(0,0,0,.5);
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--surface);color:var(--ink);font:16px/1.6 var(--sans)}
  a{color:inherit;text-decoration:none}
  button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;text-align:left}
  .shell{max-width:1440px;margin:0 auto;padding-left:56px;padding-right:56px}
  /* Farbige Flächen tragen immer dunkle Schrift */
  .band:not(.bandw),.hero,.pkarte,.rr:not(.rw),.rl-row.on,.chip,.labelchip{color:#16161A}
  /* Header */
  header{background:var(--card);position:sticky;top:0;z-index:20}
  .hrow{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:18px 40px;flex-wrap:wrap}
  .pills{display:flex;background:var(--pill);border-radius:999px;padding:5px}
  .pills a{font-size:13px;font-weight:500;color:var(--ink2);padding:9px 18px;border-radius:999px}
  .pills a.on{font-weight:600;background:var(--solid);color:var(--onsolid);padding:9px 20px}
  .wordmark{font-size:27px;font-weight:700;letter-spacing:-.04em;text-transform:uppercase}
  .hctl{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
  .such{position:relative;display:flex;align-items:center;gap:12px;background:var(--pill);border-radius:999px;padding:11px 20px;width:280px}
  .scope{font-size:13px;font-weight:500;white-space:nowrap;cursor:pointer}
  .strenn{width:1px;height:16px;background:var(--hair);flex:none}
  .such input{flex:1;min-width:0;background:transparent;border:0;font:inherit;font-size:13px;color:var(--ink);outline:none}
  .such-panel{position:absolute;right:0;top:calc(100% + 10px);background:var(--card);width:min(84vw,420px);max-height:64vh;overflow:auto;z-index:40;box-shadow:0 12px 40px var(--shadow)}
  .such-t{display:block;padding:12px 18px;border-bottom:1px solid var(--surface)}
  .such-t:hover{background:var(--hover)}
  .such-p{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-right:8px;color:var(--ink4)}
  .such-titel{font-size:14px;font-weight:600}
  .such-pfad{display:block;font-size:11px;color:var(--ink4);margin-top:2px}
  .such-leer{padding:12px 18px;font-size:12px;color:var(--ink4)}
  .landwahl{display:flex;gap:10px}
  .landwahl select{font:inherit;font-size:12px;font-weight:600;letter-spacing:.1em;color:var(--ink3);background:transparent;border:0;cursor:pointer;text-transform:uppercase;max-width:130px}
  /* Router */
  main>section{display:none}
  main>section:target{display:block}
  main:not(:has(section:target))>#home{display:block}
  /* Titelbänder */
  .band{padding:40px 0 52px}
  .band.bandw{background:var(--card);padding:38px 0 48px}
  .crumbs{display:flex;flex-wrap:wrap;gap:10px;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-bottom:26px}
  .crumbs .sep{opacity:.5}
  .crumbs .here{text-decoration:underline;text-underline-offset:4px}
  .crumbs.cg{color:var(--ink4)}
  .crumbs.cg .here{color:var(--ink);text-decoration:none}
  .band-g{display:grid;grid-template-columns:1.3fr .7fr;gap:72px;align-items:end}
  .band-lead{font-size:19px;line-height:1.45;font-weight:500;max-width:48ch;text-wrap:pretty}
  .pl2{margin-top:18px}
  .kick{display:flex;align-items:center;gap:18px;margin-bottom:20px;flex-wrap:wrap}
  .chip{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;padding:6px 12px}
  .band:not(.bandw) .chip{background:#16161A !important;color:#fff}
  .ebenen{display:flex;gap:5px}
  .eq{display:inline-block;width:18px;height:18px;border:1.5px solid rgba(22,22,26,.3)}
  [data-theme="dark"] .bandw .eq{border-color:rgba(242,242,244,.3)}
  .eq.voll{border:0}
  .eq.akt{outline:2px solid var(--ink);outline-offset:2px}
  .band:not(.bandw) .eq.akt{outline-color:#16161A;background:#16161A !important;display:grid;place-items:center}
  .band:not(.bandw) .eq.akt::after{content:attr(data-n);color:#fff;font-size:10px;font-weight:700;line-height:1}
  a.eq:hover{outline:2px solid var(--ink);outline-offset:2px}
  .elbl{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
  .bandw .elbl{color:var(--ink3)}
  h1.t1{font-size:90px;font-weight:700;line-height:.88;letter-spacing:-.05em;text-wrap:balance;hyphens:auto}
  h1.t3{font-size:74px;font-weight:700;line-height:.92;letter-spacing:-.048em;max-width:24ch;text-wrap:balance;hyphens:auto}
  /* Body-Raster */
  .g3{display:grid;grid-template-columns:244px minmax(0,1fr) 268px;gap:40px;padding-top:44px;padding-bottom:76px}
  .g2{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:52px;padding-top:48px;padding-bottom:80px}
  .g2 article{max-width:72ch}
  /* Linker Themen-Index */
  .rl-t{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ink3);margin-bottom:12px}
  .rl-liste{background:var(--card)}
  .rl-row{display:flex;justify-content:space-between;gap:10px;padding:13px 16px;font-size:14px;color:var(--ink2)}
  .rl-row:hover{background:var(--hover)}
  .rl-row.on{font-weight:700;padding:14px 16px}
  .rl-row .num{font-size:11px;font-weight:600;color:var(--ink4)}
  .rl-row.on .num{color:inherit}
  /* Text */
  .lead{font-size:22px;line-height:1.45;font-weight:500;margin-bottom:22px;text-wrap:pretty}
  .fl{font-size:17px;line-height:1.6;color:var(--ink2);margin-bottom:20px;text-wrap:pretty}
  details.spez{margin:26px 0}
  details.spez summary{list-style:none;cursor:pointer;font-size:15px;font-weight:700;letter-spacing:.02em;display:flex;gap:8px;align-items:center;padding:14px 20px;background:var(--card)}
  details.spez summary:hover{background:var(--hover)}
  details.spez summary::-webkit-details-marker{display:none}
  .chev{font-size:11px;transition:transform .12s ease-out}
  details[open] > summary .chev{transform:rotate(180deg)}
  details.spez .dbody{background:var(--card);padding:4px 20px 18px;font-size:16px;line-height:1.6;color:var(--ink2)}
  .unchecked{margin-top:12px;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--warn);background:var(--surface);padding:6px 10px;display:inline-block}
  .nohint{font-size:13px;color:var(--ink4);margin:18px 0;line-height:1.6}
  /* Bilder */
  .fig{background:var(--card);padding:24px;margin:0 0 30px}
  .fig svg{width:100%;height:auto;display:block}
  .fig.foto{padding:0;background:none}
  .fig.foto img{width:100%;height:auto;display:block}
  .fig figcaption{display:flex;justify-content:space-between;gap:24px;align-items:flex-end;padding-top:14px}
  .fig.foto figcaption{padding:12px 0 0}
  .fig .cap{font-size:14px;line-height:1.5;color:var(--ink2);max-width:60ch}
  .fig.foto .cap{font-size:13px;color:var(--ink3)}
  .fig .credit{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--ink4);white-space:nowrap;text-align:right}
  .fig .credit a{text-decoration:underline;text-underline-offset:2px;text-transform:none;letter-spacing:.02em}
  /* Sektionen / Karten */
  .h2g{font-size:44px;font-weight:700;letter-spacing:-.04em;line-height:1}
  .h2s{font-size:28px;font-weight:700;letter-spacing:-.03em;margin-bottom:14px}
  .sec{margin:52px 0}
  .sec-h{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:20px}
  .g3 .sec-h .h2g{font-size:32px;letter-spacing:-.035em}
  .sec-n{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--ink4)}
  .kraster{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .kcard{display:flex;flex-direction:column;justify-content:space-between;gap:16px;background:var(--card);padding:20px 22px;min-height:136px;transition:background .12s ease-out}
  .kcard:hover{background:var(--hover)}
  .kcard:hover .arr{transform:translateX(4px)}
  .kt{font-size:19px;font-weight:700;line-height:1.15;letter-spacing:-.02em;hyphens:auto}
  .kdesc{font-size:14px;line-height:1.5;color:var(--ink3)}
  .kfuss{display:flex;justify-content:space-between;align-items:baseline;gap:12px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--ink4)}
  .arr{display:inline-block;transition:transform .12s ease-out}
  .kcard.fokus{background:var(--solid);color:var(--onsolid)}
  .kcard.fokus .kfuss,.kcard.fokus .kdesc{color:var(--onsolid);opacity:.7}
  .kcard.fokus:hover{background:var(--solid-h)}
  .endnote{font-size:12px;color:var(--ink4);margin:18px 0}
  /* DACH */
  .dach{background:var(--card);padding:20px 22px 14px;margin:0 0 30px}
  .dach .sec-title{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-bottom:8px}
  .dach-row{display:flex;gap:14px;font-size:15px;line-height:1.55;color:var(--ink2);padding:9px 0;border-bottom:1px solid var(--surface)}
  .dach-row:last-of-type{border-bottom:0}
  .dach-row .cc{flex:0 0 26px;font-size:11px;font-weight:700;letter-spacing:.08em;color:var(--ink4);padding-top:3px}
  .dach-hint{font-size:12px;color:var(--ink4);margin-top:8px;padding-top:8px;border-top:1px solid var(--surface);line-height:1.6}
  body[data-land="de"] .dach-row.dr-at,body[data-land="de"] .dach-row.dr-ch,
  body[data-land="at"] .dach-row.dr-de,body[data-land="at"] .dach-row.dr-ch,
  body[data-land="ch"] .dach-row.dr-de,body[data-land="ch"] .dach-row.dr-at{display:none}
  /* Quellen */
  .srcbox{margin:44px 0}
  .src-row{display:flex;justify-content:space-between;gap:20px;background:var(--card);padding:16px 20px;margin-bottom:10px;font-size:15px}
  .src-row a{text-decoration:underline;text-underline-offset:3px;text-decoration-color:var(--hair)}
  .src-row a:hover{text-decoration-color:var(--ink)}
  .src-row .typ{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--ink4);white-space:nowrap;padding-top:3px}
  .src-row .stand{display:inline-block;margin-left:10px;font-size:11px;font-weight:600;color:var(--ink4)}
  .srcnote{font-size:12px;color:var(--ink4);margin-top:6px;line-height:1.6}
  /* Threads am Knoten */
  .thread{background:var(--card);padding:18px 22px;margin-bottom:30px}
  .th-k{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--ink4);margin-bottom:10px}
  .th-row{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
  .th-nav{font-size:15px;font-weight:600}
  .th-nav:hover{text-decoration:underline;text-underline-offset:4px}
  .th-next{margin-left:auto;text-align:right}
  .th-ende{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--ink4);margin-left:auto}
  /* Netz */
  details.netz{margin-top:8px}
  details.netz summary{list-style:none;cursor:pointer;padding:14px 20px;background:var(--card);font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ink3);display:flex;gap:8px;align-items:center}
  details.netz summary:hover{background:var(--hover)}
  details.netz summary::-webkit-details-marker{display:none}
  .netzbox{background:var(--card);padding:8px}
  svg{width:100%;height:auto;display:block}
  svg text{font-size:11px;fill:var(--ink);font-family:var(--sans)}
  svg text.ctr{font-size:12.5px;font-weight:600}
  .netz-note{font-size:11px;color:var(--ink4);text-align:center;margin-top:10px;line-height:1.6}
  /* Rechte Randspalte */
  .rail-r{display:flex;flex-direction:column;gap:16px;align-self:start}
  .rr{padding:20px 22px;display:block;width:100%}
  .rr.rw{background:var(--card)}
  .rr-t{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-bottom:12px}
  .rr.rw .rr-t{color:var(--ink3)}
  .rr-gross{font-size:21px;font-weight:600;line-height:1.35;letter-spacing:-.02em;text-wrap:pretty}
  .rr-text{font-size:15px;line-height:1.5;text-wrap:pretty}
  .rr-l{display:block;font-size:14px;font-weight:500;padding:5px 0}
  .rr-l:hover{text-decoration:underline;text-underline-offset:3px}
  .rr-liste{font-size:13.5px;line-height:1.75;color:var(--ink2)}
  .rr-liste a{text-decoration:underline;text-underline-offset:3px;text-decoration-color:var(--hair)}
  .rr-liste a:hover{text-decoration-color:var(--ink);color:var(--ink)}
  .rr-z{display:flex;justify-content:space-between;gap:12px;font-size:14px;color:var(--ink2);padding:6px 0}
  .rr-z:hover{color:var(--ink)}
  .rr-z .ekz{font-size:11px;font-weight:700;color:var(--ink4)}
  .netzknopf{cursor:pointer}
  .nm{position:relative;display:block;height:130px;background:rgba(255,255,255,.6)}
  .nm-c{position:absolute;left:50%;top:50%;width:12px;height:12px;margin:-6px;background:#16161A}
  .nm-s{position:absolute;width:8px;height:8px;border:1.5px solid #16161A}
  .nm-t{display:block;margin-top:10px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
  /* Startseite */
  .hero{padding:60px 0 68px}
  .hero-g{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
  .hero-bild img{width:100%;height:auto;display:block}
  .hero-credit{display:block;margin-top:8px;font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;opacity:.55}
  .labelchip{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;border:1.5px solid #16161A;padding:6px 12px;margin-bottom:24px}
  .hero-t{font-size:86px;font-weight:700;line-height:.9;letter-spacing:-.05em;margin-bottom:24px;text-wrap:balance;hyphens:auto}
  .hero-lead{font-size:20px;line-height:1.45;font-weight:500;max-width:44ch;margin-bottom:30px;text-wrap:pretty}
  .hero-cta{display:flex;align-items:center;gap:20px;flex-wrap:wrap}
  .cta{background:var(--solid);color:var(--onsolid);font-size:14px;font-weight:600;padding:13px 26px;border-radius:999px}
  .cta:hover{background:var(--solid-h)}
  .hero-meta{font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
  .sekt{padding:68px 0 20px}
  .sekt:last-child{padding-bottom:68px}
  .sekt-lead{font-size:19px;line-height:1.45;color:var(--ink2);max-width:56ch;margin:14px 0 30px;text-wrap:pretty}
  .sekt-h{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:30px}
  .alle{font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--ink4)}
  .praster{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
  .pkarte{display:flex;flex-direction:column;justify-content:space-between;padding:26px 24px 28px;min-height:272px}
  .pnr{font-size:12px;font-weight:700;letter-spacing:.16em}
  .pname{display:block;font-size:30px;font-weight:700;letter-spacing:-.035em;margin-bottom:10px}
  .pdesc{display:block;font-size:15px;line-height:1.45;margin-bottom:16px}
  .pzahl{display:block;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
  .pkarte:hover .pzahl{text-decoration:underline;text-underline-offset:3px}
  .thraster{display:grid;grid-template-columns:1fr 1fr;gap:20px}
  .thkarte{display:flex;flex-direction:column;gap:18px;background:var(--card);padding:30px;transition:background .12s ease-out}
  .thkarte:hover{background:var(--hover)}
  .balken{display:flex;gap:6px}
  .balken i{width:28px;height:8px}
  .tht{font-size:32px;font-weight:700;line-height:1.04;letter-spacing:-.035em;hyphens:auto}
  .thd{font-size:16px;line-height:1.5;color:var(--ink2);text-wrap:pretty}
  .thm{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--ink4)}
  footer{background:var(--foot);color:#fff;margin-top:0}
  .frow{display:flex;justify-content:space-between;gap:20px;padding-top:26px;padding-bottom:26px;font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;flex-wrap:wrap}
  .frow button{color:rgba(255,255,255,.7);font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase}
  .frow button:hover{color:#fff}
  /* A–Z und Normen */
  .azody{padding-top:44px;padding-bottom:76px;max-width:1000px}
  .azgrp{display:grid;grid-template-columns:80px 1fr;gap:24px;margin-bottom:26px}
  .azb{font-size:44px;font-weight:700;letter-spacing:-.04em;line-height:1}
  .azliste{background:var(--card)}
  .azrow{display:flex;align-items:center;gap:12px;padding:11px 16px;border-bottom:1px solid var(--surface);font-size:14px}
  .azrow:last-child{border-bottom:0}
  .azrow:hover{background:var(--hover)}
  .azdot{width:8px;height:8px;flex:none}
  .azt{font-weight:600}
  .azp{margin-left:auto;font-size:12px;color:var(--ink4);text-align:right}
  .normhinweis{font-size:14px;color:var(--ink3);margin-bottom:24px;max-width:70ch;line-height:1.6}
  @media (prefers-reduced-motion: reduce){*{transition:none !important}}
  /* Schmale Viewports */
  @media(max-width:1279px){
    .shell{padding-left:32px;padding-right:32px}
    .g3{grid-template-columns:244px minmax(0,1fr)}
    .g3 .rail-r,.g2 .rail-r{grid-column:1 / -1;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
    .g2{grid-template-columns:minmax(0,1fr)}
  }
  @media(max-width:1023px){
    .g3{grid-template-columns:minmax(0,1fr)}
    .rail-l{display:none}
    .hero-g{grid-template-columns:1fr;gap:36px}
    .hero-t{font-size:52px}
    h1.t1{font-size:52px}
    h1.t3{font-size:44px}
    .h2g{font-size:32px}
    .band-g{grid-template-columns:1fr;gap:24px}
    .praster{grid-template-columns:1fr 1fr}
    .thraster,.kraster{grid-template-columns:1fr}
    .pills a{padding:9px 12px}
    .such{width:200px}
    .azgrp{grid-template-columns:1fr}
  }
  /* Telefon: kompakter, nicht klebender Kopf, alles einspaltig */
  @media(max-width:719px){
    header{position:static}
    .hrow{padding:12px 16px 14px;gap:10px;justify-content:center}
    .wordmark{order:-1;flex:1 1 100%;text-align:center;font-size:22px}
    .pills a{padding:8px 11px;font-size:12px}
    .pills a.on{padding:8px 13px}
    .hctl{flex:1 1 100%;justify-content:center;gap:10px}
    .such{flex:1 1 auto;width:auto;min-width:0;padding:9px 16px}
    .such input{font-size:16px}
    .such-panel{left:0;right:0;width:auto}
    .shell{padding-left:20px;padding-right:20px}
    .hero{padding:32px 0 40px}
    .hero-t{font-size:40px}
    .hero-lead{font-size:17px}
    h1.t1{font-size:40px}
    h1.t3{font-size:32px}
    .h2g{font-size:26px}
    .g3 .sec-h .h2g{font-size:24px}
    .tht{font-size:24px}
    .thkarte{padding:22px}
    .praster{grid-template-columns:1fr}
    .pkarte{min-height:0;gap:18px}
    .band{padding:26px 0 34px}
    .band.bandw{padding:24px 0 30px}
    .band-lead{font-size:16px}
    .crumbs{font-size:10px;gap:6px;margin-bottom:18px}
    .kick{gap:12px}
    .elbl{font-size:10px}
    .g3{padding-top:26px;padding-bottom:48px}
    .g2{padding-top:26px;padding-bottom:48px;gap:36px}
    .lead{font-size:19px}
    .sekt{padding:40px 0 8px}
    .sekt:last-child{padding-bottom:44px}
    .fig{padding:14px}
    .fig figcaption{flex-direction:column;align-items:flex-start;gap:6px}
    .fig .credit{white-space:normal;text-align:left}
    .rr-gross{font-size:18px}
    .src-row{flex-direction:column;gap:6px}
    .src-row .typ{padding-top:0}
    .azb{font-size:30px}
    .azrow .azp{display:none}
    .frow{flex-direction:column;align-items:flex-start;gap:10px}
  }
</style>
<script>var SUCHINDEX=${SUCHINDEX};</script>
<script>(function(){var t=localStorage.getItem('ao_theme')||'auto';var d=t==='dark'||(t==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';})();</script>
</head>
<body>
<header><div class="hrow">
  <nav class="pills" id="pills">
    <a href="#home" data-pill="home">Entdecken</a>
    <a href="#index" data-pill="index">Themen A–Z</a>
    <a href="#normen" data-pill="normen">Normen</a>
  </nav>
  <a class="wordmark" href="#home">ArchiPedia</a>
  <div class="hctl">
    <span class="such"><button class="scope" id="scope" type="button">Alle</button><span class="strenn"></span><input id="suche" type="search" placeholder="Suche" autocomplete="off"><div class="such-panel" id="suchpanel" hidden></div></span>
    <span class="landwahl">
      <select id="land" aria-label="Land wählen">
        <option value="alle">DACH</option>
        <option value="de">DE</option>
        <option value="at">AT</option>
        <option value="ch">CH</option>
      </select>
      <select id="region" aria-label="Region wählen" hidden></select>
    </span>
  </div>
</div></header>
<main>
${sections}
</main>
<footer><div class="shell frow"><span>ArchiPedia — Prototyp · Inhalte KI-generiert, nicht fachgeprüft</span><span style="display:flex;gap:24px;align-items:center"><button id="thema" type="button">◐ Auto</button><span>Impressum · Quellen · Lizenz</span></span></div></footer>
<script>
(function(){
  function sync(){
    var h = location.hash.slice(1) || 'home';
    var any = false;
    document.querySelectorAll('main>section').forEach(function(s){
      var on = s.id === h; s.style.display = on ? 'block' : 'none'; if(on) any = true;
    });
    if(!any) document.getElementById('home').style.display = 'block';
    /* aktive Pille */
    var pill = (h === 'home' || !any) ? 'home' : h === 'index' ? 'index' : h === 'normen' ? 'normen' : '';
    document.querySelectorAll('#pills a').forEach(function(a){ a.classList.toggle('on', a.dataset.pill === pill); });
    window.scrollTo(0,0);
  }
  window.addEventListener('hashchange', sync); sync();

  /* Netz-Vorschau in der Randspalte öffnet die Vollansicht */
  document.addEventListener('click', function(ev){
    var b = ev.target.closest('.netzknopf');
    if (!b) return;
    var det = b.closest('section').querySelector('details.netz');
    if (det) { det.open = true; det.scrollIntoView({behavior:'smooth', block:'start'}); }
  });

  /* Stichwortsuche über Titel und Überblick; Scope-Chip filtert auf eine Perspektive */
  var inp = document.getElementById('suche');
  var panel = document.getElementById('suchpanel');
  var scopeBtn = document.getElementById('scope');
  var PNAME = { k:'Konstruktion', e:'Entwurf', x:'Kontext', p:'Prozess' };
  var SCOPES = ['alle','k','e','x','p'];
  var scope = 'alle';
  scopeBtn.addEventListener('click', function(){
    scope = SCOPES[(SCOPES.indexOf(scope)+1)%SCOPES.length];
    scopeBtn.textContent = scope === 'alle' ? 'Alle' : PNAME[scope];
    suchen();
  });
  function suchen(){
    var q = inp.value.trim().toLowerCase();
    if (q.length < 2) { panel.hidden = true; panel.innerHTML = ''; return; }
    var treffer = [];
    for (var i = 0; i < SUCHINDEX.length; i++) {
      var e = SUCHINDEX[i];
      if (scope !== 'alle' && e[2] !== scope) continue;
      var t = e[1].toLowerCase();
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
  document.addEventListener('click', function(ev){ if (!panel.contains(ev.target) && ev.target !== inp && ev.target !== scopeBtn) panel.hidden = true; });

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
    var opts = '<option value="">' + REGIONWORT[land] + '</option>';
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
        : 'Gefiltert auf ' + selLand.options[selLand.selectedIndex].text + '. Über „DACH" erscheinen wieder alle drei Länder.';
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
cpSync('images', 'dist/images', { recursive: true });
copyFileSync('robots.txt', 'dist/robots.txt');
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
