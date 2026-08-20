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

  return `<section id="${id}">
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
  k: 'Das Bauteilwissen: vom Themenfeld bis zum Ausschreibungsdetail, in bis zu 7 Ebenen.',
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
  <p class="intro">Ein Wissensraum, vier Perspektiven, jede Tiefe.</p>
  <p class="intro-sub">Begehbares Gerüst der gesamten Themenlandkarte, jedes Themenfeld bis Ebene 3 mit Überblickstexten; die Muster-Äste Türen und Treppen reichen tiefer. Querverweise verbinden die Perspektiven, DACH-Kästen zeigen nationale Unterschiede.</p>
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

const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ArchiPedia · Navigations-Prototyp</title>
<style>
  :root{
    --bg:#faf8f4; --ink:#1c1a17; --muted:#6f6a61; --line:#e5e0d6; --card:#ffffff;
    --k:#2f5d7c; --k-bg:#eaf1f6; --e:#b05c3a; --e-bg:#f8ece5; --x:#4f7350; --x-bg:#ebf2ea; --p:#665a7c; --p-bg:#efecf3;
    --radius:10px;
  }
  [data-theme="dark"]{
    --bg:#181613; --ink:#e9e5dd; --muted:#a49c90; --line:#37332c; --card:#211e1a;
    --k:#82abc9; --k-bg:#1e2933; --e:#d69275; --e-bg:#33251e; --x:#96b797; --x-bg:#212b20; --p:#a99cbd; --p-bg:#282232;
  }
  [data-theme="dark"] details.depth{background:#1c1915}
  [data-theme="dark"] .dach,[data-theme="dark"] .thread,[data-theme="dark"] .srcbox .stand{background:#26221c}
  [data-theme="dark"] .unchecked{background:#33291a;color:#d9b988}
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--bg);color:var(--ink);font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding-bottom:40px}
  a{color:inherit;text-decoration:none}
  .wrap{max-width:760px;margin:0 auto;padding:0 18px}
  header{border-bottom:1px solid var(--line);background:var(--bg);position:sticky;top:0;z-index:20}
  .head-in{display:flex;align-items:center;justify-content:space-between;padding:12px 0 8px}
  .topnav{display:flex;gap:7px;flex-wrap:wrap;padding-bottom:10px}
  .topnav .badge{border:1px solid transparent}
  .menu{position:relative}
  .menu summary{list-style:none;cursor:pointer;font-size:12.5px;letter-spacing:.05em;color:var(--muted);border:1px solid var(--line);border-radius:99px;padding:5px 12px;background:var(--card)}
  .menu summary::-webkit-details-marker{display:none}
  .menu-panel{position:absolute;right:0;top:calc(100% + 8px);background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px 16px;width:min(80vw,340px);max-height:72vh;overflow:auto;box-shadow:0 10px 28px rgba(28,26,23,.12);z-index:30}
  .menu-h{font-size:11px;letter-spacing:.09em;text-transform:uppercase;margin:12px 0 4px;font-weight:600}
  .menu-h:first-child{margin-top:0}
  .menu-a{display:block;font-size:13.5px;padding:3px 0;border-bottom:1px dotted var(--line)}
  .menu-a:last-of-type{border-bottom:0}
  .home-card{border-left:4px solid var(--line)}
  .hc-k{border-left-color:var(--k)} .hc-e{border-left-color:var(--e)} .hc-x{border-left-color:var(--x)} .hc-p{border-left-color:var(--p)}
  .home-card .counts{font-size:12px;color:var(--muted);margin-top:7px}
  .landwahl{margin-left:auto;display:flex;gap:6px}
  .landwahl select{font-size:12px;color:var(--ink);background:var(--card);border:1px solid var(--line);border-radius:99px;padding:4px 9px;max-width:150px}
  body[data-land="de"] .dach-row.dr-at, body[data-land="de"] .dach-row.dr-ch,
  body[data-land="at"] .dach-row.dr-de, body[data-land="at"] .dach-row.dr-ch,
  body[data-land="ch"] .dach-row.dr-de, body[data-land="ch"] .dach-row.dr-at{display:none}
  .dach-hint{font-size:11.5px;color:var(--muted);margin-top:6px;border-top:1px dashed var(--line);padding-top:6px}
  figure.zeichnung{background:#fdfcfa;border:1px solid var(--line);border-radius:var(--radius);padding:14px 14px 10px;margin:0 0 14px}
  figure.zeichnung svg{width:100%;height:auto;display:block}
  figure.zeichnung figcaption{font-size:12.5px;color:#6f6a61;margin-top:8px;border-top:1px dotted #e5e0d6;padding-top:7px}
  figure.zeichnung .credit{display:block;font-size:11px;margin-top:2px;color:#a29b8d}
  figure.zeichnung.foto{background:var(--card)}
  figure.zeichnung.foto img{width:100%;height:auto;display:block;border-radius:6px}
  figure.zeichnung.foto figcaption{color:var(--muted);border-top-color:var(--line)}
  figure.zeichnung.foto .credit a{text-decoration:underline;text-underline-offset:2px}
  .thema{font-size:12.5px;color:var(--muted);border:1px solid var(--line);border-radius:99px;padding:5px 12px;background:var(--card);cursor:pointer;margin-right:8px}
  .thread{background:#f4f1ea;border:1px solid var(--line);border-radius:var(--radius);padding:12px 15px;margin-bottom:26px}
  .th-row{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}
  .th-nav{font-size:13.5px;text-decoration:underline;text-underline-offset:3px;text-decoration-color:var(--line)}
  .th-next{margin-left:auto;text-align:right}
  .th-ende{font-size:12px;color:var(--muted);margin-left:auto}
  .entdecken-titel{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:26px 0 10px}
  .thread-card{border-left:4px solid #8a7f6a}
  .thread-card .counts{white-space:normal;line-height:1.5}
  .wordmark{font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:.3px}
  .wordmark span{color:var(--muted);font-size:12px;font-family:-apple-system,sans-serif;letter-spacing:.08em;text-transform:uppercase;margin-left:8px}
  main{padding-top:22px}
  main>section{display:none}
  main>section:target{display:block}
  main:not(:has(section:target))>#home{display:block}
  .intro{font-family:Georgia,serif;font-size:19px;line-height:1.5;margin-bottom:6px}
  .intro-sub{color:var(--muted);font-size:14px;margin-bottom:24px}
  .persp-card{display:block;border:1px solid var(--line);border-radius:var(--radius);background:var(--card);padding:18px;margin-bottom:12px}
  .persp-card .tag{display:inline-block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:3px 9px;border-radius:99px;margin-bottom:8px}
  .persp-card h2{font-family:Georgia,serif;font-size:20px;font-weight:400;margin-bottom:4px}
  .persp-card p{font-size:13.5px;color:var(--muted)}
  .crumbs{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin-bottom:14px;font-size:12.5px}
  .crumbs a{color:var(--muted);text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:3px}
  .crumbs .sep{color:#c9c2b4}
  .crumbs .here{color:var(--ink)}
  .meta{display:flex;gap:10px;align-items:center;margin-bottom:8px;flex-wrap:wrap}
  .badge{font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:3px 9px;border-radius:99px}
  .b-k{background:var(--k-bg);color:var(--k)} .b-e{background:var(--e-bg);color:var(--e)} .b-x{background:var(--x-bg);color:var(--x)} .b-p{background:var(--p-bg);color:var(--p)}
  .levels{display:flex;gap:3px;align-items:center}
  .levels i{width:7px;height:7px;border-radius:50%;background:var(--line);display:inline-block}
  .levels i.on{background:var(--ink)}
  .levels .lv{font-size:11px;color:var(--muted);margin-left:5px}
  h1.node{font-family:Georgia,serif;font-size:27px;font-weight:400;line-height:1.25;margin-bottom:14px}
  .content{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:16px 16px 14px;margin-bottom:14px}
  .dlbl{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:5px}
  .d1 p:last-child{font-size:15.5px;line-height:1.65}
  details.depth{border:1px solid var(--line);border-radius:8px;margin-top:12px;background:#fdfcfa}
  details.depth summary{list-style:none;cursor:pointer;padding:9px 13px;font-size:12.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);display:flex;justify-content:space-between;align-items:center}
  details.depth summary::-webkit-details-marker{display:none}
  details.depth .plus,details.netz .plus{font-size:15px;color:#c9c2b4}
  details.depth[open] .plus{display:none}
  details.depth .dbody{padding:2px 13px 12px;font-size:15px;line-height:1.62}
  .unchecked{margin-top:8px;font-size:11.5px;color:#a2703f;background:#faf3e8;border-radius:6px;padding:5px 9px;display:inline-block}
  .nohint{margin-top:12px;padding-top:10px;border-top:1px dashed var(--line);font-size:12.5px;color:var(--muted)}
  .dach{background:#f4f1ea;border:1px solid var(--line);border-radius:var(--radius);padding:13px 15px 11px;margin-bottom:14px}
  .dach-row{display:flex;gap:10px;font-size:13.5px;line-height:1.5;margin-bottom:6px}
  .dach-row .cc{flex:0 0 26px;font-size:11px;font-weight:600;letter-spacing:.05em;color:var(--muted);padding-top:2px}
  .srcbox{border:1px solid var(--line);border-radius:var(--radius);background:var(--card);padding:13px 15px 11px;margin-bottom:22px}
  .srcbox ul{list-style:none}
  .srcbox li{font-size:13.5px;padding:3px 0;border-bottom:1px dotted var(--line)}
  .srcbox li:last-child{border-bottom:0}
  .srcbox a{color:var(--k);text-decoration:underline;text-underline-offset:3px}
  .srcbox .stand{display:inline-block;margin-left:6px;font-size:11px;color:var(--muted);background:#f4f1ea;border-radius:4px;padding:1px 6px}
  .srcnote{font-size:11.5px;color:var(--muted);margin-top:7px}
  .sec-title{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 0 10px}
  .section{margin-bottom:26px}
  .child{display:flex;justify-content:space-between;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:13px 15px;margin-bottom:8px;font-size:15px}
  .child .arr{color:#c9c2b4;font-size:16px;margin-left:10px}
  .child small{display:block;color:var(--muted);font-size:12px;margin-top:1px}
  .hatbild{color:#8a7f6a}
  .endnote{font-size:12px;color:var(--muted);margin-bottom:26px}
  .xlinks{display:flex;flex-wrap:wrap;gap:8px}
  .xlink{border:1px solid;border-radius:99px;padding:6px 13px;font-size:13px;background:var(--card);display:inline-block}
  .xl-k{color:var(--k);border-color:#bcd0de} .xl-e{color:var(--e);border-color:#e4c3b3} .xl-x{color:var(--x);border-color:#c2d4c3} .xl-p{color:var(--p);border-color:#cdc5d8}
  details.netz{border-top:1px solid var(--line);padding-top:4px;margin-top:4px}
  details.netz summary{list-style:none;cursor:pointer;padding:9px 0;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);display:flex;justify-content:space-between}
  details.netz summary::-webkit-details-marker{display:none}
  .netzbox{background:#fdfcfa;border:1px solid var(--line);border-radius:var(--radius);padding:6px}
  svg{width:100%;height:auto;display:block}
  svg text{font-size:11px;fill:#1c1a17;font-family:-apple-system,sans-serif}
  svg text.ctr{font-size:12.5px;font-weight:600}
  .netz-note{font-size:12.5px;color:var(--muted);text-align:center;margin-top:8px}
  footer{margin-top:34px;padding:16px 0 8px;border-top:1px solid var(--line);font-size:12px;color:var(--muted)}
</style>
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
