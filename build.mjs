import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
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

/* Thread-Zugehörigkeit je Knoten */
const THREADPOS = {};
THREADS.forEach((th, ti) => th.ids.forEach((id, i) => (THREADPOS[id] ||= []).push({ ti, i })));

const DEPTHS = [['t1','Überblick'],['t2','Vertiefung'],['t3','Spezifikation']];
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const kidsOf = id => Object.entries(N).filter(([,n]) => n.pa === id).map(([k]) => k);
const pathOf = id => { const p=[]; let c=id; while(c){p.unshift(c); c=N[c].pa;} return p; };
const colOf = p => p==='k' ? '#2f5d7c' : p==='e' ? '#b05c3a' : p==='p' ? '#665a7c' : '#4f7350';

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
  const mehr = (r, x) => r.rest ? `<text x="${cx+x}" y="${cy-86+r.zeig.length*64+4}" text-anchor="middle" font-size="10.5" fill="#6f6a61">+${r.rest} weitere</text>` : '';
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
    const col = m.xl ? colOf(N[m.id].p) : '#d8d2c4';
    return `<line x1="${cx}" y1="${cy}" x2="${cx+m.x}" y2="${cy+m.y}" stroke="${col}" stroke-width="1.2" ${dash} opacity="${m.xl?0.55:1}"/>`;
  }).join('');
  const circles = nodes.map(m=>{
    const col = colOf(N[m.id].p);
    const oben = m.id === n.pa || m.c; /* Eltern und Zentrum: Beschriftung über dem Knoten */
    const zeilen = zeilenOf(N[m.id].t, m.c ? 3 : 2);
    const ty = oben ? cy+m.y-(m.c?23:20)-12.5*(zeilen.length-1) : cy+m.y+20;
    const inner = `<circle cx="${cx+m.x}" cy="${cy+m.y}" r="${m.c?13:8}" fill="${m.c?col:'#fff'}" stroke="${col}" stroke-width="2"/>${wrap(zeilen, cx+m.x, ty, m.c)}`;
    return m.c ? `<g>${inner}</g>` : `<a href="#${m.id}">${inner}</a>`;
  }).join('');
  const lgd = (rein.zeig.length?`<text x="8" y="${H-8}" font-size="10" fill="#6f6a61">← verweist hierher</text>`:'')+(raus.zeig.length?`<text x="${W-8}" y="${H-8}" font-size="10" fill="#6f6a61" text-anchor="end">verweist auf →</text>`:'');
  return `<svg viewBox="0 0 ${W} ${H}">${edges}${circles}${mehr(rein,-150)}${mehr(raus,150)}${lgd}</svg>`;
}

