// Shared render components and utilities.
// Loaded as a plain <script> before js/pages.js.
// All functions are top-level declarations — no module exports.

// ─── Icons ───────────────────────────────────────────────────────────────────

// Build an inline stroked icon SVG (24-unit grid, currentColor, round caps), `size` px square.
function strokeIcon(body, size = 15){
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

function iconSVG(name){
  const map = {
    research:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    cv:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M12 18v-6m-3 3 3 3 3-3"/>',
    scholar:'<path d="M22 10 12 4 2 10l10 6 10-6Z"/><path d="M6 12v5a6 6 0 0 0 12 0v-5"/>',
    email:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    fingerprint:'<path d="M12 11c0 4-.5 7-2 9"/><path d="M16 12c0 5-1 8-2 9"/><path d="M8 14c0 2.5-.5 5-1 6"/><path d="M4 11a8 8 0 0 1 16 0v3"/><path d="M20 16a18 18 0 0 1-1 5"/>',
    aperture:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
    compass:'<circle cx="12" cy="12" r="9"/><path d="m15 9-2 6-4 1 2-6Z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',
    close:'<path d="M18 6 6 18M6 6l12 12"/>',
  };
  return strokeIcon(map[name] || map.research);
}

// Escape text before interpolating into innerHTML (guards against `<`, `&`, `"` in YAML values).
function esc(s){
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Header / Footer / Backdrop ──────────────────────────────────────────────

function mountHeader(profile){
  const nav = [['Research','index.html#research'],['News','news.html'],['Publications','publications.html'],['Projects','projects.html'],['Teaching','teaching.html'],['Talks','talks.html'],['Contact','index.html#contact']];
  const here = document.body.dataset.page || '';
  const link = (cls, [label, href]) => {
    const key = label.toLowerCase();
    const cur = key === here ? ' aria-current="page"' : '';
    return `<a class="${cls}" href="${href}" data-nav="${key}"${cur}>${label}</a>`;
  };
  document.getElementById('site-header').innerHTML = `
    <div class="ll-header-inner">
      <a href="index.html" class="ll-logo ll-link"><span class="ll-logo-mark">👨🏻‍💻</span><span>${esc(profile.name)}</span></a>
      <nav class="ll-nav">${nav.map(n=>link('ll-nav-link', n)).join('')}</nav>
      <div class="ll-header-right">
        <button id="ll-hamburger" class="ll-hamburger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="ll-mobile-nav">${iconSVG('menu')}</button>
        <button id="ll-theme-toggle" class="ll-theme-toggle" type="button" aria-label="Toggle colour theme"></button>
        <a class="ll-cta-primary ll-header-cta" href="mailto:${esc(profile.email)}">Get in touch <span>→</span></a>
      </div>
    </div>
    <nav id="ll-mobile-nav" class="ll-mobile-nav" aria-label="Mobile">
      ${nav.map(n=>link('ll-mobile-link', n)).join('')}
      <a class="ll-mobile-link ll-mobile-cta" href="mailto:${esc(profile.email)}">Get in touch →</a>
    </nav>`;
}

// Light/dark theme toggle. The initial theme is set by an inline <head> script
// (no flash); this wires the button and persists the choice.
function setupThemeToggle(){
  const btn = document.getElementById('ll-theme-toggle');
  if(!btn) return;
  const sync = ()=>{
    const t = document.documentElement.getAttribute('data-theme') || 'dark';
    btn.innerHTML = iconSVG(t === 'light' ? 'moon' : 'sun');
    btn.setAttribute('aria-label', t === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    const meta = document.querySelector('meta[name="theme-color"]');   // mobile browser chrome
    if(meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  };
  sync();
  btn.addEventListener('click', ()=>{
    const next = (document.documentElement.getAttribute('data-theme') === 'light') ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch(e) {}
    sync();
  });
}

function mountFooter(profile){
  // Last deploy date (GitHub Pages sends Last-Modified for the HTML file).
  const updated = new Date(document.lastModified).toLocaleDateString('en-US',{month:'long',year:'numeric'});
  document.getElementById('site-footer').innerHTML = `
    <div class="ll-footer-inner">
      <div class="ll-foot-mono">© ${new Date().getFullYear()} ${esc(profile.name)} · DIMES, University of Calabria</div>
      <div class="ll-foot-mono"><span class="ll-dot-pulse"></span> Updated ${updated}</div>
    </div>`;
}

// Bind the home hero + contact email from profile.yaml so it is the single source of
// truth. The HTML carries the same values as a no-JS / crawler fallback; this overwrites
// them at runtime, so editing profile.yaml is what actually takes effect.
function mountHero(p){
  const set = (id, html) => { const el = document.getElementById(id); if(el) el.innerHTML = html; };

  if(p.role) set('hero-eyebrow', `<span class="ll-dot-pulse"></span> ${esc(p.role)}`);

  const av = document.getElementById('hero-avatar');
  if(av && p.photo){ av.src = p.photo; av.alt = p.name || ''; }

  // Keep the surname on one line (non-breaking space before the last word) + design period.
  if(p.name) set('hero-name', esc(p.name).replace(/ (\S+)$/, ' $1') + '.');

  const meta = [];
  if(p.title) meta.push(`<span class="ll-dim">${esc(p.title)}</span>`);
  meta.push(`<span>${esc(p.affiliation||'')}${p.flag?' '+esc(p.flag):''}</span>`);
  if(p.orcid) meta.push(`<span>ORCID <a class="ll-link ll-dim" target="_blank" rel="noopener" href="https://orcid.org/${esc(p.orcid)}">${esc(p.orcid)}</a></span>`);
  set('hero-meta', meta.join('<span class="ll-sep">·</span>'));

  const cta = document.getElementById('contact-email');
  if(cta && p.email){
    cta.href = `mailto:${p.email}`;
    const t = cta.querySelector('.ll-contact-email-text');
    if(t) t.textContent = p.email;
  }
}

function mountBackdrop(){
  const el = document.getElementById('backdrop'); if(!el) return;
  el.className = 'll-backdrop';
  el.innerHTML = `<div class="ll-aurora a1"></div><div class="ll-aurora a2"></div><div class="ll-aurora a3"></div><div class="ll-dotgrid"></div><div class="ll-vignette"></div>`;
}

// Page chrome: skip-to-content link, scroll-progress bar, back-to-top button.
function mountChrome(){
  document.body.insertAdjacentHTML('afterbegin', '<a class="ll-skip" href="#main">Skip to content</a>');
  document.body.insertAdjacentHTML('beforeend', '<div class="ll-progress"></div><button class="ll-top" type="button" aria-label="Back to top"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg></button>');
  const bar = document.querySelector('.ll-progress'), top = document.querySelector('.ll-top');
  top.addEventListener('click', ()=>window.scrollTo({ top:0, behavior:'smooth' }));
  const onScroll = ()=>{
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`;   // transform, not width: no layout per scroll frame
    top.classList.toggle('show', h.scrollTop > 600);
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
}

// ─── Reveal / Active-section / Markdown ──────────────────────────────────────

function revealObserve(){
  const els = document.querySelectorAll('[data-reveal]');
  if (matchMedia('(prefers-reduced-motion:reduce)').matches){
    els.forEach(e=>e.classList.add('is-shown')); return;
  }
  const io = new IntersectionObserver((ents)=>ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('is-shown'); io.unobserve(e.target);}}),{threshold:.12, rootMargin:'0px 0px -8% 0px'});
  els.forEach(e=>io.observe(e));
}

// `map` pairs each tracked section id to the nav key it should activate
// (section ids like `pubs` differ from nav keys like `publications`; use null for none).
function trackActiveSection(map){
  const links = document.querySelectorAll('.ll-nav-link');
  const els = Object.keys(map).map(id=>document.getElementById(id)).filter(Boolean);
  const io = new IntersectionObserver((ents)=>{
    const vis = ents.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);
    if(vis[0]){ const nav=map[vis[0].target.id]; links.forEach(l=>l.classList.toggle('is-active', l.dataset.nav===nav)); }
  },{rootMargin:'-45% 0px -50% 0px', threshold:[0,.25,.5,1]});
  els.forEach(e=>io.observe(e));
}

function parseMarkdownLinks(text){
  return esc(text)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a class="ll-link" target="_blank" rel="noopener" href="$2">$1</a>')
    .replace(/\n/g,'<br>');
}

// ─── News category ───────────────────────────────────────────────────────────
// Returns { icon: <inline SVG string>, label: string }. An explicit `category` wins;
// otherwise the first keyword rule that matches the text decides; default is Update.

const NEWS_ICONS = {
  Publication: '<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h11"/>',
  Talk: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  Award: '<path d="M8 21h8M12 17v4"/><path d="M17 3H7v7a5 5 0 0 0 10 0V3z"/><path d="M7 6H4a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4h1"/><path d="M17 6h3a1 1 0 0 1 1 1v1a4 4 0 0 0-4 4h-1"/>',
  Project: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  Travel: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 21 4s-2 0-3.5 1.5L14 9 5.8 7.2a.5.5 0 0 0-.5.5l-.1.5L9 12l-2 3H3l-1 1 3 2 2 3 1-1v-4l3-2 3.5 3.8.5-.1a.5.5 0 0 0 .3-.5z"/>',
  Update: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
};

const NEWS_RULES = [
  ['Publication', /accept|publish|paper/],
  ['Talk',        /talk|present|conference|keynote/],
  ['Award',       /award|honor|grant|prize/],
  ['Project',     /release|launch|code/],
  ['Travel',      /visit|travel/],
];

function newsCategory(item){
  const cat = String(item.category || '').toLowerCase();
  let label = Object.keys(NEWS_ICONS).find(k => k.toLowerCase() === cat);
  if(!label){
    const text = (item.content || '').toLowerCase();
    label = (NEWS_RULES.find(([, re]) => re.test(text)) || ['Update'])[0];
  }
  return { label, icon: strokeIcon(NEWS_ICONS[label], 14) };
}

// ─── News rows ────────────────────────────────────────────────────────────────

function newsRowsHTML(news, limit){
  // YAML parses unquoted `2026-04-07` as a Date object; normalize to a YYYY-MM-DD string
  // so dates render correctly whether written quoted (string) or unquoted (Date).
  // Returns '' for a missing/invalid date so one bad item can't crash the whole list.
  const ymd = v => {
    if (typeof v === 'string') return v.slice(0,10);
    const d = new Date(v);
    return isNaN(d) ? '' : d.toISOString().slice(0,10);
  };
  // Sort newest-first; undated items (key '') sort last.
  const list = [...news].sort((a,b)=>ymd(b.date).localeCompare(ymd(a.date)));
  const shown = limit ? list.slice(0,limit) : list;
  return `<div class="ll-news-card">${shown.map((n)=>{
    const c = newsCategory(n);
    const key = ymd(n.date);
    const dateLabel = key ? new Date(key + 'T00:00:00').toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}) : '';
    return `<div class="ll-news-row">
      <div class="ll-news-ic">${c.icon}</div>
      <div class="ll-news-date">${dateLabel}</div>
      <div class="ll-news-body">${parseMarkdownLinks(n.content)}</div></div>`;
  }).join('')}</div>`;
}

// ─── Publications ─────────────────────────────────────────────────────────────

// `doi` may be bare or a full https://doi.org/ URL.
const bareDoi = p => String(p.doi).replace(/^https?:\/\/doi\.org\//,'');

// "La Cava, Lucio and Tagarelli, Andrea" (BibTeX order) → "Lucio La Cava, Andrea Tagarelli".
function formatAuthors(s){
  return String(s||'').split(/\s+and\s+/).map(a => a.trim().replace(/^([^,]+),\s*(.+)$/, '$2 $1')).join(', ');
}

// Entry type is guessed from the venue (override with `bibtype` in YAML):
// arXiv → @misc, proceedings / findings / workshops → @inproceedings, else → @article.
function buildBibtex(p){
  const venue = p.venue || 'Preprint';
  const type = p.bibtype || (/arxiv/i.test(venue) ? 'misc'
    : /proceedings|conference|findings|workshop|symposium|ijcai/i.test(venue) ? 'inproceedings' : 'article');
  const field = { misc:'howpublished', inproceedings:'booktitle' }[type] || 'journal';
  const doi = p.doi ? `,\n  doi={${bareDoi(p)}}` : '';
  return `@${type}{${p.key},\n  title={${p.title}},\n  author={${p.authors||''}},\n  ${field}={${venue}},\n  year={${p.year||''}}${doi}\n}`;
}

function pubCardHTML(p){
  const toggle = (act, label) => `<button type="button" class="ll-link" data-pub-act="${act}" aria-expanded="false">${label}</button>`;
  const ext = (href, label) => `<a class="ll-link" target="_blank" rel="noopener" href="${esc(href)}">${label}</a>`;
  const links = [
    p.abstract && toggle('abstract', 'Abstract'),
    p.pdf && ext(p.pdf, 'PDF'),
    p.arxiv && ext(p.arxiv, 'arXiv'),
    p.doi && ext(`https://doi.org/${bareDoi(p)}`, 'DOI'),
    p.code && ext(p.code, 'Code'),
    toggle('bibtex', 'BibTeX'),
  ].filter(Boolean).join('');
  // Escape first, then bold the author name (the matched name has no HTML metacharacters).
  const authors = esc(formatAuthors(p.authors)).replace(/Lucio La Cava/g, '<strong>$&</strong>');
  return `<div class="ll-pub">
    <div class="ll-pub-rail"></div>
    <div class="ll-pub-top"><h3 class="ll-pub-title">${esc(p.title)}</h3>${p.tag?`<div class="ll-pub-tag">${esc(p.tag)}</div>`:''}</div>
    <div class="ll-pub-authors">${authors}</div>
    <div class="ll-pub-meta"><span class="ll-pub-venue">${esc(p.venue||'')}</span><span class="ll-pub-links">${links}</span></div>
    ${p.abstract?`<div class="ll-pub-abstract"><div class="ll-pub-abstract-inner"><p>${esc(p.abstract)}</p></div></div>`:''}
    <div class="ll-bibtex"><button type="button" class="ll-bibtex-copy" data-pub-act="copy">Copy</button><pre>${esc(buildBibtex(p))}</pre></div>
  </div>`;
}

function pubGroupsHTML(pubs, opts={}){
  let list = [...pubs];
  if(opts.selectedOnly) list = list.filter(p=>p.selected);
  const byYear = Object.groupBy(list, p=>p.year);
  const years = Object.keys(byYear).sort((a,b)=>Number(b)-Number(a));
  return years.map(y=>`<div class="ll-pub-group" data-reveal>
    <div class="ll-pub-year-col"><h2 class="ll-pub-year">${y}</h2>${opts.hideCount?'':`<div class="ll-pub-count">${byYear[y].length} paper${byYear[y].length===1?'':'s'}</div>`}</div>
    <div class="ll-pub-list">${byYear[y].map(pubCardHTML).join('')}</div></div>`).join('');
}

// Publication card buttons: Abstract / BibTeX toggle a `show-*` class on the card; Copy copies
// the BibTeX. One delegated listener, so it keeps working across filter re-renders.
function setupPubActions(){
  document.addEventListener('click', ev=>{
    const btn = ev.target.closest('[data-pub-act]'); if(!btn) return;
    const card = btn.closest('.ll-pub'), act = btn.dataset.pubAct;
    if(act === 'copy'){
      const text = card.querySelector('.ll-bibtex pre').textContent;
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject())
        .then(()=>showToast('BibTeX copied to clipboard'), ()=>showToast('Copy failed — select the text instead'));
      return;
    }
    btn.setAttribute('aria-expanded', card.classList.toggle('show-' + act));
  });
}

// Lightweight toast notification (auto-created, auto-dismissed).
function showToast(msg){
  let t = document.getElementById('ll-toast');
  if(!t){ t = document.createElement('div'); t.id = 'll-toast'; t.className = 'll-toast'; t.setAttribute('role','status'); document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>t.classList.remove('show'), 1900);
}

// ─── Hero actions / Research cards / Projects / Teaching / Social chips ──────

// Actions only — page navigation already lives in the header.
function heroIconStripHTML(profile){
  const items = [
    {label:'CV', href:profile.cv, icon:'cv', accent:true},
    {label:'Scholar', href:profile.scholar, icon:'scholar', external:true},
    {label:'Email', href:`mailto:${profile.email}`, icon:'email'},
  ];
  return items.map(it=>`<a class="ll-icon-link" href="${esc(it.href)}" ${it.accent?'data-accent="true"':''} ${it.external?'target="_blank" rel="noopener"':''}>${iconSVG(it.icon)}<span>${it.label}</span></a>`).join('');
}

function researchCardsHTML(research){
  return research.map((r,i)=>`<div data-reveal class="ll-research" style="transition-delay:${i*90}ms">
    <div class="ll-research-top"><div class="ll-research-ic">${iconSVG(r.icon)}</div><div class="ll-research-num">/${String(i+1).padStart(2,'0')}</div></div>
    <div class="ll-research-title">${esc(r.title)}</div><div class="ll-research-desc">${esc(r.description)}</div></div>`).join('');
}

function projectsHTML(projects){
  return projects.map((p,i)=>`<div class="ll-research ll-project">
    ${p.image?`<div class="ll-project-img"><img src="${esc(p.image)}" alt="${esc(p.title)}" loading="${i<2?'eager':'lazy'}" decoding="async"></div>`:''}
    <div class="ll-project-body"><div class="ll-pub-top"><div class="ll-research-title">${esc(p.title)}</div>
    <div class="ll-project-links">${p.github?`<a class="ll-link" target="_blank" rel="noopener" href="${esc(p.github)}">GitHub ↗</a>`:''}${p.demo?`<a class="ll-link" target="_blank" rel="noopener" href="${esc(p.demo)}">Demo ↗</a>`:''}</div></div>
    <div class="ll-research-desc">${esc(p.description)}</div></div></div>`).join('');
}

function teachingHTML(teaching){
  const byYear = Object.groupBy(teaching, t=>t.academicYear);
  const years=Object.keys(byYear).sort().reverse();
  return years.map(y=>`<div class="ll-teach-group" data-reveal><h2 class="ll-teach-year">Academic Year ${esc(y)}</h2>
    <div class="ll-teach-list">${byYear[y].map(t=>{const role=t.category==='Teaching'?'T':'TA';
      const title = t.link ? `<a class="ll-link" target="_blank" rel="noopener" href="${esc(t.link)}">${esc(t.title)}</a>` : esc(t.title);
      return `<div class="ll-teach-row"><span class="ll-teach-role" data-role="${role}">${role}</span>
      <div><div class="ll-teach-title">${title} <span class="ll-teach-lvl">${esc(t.level)}</span></div>
      <div class="ll-research-desc">${esc(t.degree)}${t.department?` @${esc(t.department)}, `:' '}${esc(t.institution)}</div></div></div>`;}).join('')}</div></div>`).join('');
}

function talksHTML(talks){
  const order = ['Talk','Tutorial','Course','Service'];
  const labels = { Talk:'Invited Talks', Tutorial:'Tutorials', Course:'Courses', Service:'Academic Service' };
  const byType = Object.groupBy(talks, t=>t.type);
  const types = Object.keys(byType).sort((a,b)=>{
    const i=order.indexOf(a), j=order.indexOf(b);
    return (i<0?99:i)-(j<0?99:j);
  });
  return types.map(ty=>`<div class="ll-teach-group" data-reveal>
    <h2 class="ll-teach-year">${esc(labels[ty]||ty)}</h2>
    <div class="ll-teach-list">${byType[ty]
      .slice().sort((a,b)=>String(b.year).localeCompare(String(a.year)))
      .map(t=>{
        const title = t.link ? `<a class="ll-link" target="_blank" rel="noopener" href="${esc(t.link)}">${esc(t.title)}</a>` : esc(t.title);
        const sub = [t.venue, t.location].filter(Boolean).join(' · ');
        return `<div class="ll-teach-row"><span class="ll-teach-role">${esc(t.year)}</span>
        <div><div class="ll-teach-title">${title}</div>
        ${sub?`<div class="ll-research-desc">${esc(sub)}</div>`:''}</div></div>`;
      }).join('')}</div></div>`).join('');
}

function socialChipsHTML(links){
  return links.map(s=>`<a class="ll-chip" target="_blank" rel="${s.rel?esc(s.rel)+' ':''}noopener" href="${esc(s.href)}">${esc(s.label)}<span>↗</span></a>`).join('');
}
