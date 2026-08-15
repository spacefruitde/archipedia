import { writeFileSync, mkdirSync } from 'fs';
import { P, N, ROOTS } from './data.mjs';

const DEPTHS = [['t1','Überblick'],['t2','Vertiefung'],['t3','Spezifikation']];
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const kidsOf = id => Object.entries(N).filter(([,n]) => n.pa === id).map(([k]) => k);
const pathOf = id => { const p=[]; let c=id; while(c){p.unshift(c); c=N[c].pa;} return p; };
const colOf = p => p==='k' ? '#2f5d7c' : p==='e' ? '#b05c3a' : '#4f7350';

function netzSVG(id){
  const n = N[id];
  const nodes = [{id, x:0, y:0, c:true}];
  if (n.pa) nodes.push({id:n.pa, x:0, y:-130});
  const kids = kidsOf(id);
  kids.forEach((k,i)=>{ const spread=Math.min(kids.length,5);
    nodes.push({id:k, x:(i-(kids.length-1)/2)*(360/Math.max(spread,2)), y:135}); });
  const links = (n.ln||[]).filter(l=>N[l] && !nodes.some(m=>m.id===l));
  links.forEach((l,i)=>{ const side=i%2?1:-1;
    nodes.push({id:l, x:side*195, y:-45+Math.floor(i/2)*72, xl:true}); });
  const W=480, H=360, cx=W/2, cy=H/2-15;
  const edges = nodes.filter(m=>!m.c).map(m=>{
    const dash = m.xl ? 'stroke-dasharray="4 4"' : '';
    return `<line x1="${cx}" y1="${cy}" x2="${cx+m.x}" y2="${cy+m.y}" stroke="#d8d2c4" stroke-width="1.3" ${dash}/>`;
  }).join('');
  const circles = nodes.map(m=>{
    const t = N[m.id].t;
    const short = t.length>22 ? t.slice(0,21)+'…' : t;
    const anchor = m.xl ? (m.x<0?'start':'end') : 'middle';
    const tx = cx+m.x + (m.xl ? (m.x<0?-8:8) : 0);
    const ty = cy+m.y + (m.y>=0 && !m.c ? 24 : m.c ? -22 : -18);
    const col = colOf(N[m.id].p);
    const inner = `<circle cx="${cx+m.x}" cy="${cy+m.y}" r="${m.c?13:8}" fill="${m.c?col:'#fff'}" stroke="${col}" stroke-width="2"/>
      <text x="${tx}" y="${ty}" text-anchor="${anchor}" ${m.c?'class="ctr"':''}>${esc(short)}</text>`;
    return m.c ? `<g>${inner}</g>` : `<a href="#${m.id}">${inner}</a>`;
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}">${edges}${circles}</svg>`;
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

  /* DACH-Besonderheiten */
  let dachHTML = '';
  if (n.dach) {
    const row = (cc,label,txt)=> txt?`<div class="dach-row"><span class="cc">${cc}</span><span>${esc(txt)}</span></div>`:'';
    dachHTML = `<div class="dach"><p class="sec-title">DACH: nationale Besonderheiten</p>${row('DE','de',n.dach.de)}${row('AT','at',n.dach.at)}${row('CH','ch',n.dach.ch)}</div>`;
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
        kids.map(k=>`<a class="child" href="#${k}"><span>${esc(N[k].t)}<small>${N[k].t3?'bis Spezifikation':N[k].t2?'bis Vertiefung':'Überblick'}${kidsOf(k).length?' · '+kidsOf(k).length+' Unterthemen':''}</small></span><span class="arr">›</span></a>`).join('')
      }</div>`
    : `<div class="section"><p class="sec-title">Ende dieses Astes</p><p class="endnote">Ab hier übernehmen Spezialquellen (Norm, Hersteller, Fachplaner). ArchiPedia verweist, statt Vollständigkeit vorzutäuschen.</p></div>`;

  const links = (n.ln||[]).filter(l=>N[l]);
  const linksHTML = links.length
    ? `<div class="section"><p class="sec-title">Quer einsteigen</p><div class="xlinks">${
        links.map(l=>`<a class="xlink xl-${P[N[l].p].cls}" href="#${l}">${P[N[l].p].name}: ${esc(N[l].t)}</a>`).join('')
      }</div></div>` : '';

  return `<section id="${id}">
  <nav class="crumbs">${crumbs}</nav>
  <div class="meta"><span class="badge b-${pp.cls}">${pp.name}</span>
    <span class="levels">${dots}<span class="lv">Ebene ${n.lv} von 7</span></span></div>
  <h1 class="node">${esc(n.t)}</h1>
  <div class="content">${depths}</div>
  ${dachHTML}${srcHTML}${kidsHTML}${linksHTML}
  <details class="netz"><summary>Netz-Ansicht <span class="plus">+</span></summary>
    <div class="netzbox">${netzSVG(id)}</div>
    <p class="netz-note">Durchgezogen: Hierarchie (oben Eltern, unten Kinder) · Gestrichelt: Querverweise. Antippen zum Navigieren.</p>
  </details>
</section>`;
}

const cards = ROOTS.map(([id,desc])=>{
  const n = N[id], pp = P[n.p];
  return `<a class="persp-card" href="#${id}">
    <span class="tag b-${pp.cls}">${pp.name}</span>
    <h2>${esc(n.t)}</h2><p>${esc(desc)}</p></a>`;
}).join('');

const home = `<section id="home">
  <p class="intro">Ein Wissensraum, drei Perspektiven, jede Tiefe.</p>
  <p class="intro-sub">Prototyp der Navigationsidee mit zwei Themen: „Türen" (Muster-Ast) und „Treppen" (nach Autoren-Spezifikation generierter Testlauf). Jeder Eintrag zeigt einen Überblick; „Vertiefung" und „Spezifikation" lassen sich aufklappen, wo es sie gibt. Querverweise verbinden die Perspektiven, DACH-Kästen zeigen nationale Unterschiede.</p>
  ${cards}
  <footer>ArchiPedia Prototyp · Stand 08/2026 · Inhalte sind Demonstrationstexte (KI-generiert, nicht fachgeprüft) und zeigen Struktur, Tonlage und Tiefenstaffelung, nicht finale Fachinformation. Normbezüge ohne Gewähr.</footer>
</section>`;

const sections = home + Object.keys(N).map(nodeSection).join('\n');

const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ArchiPedia · Navigations-Prototyp</title>
<style>
  :root{
    --bg:#faf8f4; --ink:#1c1a17; --muted:#6f6a61; --line:#e5e0d6; --card:#ffffff;
    --k:#2f5d7c; --k-bg:#eaf1f6; --e:#b05c3a; --e-bg:#f8ece5; --x:#4f7350; --x-bg:#ebf2ea;
    --radius:10px;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--bg);color:var(--ink);font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding-bottom:40px}
  a{color:inherit;text-decoration:none}
  .wrap{max-width:760px;margin:0 auto;padding:0 18px}
  header{border-bottom:1px solid var(--line);background:var(--bg)}
  .head-in{display:flex;align-items:baseline;justify-content:space-between;padding:14px 0 12px}
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
  .b-k{background:var(--k-bg);color:var(--k)} .b-e{background:var(--e-bg);color:var(--e)} .b-x{background:var(--x-bg);color:var(--x)}
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
  .endnote{font-size:13.5px;color:var(--muted)}
  .xlinks{display:flex;flex-wrap:wrap;gap:8px}
  .xlink{border:1px solid;border-radius:99px;padding:6px 13px;font-size:13px;background:#fff;display:inline-block}
  .xl-k{color:var(--k);border-color:#bcd0de} .xl-e{color:var(--e);border-color:#e4c3b3} .xl-x{color:var(--x);border-color:#c2d4c3}
  details.netz{border-top:1px solid var(--line);padding-top:4px;margin-top:4px}
  details.netz summary{list-style:none;cursor:pointer;padding:9px 0;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);display:flex;justify-content:space-between}
  details.netz summary::-webkit-details-marker{display:none}
  .netzbox{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:6px}
  svg{width:100%;height:auto;display:block}
  svg text{font-size:11px;fill:var(--ink);font-family:-apple-system,sans-serif}
  svg text.ctr{font-size:12.5px;font-weight:600}
  .netz-note{font-size:12.5px;color:var(--muted);text-align:center;margin-top:8px}
  footer{margin-top:34px;padding:16px 0 8px;border-top:1px solid var(--line);font-size:12px;color:var(--muted)}
</style>
</head>
<body>
<header><div class="wrap"><div class="head-in">
  <a class="wordmark" href="#home">ArchiPedia<span>Prototyp</span></a>
</div></div></header>
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
    window.scrollTo(0,0);
  }
  window.addEventListener('hashchange', sync); sync();
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
  if (kidsOf(id).length > 7) { console.log('⚠ mehr als 7 Kinder:', id); warn++; }
  if (n.t3 && !/Ab hier/.test(n.t3)) { console.log('⚠ T3 ohne "Ab hier"-Absprung:', id); warn++; }
  if (!n.t1) { console.log('⚠ T1 fehlt:', id); warn++; }
}
console.log(warn ? warn+' Warnungen' : 'Konsistenzprüfung: keine Warnungen');