function nodeSection(id){
  const n = N[id], pp = P[n.p];
  const path = pathOf(id);
  const crumbs = [`<a href="#home">Start</a>`]
    .concat(path.map((pid,i)=> i===path.length-1
      ? `<span class="here">${esc(N[pid].t)}</span>`
      : `<a href="#${pid}">${esc(N[pid].t)}</a>`))
    .join('<span class="sep">›</span>');
  const dots = [1,2,3,4,5,6,7].map(i=>`<i class="${i<=n.lv?'on':''}"></i>`).join('');

  let depths = `<div class="d1"><p class="dlbl">Überblick</p><p>${esc(n.t1)}</p></div>`;
  for (const [d,label] of DEPTHS.slice(1)) {
    if (n[d]) depths += `<details class="depth"><summary>${label} <span class="plus">+</span></summary><div class="dbody">${esc(n[d])}${d==='t3'?'<p class="unchecked">Status: KI-generiert, noch nicht fachgeprüft.</p>':''}</div></details>`;
  }
  if (!n.t3 && n.lv>=3 && n.p!=='k') {
    depths += `<p class="nohint">Keine Stufe „Spezifikation": Entwurfs- und Kontextwissen endet hier bewusst mit dem Querverweis in die Konstruktions-Perspektive.</p>`;
  }

  /* Schemazeichnungen (inline eingebettet, damit dist eine Datei bleibt) */
  let imgHTML = '';
  if (n.images && n.images.length) {
    imgHTML = n.images.map(im => {
      let inhalt = '';
      if (im.u) {
        /* Externes Foto (Wikimedia Commons): verlinkt, nicht eingebettet; Namensnennung Pflicht */
        inhalt = `<img src="${im.u}" alt="${esc(im.caption || '')}" loading="lazy">`;
      } else if (im.path && existsSync(im.path)) {
        inhalt = readFileSync(im.path, 'utf8').replace(/<\?xml[^>]*\?>\s*/, '');
      } else return '';
      const quelle = im.quelle ? ` · <a href="${im.quelle}" target="_blank" rel="noopener">Quelle ↗</a>` : '';
      return `<figure class="zeichnung${im.u ? ' foto' : ''}">${inhalt}<figcaption>${esc(im.caption || '')}<span class="credit">${esc(im.credit || '')}${im.lizenz ? ' · ' + esc(im.lizenz) : ''}${quelle}</span></figcaption></figure>`;
    }).join('');
  }

  /* DACH-Besonderheiten */
  let dachHTML = '';
  if (n.dach) {
    const row = (cc,label,txt)=> txt?`<div class="dach-row dr-${label}"><span class="cc">${cc}</span><span>${esc(txt)}</span></div>`:'';
    dachHTML = `<div class="dach"><p class="sec-title">DACH: nationale Besonderheiten</p>${row('DE','de',n.dach.de)}${row('AT','at',n.dach.at)}${row('CH','ch',n.dach.ch)}<p class="dach-hint" hidden></p></div>`;
  }

  /* Normen & Quellen */
  let srcHTML = '';
  if (n.src && n.src.length) {
    srcHTML = `<div class="srcbox"><p class="sec-title">Normen und Quellen</p><ul>${
      n.src.map(s=>{
        const stand = s.stand ? ` <span class="stand">Stand: ${esc(s.stand)}</span>` : '';
        const body = s.u ? `<a href="${s.u}" target="_blank" rel="noopener">${esc(s.t)} ↗</a>` : esc(s.t);
        return `<li>${body}${stand}</li>`;
      }).join('')
    }</ul><p class="srcnote">Im Projekt stets aktuelle Fassung und Landesrecht prüfen; Angaben ohne Stand sind noch nicht quellengeprüft.</p></div>`;
  }

  const kids = kidsOf(id);
  const kidsHTML = kids.length
    ? `<div class="section"><p class="sec-title">Tiefer eintauchen · Ebene ${Math.min(n.lv+1,7)}</p>${
        kids.map(k=>`<a class="child" href="#${k}"><span>${esc(N[k].t)}<small>${N[k].t3?'bis Spezifikation':N[k].t2?'bis Vertiefung':'Überblick'}${kidsOf(k).length?' · '+kidsOf(k).length+' Unterthemen':''}${imgsIn(k)?` · <span class="hatbild">◪ ${imgsIn(k)} Bild${imgsIn(k)>1?'er':''}</span>`:''}</small></span><span class="arr">›</span></a>`).join('')
      }</div>`
    : (n.p === 'k' && !n.t3
        ? `<p class="endnote">Vertiefung und Spezifikation zu diesem Thema folgen.</p>`
        : '');

  const links = (n.ln||[]).filter(l=>N[l]);
  const linksHTML = links.length
    ? `<div class="section"><p class="sec-title">Quer einsteigen</p><div class="xlinks">${
        links.map(l=>`<a class="xlink xl-${P[N[l].p].cls}" href="#${l}">${P[N[l].p].name}: ${esc(N[l].t)}</a>`).join('')
      }</div></div>` : '';

  /* Entdeckungs-Threads: kuratierte Pfade quer durch die Perspektiven */
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

  return `<section id="${id}" class="pp-${n.p}">
  <nav class="crumbs">${crumbs}</nav>
  <div class="meta"><span class="badge b-${pp.cls}">${pp.name}</span>
    <span class="levels">${dots}<span class="lv">Ebene ${n.lv} von 7</span></span></div>
  <h1 class="node">${esc(n.t)}</h1>
  <div class="content">${depths}</div>
  ${imgHTML}${dachHTML}${srcHTML}${kidsHTML}${linksHTML}${threadHTML}
  <details class="netz"><summary>Netz-Ansicht <span class="plus">+</span></summary>
    <div class="netzbox">${netzSVG(id)}</div>
    <p class="netz-note">Durchgezogen: Hierarchie (oben Eltern, unten Kinder) · Gestrichelt: Querverweise. Antippen zum Navigieren.</p>
  </details>
</section>`;
}

/* Perspektiven als Einstiegsebene */
const PDESC = {
  k: 'Das Bauteilwissen: vom Themenfeld bis zum Ausschreibungsdetail, so tief wie das Thema es verlangt.',
  e: 'Das gestalterische Wissen: Entwurfsfragen quer zu den Bauteilen, von der Proportion bis zur Fügung.',
  x: 'Das Referenzwissen: Fallstudien und Haltungen, vom Städtebau bis zum Türgriff erschlossen.',
  p: 'Das Berufswissen: Ablauf, Honorar, Recht, Kosten und Vergabe, immer im Vergleich DE, AT, CH.'
};
const PORDER = ['k','e','x','p'];
const perspRoots = p => ROOTS.filter(([id]) => N[id].p === p);

const perspCards = PORDER.map(p => {
  const roots = perspRoots(p);
  const nodes = Object.values(N).filter(n => n.p === p).length;
  return `<a class="persp-card home-card hc-${p}" href="#persp-${p}">
    <span class="tag b-${p}">${P[p].name}</span>
    <p>${esc(PDESC[p])}</p>
    <p class="counts">${roots.length} Themenfelder · ${nodes} Einträge</p></a>`;
}).join('');

const home = `<section id="home">
  <p class="intro">Ein Wissensraum.<br>Vier Perspektiven.<br>Jede Tiefe.</p>
  <p class="intro-sub">Die gesamte Themenlandkarte der Architektur, kuratiert verschränkt: Konstruktion, Entwurf, Kontext und Prozess. Tiefe wächst dort, wo ein Thema sie verlangt. Querverweise verbinden die Perspektiven, DACH-Kästen zeigen nationale Unterschiede.</p>
  ${perspCards}
  ${THREADS.length ? `<p class="entdecken-titel">Entdecken: kuratierte Threads quer durch die Perspektiven</p>` + THREADS.map(th=>`<a class="persp-card thread-card" href="#${th.ids[0]}">
    <h2>${esc(th.titel)}</h2><p>${esc(th.kurz)}</p>
    <p class="counts">${th.ids.length} Stationen: ${th.ids.map(i=>esc((N[i]||{t:i}).t)).join(' › ')}</p></a>`).join('') : ''}
  <footer>ArchiPedia Prototyp · Stand 08/2026 · Inhalte sind Demonstrationstexte (KI-generiert, nicht fachgeprüft) und zeigen Struktur, Tonlage und Tiefenstaffelung, nicht finale Fachinformation. Normbezüge ohne Gewähr.</footer>
</section>`;

const perspSections = PORDER.map(p => `<section id="persp-${p}">
  <nav class="crumbs"><a href="#home">Start</a><span class="sep">›</span><span class="here">${P[p].name}</span></nav>
  <div class="meta"><span class="badge b-${p}">${P[p].name}</span></div>
  <h1 class="node">${P[p].name}</h1>
  <p class="intro-sub">${esc(PDESC[p])}</p>
  ${perspRoots(p).map(([id,desc])=>`<a class="persp-card" href="#${id}"><h2>${esc(N[id].t)}</h2><p>${esc(desc)}</p>${imgsIn(id)?`<p class="counts"><span class="hatbild">◪ ${imgsIn(id)} Bilder</span></p>`:''}</a>`).join('')}
</section>`).join('\n');

/* Menü: alle Themenfelder, nach Perspektive gruppiert */
const menu = `<details class="menu"><summary>Themen ☰</summary><div class="menu-panel">${
  PORDER.map(p => `<p class="menu-h" style="color:var(--${p})"><a href="#persp-${p}">${P[p].name}</a></p>${
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
  :root{
    --bg:#fcfcfb; --ink:#141310; --muted:#807b73; --line:#e3e1db; --card:#ffffff; --tint:#f1f0ec;
    --k:#2f5d7c; --k-bg:#eaf1f6; --e:#b05c3a; --e-bg:#f8ece5; --x:#4f7350; --x-bg:#ebf2ea; --p:#665a7c; --p-bg:#efecf3;
    --serif:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;
    --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
    --radius:2px;
  }
  [data-theme="dark"]{
    --bg:#171410; --ink:#eae4d9; --muted:#9d958a; --line:#332e26; --card:#1f1b16; --tint:#241f19;
    --k:#82abc9; --k-bg:#1e2933; --e:#d69275; --e-bg:#33251e; --x:#96b797; --x-bg:#212b20; --p:#a99cbd; --p-bg:#282232;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--bg);color:var(--ink);font:17px/1.75 var(--serif);padding-bottom:64px}
  a{color:inherit;text-decoration:none}
  .wrap{max-width:768px;margin:0 auto;padding:0 22px}
  header{border-bottom:1px solid var(--line);background:var(--bg);position:sticky;top:0;z-index:20}
  .head-in{display:flex;align-items:center;justify-content:space-between;padding:16px 0 10px}
  .wordmark{font-family:var(--sans);font-weight:800;font-size:24px;letter-spacing:-.02em}
  .wordmark span{color:var(--muted);font-size:10px;font-family:var(--sans);letter-spacing:.22em;text-transform:uppercase;margin-left:10px;vertical-align:2px}
  .topnav{display:flex;gap:22px;flex-wrap:wrap;align-items:center;padding-bottom:12px}
  .topnav .badge{font-weight:700;background:none;padding:0 0 3px;border:0;border-bottom:3px solid transparent}
  .b-k{color:var(--k)} .b-e{color:var(--e)} .b-x{color:var(--x)} .b-p{color:var(--p)}
  .topnav .b-k:hover{border-color:var(--k)} .topnav .b-e:hover{border-color:var(--e)} .topnav .b-x:hover{border-color:var(--x)} .topnav .b-p:hover{border-color:var(--p)}
  .landwahl{margin-left:auto;display:flex;gap:8px}
  .landwahl select,.thema,.menu summary{font-family:var(--sans);font-size:11px;letter-spacing:.06em;color:var(--muted);background:none;border:1px solid var(--line);border-radius:2px;padding:5px 10px;cursor:pointer;max-width:150px}
  .menu{position:relative}
  .menu summary{list-style:none;display:inline-block}
  .menu summary::-webkit-details-marker{display:none}
  .menu-panel{position:absolute;right:0;top:calc(100% + 10px);background:var(--card);border:1px solid var(--line);padding:18px 22px;width:min(82vw,360px);max-height:72vh;overflow:auto;box-shadow:0 14px 40px rgba(20,16,10,.14);z-index:30}
  .menu-h{font-family:var(--sans);font-size:10px;letter-spacing:.18em;text-transform:uppercase;margin:16px 0 6px;font-weight:600}
  .menu-h:first-child{margin-top:0}
  .menu-a{display:block;font-family:var(--serif);font-size:15px;padding:4px 0;border-bottom:1px solid var(--line)}
  .menu-a:last-of-type{border-bottom:0}
  .thema{margin-right:10px}
  main{padding-top:34px}
  main>section{display:none}
  main>section:target{display:block}
  main:not(:has(section:target))>#home{display:block}
  .intro{font-family:var(--sans);font-weight:800;font-size:52px;line-height:1.04;margin-bottom:18px;letter-spacing:-.03em}
  .intro-sub{color:var(--muted);font-family:var(--sans);font-size:13.5px;line-height:1.65;max-width:56ch;margin-bottom:40px}
  .persp-card{display:block;border-top:2px solid var(--ink);padding:20px 0 26px;position:relative}
  .home-card::before{content:"";position:absolute;top:-2px;left:0;width:64px;height:6px}
  .hc-k::before{background:var(--k)} .hc-e::before{background:var(--e)} .hc-x::before{background:var(--x)} .hc-p::before{background:var(--p)}
  .thread-card::before{content:"";position:absolute;top:-2px;left:0;width:64px;height:6px;background:var(--ink)}
  .persp-card:hover h2{text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:4px}
  .persp-card .tag{display:inline-block;font-family:var(--sans);font-weight:700;font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;margin-bottom:12px;background:none;padding:0}
  .persp-card h2{font-family:var(--sans);font-weight:800;font-size:28px;letter-spacing:-.02em;margin-bottom:8px;line-height:1.12}
  .persp-card p{font-size:15px;color:var(--muted);line-height:1.6;max-width:60ch}
  .persp-card .counts{font-family:var(--sans);font-size:11px;margin-top:8px;letter-spacing:.03em}
  .home-card,.hc-k,.hc-e,.hc-x,.hc-p{border-left:0}
  .thread-card{border-left:0}
  .entdecken-titel{font-family:var(--sans);font-weight:800;font-size:22px;letter-spacing:-.02em;color:var(--ink);margin:64px 0 10px}
  .crumbs{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:26px;font-family:var(--sans);font-size:11px;letter-spacing:.04em}
  .crumbs a{color:var(--muted)}
  .crumbs a:hover{color:var(--ink)}
  .crumbs .sep{color:var(--line)}
  .crumbs .here{color:var(--ink)}
  .meta{display:flex;gap:14px;align-items:center;margin-bottom:10px;flex-wrap:wrap}
  .badge{font-family:var(--sans);font-weight:700;font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;background:none;padding:0}
  .levels{display:flex;gap:3px;align-items:center}
  .levels i{width:5px;height:5px;border-radius:50%;background:var(--line);display:inline-block}
  .levels i.on{background:var(--muted)}
  .levels .lv{font-family:var(--sans);font-size:10px;color:var(--muted);margin-left:6px;letter-spacing:.06em}
  h1.node{font-family:var(--sans);font-weight:800;font-size:44px;line-height:1.06;letter-spacing:-.025em;margin-bottom:24px}
  .content{margin-bottom:26px}
  .dlbl{display:none}
  .d1 p:last-child{font-size:20px;line-height:1.62;letter-spacing:.002em}
  details.depth{border-top:1px solid var(--line);margin-top:20px;background:none}
  details.depth summary{list-style:none;cursor:pointer;padding:13px 0;font-family:var(--sans);font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);display:flex;justify-content:space-between;align-items:center}
  details.depth summary:hover{color:var(--ink)}
  details.depth summary::-webkit-details-marker{display:none}
  details.depth .plus,details.netz .plus{font-size:15px;color:var(--line)}
  details.depth[open] .plus{display:none}
  details.depth .dbody{padding:0 0 16px;font-size:16.5px;line-height:1.72}
  .unchecked{margin-top:10px;font-family:var(--sans);font-size:10.5px;letter-spacing:.04em;color:#a2703f;background:var(--tint);padding:5px 9px;display:inline-block}
  .nohint{margin-top:14px;padding-top:12px;border-top:1px solid var(--line);font-family:var(--sans);font-size:12px;color:var(--muted)}
  figure.zeichnung{background:#ffffff;border:1px solid var(--line);padding:18px 18px 12px;margin:0 0 28px}
  figure.zeichnung.foto{background:none;border:0;padding:0}
  figure.zeichnung svg{width:100%;height:auto;display:block}
  figure.zeichnung.foto img{width:100%;height:auto;display:block}
  figure.zeichnung figcaption{font-family:var(--serif);font-style:italic;font-size:14px;color:#6f6a61;margin-top:10px;padding-top:0;border:0}
  figure.zeichnung.foto figcaption{color:var(--muted)}
  figure.zeichnung .credit{display:block;font-style:normal;font-family:var(--sans);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;margin-top:5px;color:#a29b8d}
  figure.zeichnung .credit a{text-decoration:underline;text-underline-offset:2px;text-transform:none;letter-spacing:.04em}
  .dach{background:var(--tint);border-left:6px solid var(--ink);padding:18px 22px 12px;margin-bottom:32px}
  .dach-row{display:flex;gap:14px;font-size:15px;line-height:1.65;margin-bottom:8px}
  .dach-row .cc{flex:0 0 26px;font-family:var(--sans);font-size:10px;font-weight:600;letter-spacing:.1em;color:var(--muted);padding-top:4px}
  .dach-hint{font-family:var(--sans);font-size:11px;color:var(--muted);margin-top:8px;border-top:1px solid var(--line);padding-top:8px}
  .srcbox{border-top:2px solid var(--ink);padding:14px 0 6px;margin-bottom:34px}
  .srcbox ul{list-style:none}
  .srcbox li{font-family:var(--sans);font-size:13px;padding:5px 0;border-bottom:1px dotted var(--line)}
  .srcbox li:last-child{border-bottom:0}
  .srcbox a{text-decoration:underline;text-underline-offset:3px;text-decoration-color:var(--line)}
  .srcbox a:hover{text-decoration-color:var(--ink)}
  .srcbox .stand{display:inline-block;margin-left:8px;font-size:10.5px;color:var(--muted);background:var(--tint);padding:1px 7px}
  .srcnote{font-family:var(--sans);font-size:11px;color:var(--muted);margin-top:8px}
  .sec-title{font-family:var(--sans);font-weight:700;font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;color:var(--ink);margin:0 0 10px}
  .section{margin-bottom:42px;border-top:2px solid var(--ink);padding-top:14px}
  .child{display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid var(--line);padding:14px 0;font-family:var(--sans);font-weight:600;font-size:16.5px;letter-spacing:-.01em}
  .child:hover span:first-child{text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:4px}
  .child .arr{color:var(--line);font-size:16px;margin-left:12px}
  .child small{display:block;font-family:var(--sans);color:var(--muted);font-size:11px;margin-top:3px;letter-spacing:.03em;text-decoration:none!important}
  .endnote{font-family:var(--sans);font-size:11.5px;color:var(--muted);margin-bottom:30px}
  .hatbild{color:#8a7f6a}
  /* Suche */
  .such{position:relative;margin-left:auto;margin-right:10px}
  .such input{font-family:var(--sans);font-size:12px;color:var(--ink);background:none;border:1px solid var(--line);border-radius:2px;padding:5px 10px;width:130px;transition:width .15s}
  .such input:focus{width:200px;outline:none;border-color:var(--ink)}
  .such-panel{position:absolute;right:0;top:calc(100% + 8px);background:var(--card);border:1px solid var(--ink);width:min(84vw,380px);max-height:64vh;overflow:auto;box-shadow:0 14px 40px rgba(20,16,10,.16);z-index:40}
  .such-t{display:block;padding:10px 14px;border-bottom:1px solid var(--line)}
  .such-t:hover{background:var(--tint)}
  .such-p{display:inline-block;font-family:var(--sans);font-weight:700;font-size:9px;letter-spacing:.16em;text-transform:uppercase;margin-right:8px}
  .such-titel{font-family:var(--sans);font-weight:600;font-size:14px}
  .such-pfad{display:block;font-family:var(--sans);font-size:11px;color:var(--muted);margin-top:2px}
  .such-leer{padding:12px 14px;font-family:var(--sans);font-size:12px;color:var(--muted)}
  .landwahl{margin-left:0}
  /* Perspektivfarbe als Leitsystem auf Knotenseiten */
  h1.node::after{content:"";display:block;width:72px;height:6px;margin-top:14px}
  .pp-k h1.node::after{background:var(--k)} .pp-e h1.node::after{background:var(--e)} .pp-x h1.node::after{background:var(--x)} .pp-p h1.node::after{background:var(--p)}
  .pp-k .section,.pp-k .srcbox{border-top-color:var(--k)} .pp-e .section,.pp-e .srcbox{border-top-color:var(--e)}
  .pp-x .section,.pp-x .srcbox{border-top-color:var(--x)} .pp-p .section,.pp-p .srcbox{border-top-color:var(--p)}
  .pp-k .dach,.pp-k .thread{border-left-color:var(--k)} .pp-e .dach,.pp-e .thread{border-left-color:var(--e)}
  .pp-x .dach,.pp-x .thread{border-left-color:var(--x)} .pp-p .dach,.pp-p .thread{border-left-color:var(--p)}
  .pp-k details.depth summary:hover{color:var(--k)} .pp-e details.depth summary:hover{color:var(--e)}
  .pp-x details.depth summary:hover{color:var(--x)} .pp-p details.depth summary:hover{color:var(--p)}
  #persp-k .persp-card,#persp-e .persp-card,#persp-x .persp-card,#persp-p .persp-card{position:relative}
  #persp-k .persp-card::before,#persp-e .persp-card::before,#persp-x .persp-card::before,#persp-p .persp-card::before{content:"";position:absolute;top:-2px;left:0;width:64px;height:6px}
  #persp-k .persp-card::before{background:var(--k)} #persp-e .persp-card::before{background:var(--e)}
  #persp-x .persp-card::before{background:var(--x)} #persp-p .persp-card::before{background:var(--p)}
  .xlinks{display:flex;flex-wrap:wrap;gap:8px 20px}
  .xlink{font-family:var(--sans);font-size:12.5px;letter-spacing:.02em;background:none;border:0;padding:2px 0;border-bottom:1px solid var(--line);display:inline-block}
  .xl-k{color:var(--k)} .xl-e{color:var(--e)} .xl-x{color:var(--x)} .xl-p{color:var(--p)}
  .xl-k:hover{border-color:var(--k)} .xl-e:hover{border-color:var(--e)} .xl-x:hover{border-color:var(--x)} .xl-p:hover{border-color:var(--p)}
  .thread{background:var(--tint);border-left:6px solid var(--ink);padding:16px 20px;margin-bottom:42px}
  .th-row{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:4px}
  .th-nav{font-family:var(--serif);font-size:15.5px;text-decoration:underline;text-underline-offset:3px;text-decoration-color:var(--line)}
  .th-nav:hover{text-decoration-color:var(--ink)}
  .th-next{margin-left:auto;text-align:right}
  .th-ende{font-family:var(--sans);font-size:11px;color:var(--muted);margin-left:auto}
  details.netz{border-top:1px solid var(--line);padding-top:2px;margin-top:2px}
  details.netz summary{list-style:none;cursor:pointer;padding:13px 0;font-family:var(--sans);font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);display:flex;justify-content:space-between}
  details.netz summary::-webkit-details-marker{display:none}
  .netzbox{background:#ffffff;border:1px solid var(--line);padding:8px}
  svg{width:100%;height:auto;display:block}
  svg text{font-size:11px;fill:#1c1a17;font-family:-apple-system,sans-serif}
  svg text.ctr{font-size:12.5px;font-weight:600}
  .netz-note{font-family:var(--sans);font-size:11px;color:var(--muted);text-align:center;margin-top:10px}
  footer{margin-top:60px;padding:20px 0 8px;border-top:1px solid var(--line);font-family:var(--sans);font-size:11px;color:var(--muted);line-height:1.7}
</style>
<script>var SUCHINDEX=${SUCHINDEX};</script>
<script>(function(){var t=localStorage.getItem('ao_theme')||'auto';var d=t==='dark'||(t==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';})();</script>
</head>
<body>
<header><div class="wrap"><div class="head-in">
  <a class="wordmark" href="#home">ArchiPedia<span>Prototyp</span></a>
  <span style="display:flex;align-items:center"><button class="thema" id="thema" type="button">◐ Auto</button>${menu}</span>
</div>
<nav class="topnav">
  <a class="badge b-k" href="#persp-k">Konstruktion</a>
  <a class="badge b-e" href="#persp-e">Entwurf</a>
  <a class="badge b-x" href="#persp-x">Kontext</a>
  <a class="badge b-p" href="#persp-p">Prozess</a>
  <span class="such"><input id="suche" type="search" placeholder="Suche" autocomplete="off"><div class="such-panel" id="suchpanel" hidden></div></span>
  <span class="landwahl">
    <select id="land" aria-label="Land wählen">
      <option value="alle">DACH: alle</option>
      <option value="de">Deutschland</option>
      <option value="at">Österreich</option>
      <option value="ch">Schweiz</option>
    </select>
    <select id="region" aria-label="Region wählen" hidden></select>
  </span>
</nav></div></header>
<main class="wrap">
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
          return '<a class="such-t" href="#' + e[0] + '"><span class="such-p b-' + e[2] + '">' + PNAME[e[2]] + '</span><span class="such-titel">' + e[1] + '</span>' + (e[3] ? '<span class="such-pfad">' + e[3] + '</span>' : '') + '</a>'; }).join('')
      : '<p class="such-leer">Nichts gefunden.</p>';
    panel.hidden = false;
  }
  inp.addEventListener('input', suchen);
  inp.addEventListener('keydown', function(ev){
    if (ev.key === 'Enter') { var a = panel.querySelector('a'); if (a) location.hash = a.getAttribute('href'); }
    if (ev.key === 'Escape') { panel.hidden = true; inp.blur(); }
  });
  document.addEventListener('keydown', function(ev){
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
console.log('nodes:', Object.keys(N).length, '· bytes:', html.length, '→ dist/index.html');

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
