// Shared render components and utilities.
// Loaded as a plain <script> after js/data.js.
// All functions are top-level declarations — no module exports.

// ─── Icons ───────────────────────────────────────────────────────────────────

// Build an inline stroked icon SVG (24-unit grid, currentColor, round caps), `size` px square.
function strokeIcon(body, size = 15){
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

function iconSVG(name){
  const map = {
    about:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    research:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    news:'<path d="M4 5h13a3 3 0 0 1 3 3v9a2 2 0 0 1-2 2H4z"/><path d="M4 19a2 2 0 0 1-2-2v-7h2"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    pubs:'<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h11"/>',
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

// Group an array into { key: [items…] }, preserving each group's insertion order.
function groupBy(arr, keyFn){
  const out = {};
  arr.forEach(x => { const k = keyFn(x); (out[k] = out[k] || []).push(x); });
  return out;
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
      <a href="index.html" class="ll-logo ll-link"><span class="ll-logo-mark">👨🏻‍💻</span><span>${profile.name}</span></a>
      <nav class="ll-nav">${nav.map(n=>link('ll-nav-link', n)).join('')}</nav>
      <div class="ll-header-right">
        <button id="ll-hamburger" class="ll-hamburger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="ll-mobile-nav">${iconSVG('menu')}</button>
        <button id="ll-theme-toggle" class="ll-theme-toggle" type="button" aria-label="Toggle colour theme"></button>
        <a class="ll-cta-primary ll-header-cta" href="mailto:${profile.email}">Get in touch <span>→</span></a>
      </div>
    </div>
    <nav id="ll-mobile-nav" class="ll-mobile-nav" aria-label="Mobile">
      ${nav.map(n=>link('ll-mobile-link', n)).join('')}
      <a class="ll-mobile-link ll-mobile-cta" href="mailto:${profile.email}">Get in touch →</a>
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
  const updated = new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'});
  document.getElementById('site-footer').innerHTML = `
    <div class="ll-footer-inner">
      <div class="ll-foot-mono">© ${new Date().getFullYear()} ${profile.name} · DIMES, University of Calabria</div>
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
  if(p.title) meta.push(`<span style="color:var(--fg-dim)">${esc(p.title)}</span>`);
  meta.push(`<span>${esc(p.affiliation||'')}${p.flag?' '+esc(p.flag):''}</span>`);
  if(p.orcid) meta.push(`<span>ORCID <a class="ll-link" style="color:var(--fg-dim)" target="_blank" rel="noopener" href="https://orcid.org/${esc(p.orcid)}">${esc(p.orcid)}</a></span>`);
  set('hero-meta', meta.join('<span style="color:var(--border-strong)">·</span>'));

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
  if(!document.querySelector('.ll-skip')){
    const skip = document.createElement('a');
    skip.className = 'll-skip'; skip.href = '#main'; skip.textContent = 'Skip to content';
    document.body.insertBefore(skip, document.body.firstChild);
  }
  let bar = document.getElementById('ll-progress');
  if(!bar){ bar = document.createElement('div'); bar.id = 'll-progress'; bar.className = 'll-progress'; document.body.appendChild(bar); }
  let top = document.getElementById('ll-top');
  if(!top){
    top = document.createElement('button');
    top.id = 'll-top'; top.className = 'll-top'; top.type = 'button';
    top.setAttribute('aria-label', 'Back to top');
    top.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>';
    top.addEventListener('click', ()=>window.scrollTo({ top:0, behavior:'smooth' }));
    document.body.appendChild(top);
  }
  const onScroll = ()=>{
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    top.classList.toggle('show', h.scrollTop > 600);
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
}

// ─── Reveal / Active-section / Markdown / Section header ─────────────────────

function revealObserve(){
  const els = document.querySelectorAll('[data-reveal]');
  if (typeof IntersectionObserver === 'undefined' || matchMedia('(prefers-reduced-motion:reduce)').matches){
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
  if(!els.length || typeof IntersectionObserver==='undefined') return;
  const io = new IntersectionObserver((ents)=>{
    const vis = ents.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);
    if(vis[0]){ const nav=map[vis[0].target.id]; links.forEach(l=>l.classList.toggle('is-active', l.dataset.nav===nav)); }
  },{rootMargin:'-45% 0px -50% 0px', threshold:[0,.25,.5,1]});
  els.forEach(e=>io.observe(e));
}

function parseMarkdownLinks(text){
  if(!text) return '';
  return String(text)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a class="ll-link" style="color:var(--iris)" target="_blank" rel="noopener" href="$2">$1</a>')
    .replace(/\n/g,'<br>');
}

function sectionHeaderHTML({num,eyebrow,title,accent,right}){
  return `<div class="ll-section-head">
    <div class="ll-section-head-l">
      <div class="ll-section-num">${num}</div>
      <div><div class="ll-section-eyebrow">${eyebrow}</div>
      <div class="ll-section-title">${title}${accent?`<span class="ll-accent">${accent}</span>`:''}</div></div>
    </div>${right||''}</div>`;
}

// ─── News category (ported from js/main.js getNewsCategory) ──────────────────
// Returns { icon: <inline SVG string>, label: string }
// icon uses stroke-width:1.7, 14px, currentColor — color is uniform via .ll-news-ic CSS.

function newsCategory(item){
  // Inline SVG builders for each category (14px, stroke-width:1.7, currentColor)
  const svg = (body) => strokeIcon(body, 14);

  const icons = {
    // Publication — document / scroll
    publication: svg('<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h11"/>'),
    // Talk — speech bubble
    talk: svg('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
    // Award — trophy
    award: svg('<path d="M8 21h8M12 17v4"/><path d="M17 3H7v7a5 5 0 0 0 10 0V3z"/><path d="M7 6H4a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4h1"/><path d="M17 6h3a1 1 0 0 1 1 1v1a4 4 0 0 0-4 4h-1"/>'),
    // Project — rocket
    project: svg('<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>'),
    // Travel — airplane
    travel: svg('<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 21 4s-2 0-3.5 1.5L14 9 5.8 7.2a.5.5 0 0 0-.5.5l-.1.5L9 12l-2 3H3l-1 1 3 2 2 3 1-1v-4l3-2 3.5 3.8.5-.1a.5.5 0 0 0 .3-.5z"/>'),
    // Update — star
    update: svg('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
  };

  // Manual override via item.category
  if(item.category){
    const cat = item.category.toLowerCase();
    if(cat === 'publication') return { icon: icons.publication, label: 'Publication' };
    if(cat === 'talk')        return { icon: icons.talk,        label: 'Talk' };
    if(cat === 'award')       return { icon: icons.award,       label: 'Award' };
    if(cat === 'project')     return { icon: icons.project,     label: 'Project' };
    if(cat === 'travel')      return { icon: icons.travel,      label: 'Travel' };
    if(cat === 'update')      return { icon: icons.update,      label: 'Update' };
  }

  // Auto-detect from content text (mirrors main.js heuristics)
  const lower = (item.content || '').toLowerCase();
  if(lower.includes('accept') || lower.includes('publish') || lower.includes('paper'))
    return { icon: icons.publication, label: 'Publication' };
  if(lower.includes('talk') || lower.includes('present') || lower.includes('conference') || lower.includes('keynote'))
    return { icon: icons.talk, label: 'Talk' };
  if(lower.includes('award') || lower.includes('honor') || lower.includes('grant') || lower.includes('prize'))
    return { icon: icons.award, label: 'Award' };
  if(lower.includes('release') || lower.includes('launch') || lower.includes('code'))
    return { icon: icons.project, label: 'Project' };
  if(lower.includes('visit') || lower.includes('travel'))
    return { icon: icons.travel, label: 'Travel' };
  return { icon: icons.update, label: 'Update' };
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

// Resolve a publication's citation key. Falls back to a title-derived slug so that
// items missing `key` still get a unique, stable data-key (no toggle/copy collisions).
function pubKey(p){
  if(p.key) return p.key;
  const slug = String(p.title||'untitled').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,48);
  return 'pub-' + (slug || 'untitled');
}

function buildBibtex(p){
  return `@article{${pubKey(p)},\n  title={${p.title}},\n  author={${p.authors||''}},\n  journal={${p.venue||'Preprint'}},\n  year={${p.year||''}}\n}`;
}

function pubCardHTML(p){
  const key = esc(pubKey(p));
  const links = [
    p.pdf&&`<a class="ll-link" target="_blank" rel="noopener" href="${esc(p.pdf)}">PDF</a>`,
    p.arxiv&&`<a class="ll-link" target="_blank" rel="noopener" href="${esc(p.arxiv)}">arXiv</a>`,
    p.doi&&`<a class="ll-link" target="_blank" rel="noopener" href="https://doi.org/${esc(String(p.doi).replace(/^https?:\/\/doi\.org\//,''))}">DOI</a>`,
    p.code&&`<a class="ll-link" target="_blank" rel="noopener" href="${esc(p.code)}">Code</a>`,
    `<a class="ll-link ll-bibtex-toggle" href="#" data-key="${key}">BibTeX</a>`,
  ].filter(Boolean).join('');
  // Escape first, then bold the author name (the matched name has no HTML metacharacters).
  const authors = esc(p.authors||'').replace(/La Cava, Lucio|Lucio La Cava/g, m=>`<strong>${m}</strong>`);
  return `<div class="ll-pub">
    <div class="ll-pub-rail"></div>
    <div class="ll-pub-top"><div class="ll-pub-title">${esc(p.title)}</div>${p.tag?`<div class="ll-pub-tag">${esc(p.tag)}</div>`:''}</div>
    ${p.abstract?`<div class="ll-pub-abstract"><div class="ll-pub-abstract-inner"><p>${esc(p.abstract)}</p></div></div>`:''}
    <div class="ll-pub-meta"><span>${authors}</span><span class="ll-sep">·</span><span class="ll-pub-venue">${esc(p.venue||'')}</span><span class="ll-pub-links">${links}</span></div>
    <pre class="ll-bibtex" data-key="${key}" hidden>${esc(buildBibtex(p))}</pre>
  </div>`;
}

function pubGroupsHTML(pubs, opts={}){
  let list = [...pubs];
  if(opts.selectedOnly) list = list.filter(p=>p.selected);
  const byYear = groupBy(list, p=>p.year);
  const years = Object.keys(byYear).sort((a,b)=>Number(b)-Number(a));
  return years.map(y=>`<div class="ll-pub-group" data-reveal>
    <div class="ll-pub-year-col"><div class="ll-pub-year">${y}</div>${opts.hideCount?'':`<div class="ll-pub-count">${byYear[y].length} paper${byYear[y].length===1?'':'s'}</div>`}</div>
    <div class="ll-pub-list">${byYear[y].map(pubCardHTML).join('')}</div></div>`).join('');
}

function attachBibtexToggles(){
  // `:not([data-bound])` so re-renders (e.g. publication filtering) never double-bind.
  document.querySelectorAll('.ll-bibtex-toggle:not([data-bound])').forEach(a=>{
    a.dataset.bound = '1';
    a.addEventListener('click',ev=>{
      ev.preventDefault();
      const pre = document.querySelector(`.ll-bibtex[data-key="${a.dataset.key}"]`);
      if(pre){
        pre.hidden = !pre.hidden;
        if(!pre.hidden && navigator.clipboard){
          navigator.clipboard.writeText(pre.textContent).then(()=>showToast('BibTeX copied to clipboard')).catch(()=>{});
        }
      }
    });
  });
}

// Lightweight toast notification (auto-created, auto-dismissed).
function showToast(msg){
  let t = document.getElementById('ll-toast');
  if(!t){ t = document.createElement('div'); t.id = 'll-toast'; t.className = 'll-toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>t.classList.remove('show'), 1900);
}

// ─── Hero icon strip / Research cards / Projects / Teaching / Social chips ───

function heroIconStripHTML(profile){
  const items = [
    {label:'About', href:'index.html#hero', icon:'about'},
    {label:'Research', href:'index.html#research', icon:'research'},
    {label:'News', href:'news.html', icon:'news'},
    {label:'Publications', href:'publications.html', icon:'pubs'},
    {label:'CV', href:profile.cv, icon:'cv', accent:true},
    {label:'Scholar', href:profile.scholar, icon:'scholar', external:true},
    {label:'Email', href:`mailto:${profile.email}`, icon:'email'},
  ];
  return items.map(it=>`<a class="ll-icon-link" href="${it.href}" ${it.accent?'data-accent="true"':''} ${it.external?'target="_blank" rel="noopener"':''}>${iconSVG(it.icon)}<span>${it.label}</span></a>`).join('');
}

function researchCardsHTML(research){
  return research.map((r,i)=>`<div data-reveal class="ll-research" style="transition-delay:${i*90}ms">
    <div class="ll-research-top"><div class="ll-research-ic">${iconSVG(r.icon)}</div><div class="ll-research-num">/${String(i+1).padStart(2,'0')}</div></div>
    <div class="ll-research-title">${r.title}</div><div class="ll-research-desc">${r.description}</div></div>`).join('');
}

function projectsHTML(projects){
  return projects.map(p=>`<div class="ll-research ll-project">
    ${p.image?`<div class="ll-project-img"><img src="${p.image}" alt="${p.title}" loading="lazy" decoding="async"></div>`:''}
    <div class="ll-project-body"><div class="ll-pub-top"><div class="ll-research-title">${p.title}</div>
    <div class="ll-project-links">${p.github?`<a class="ll-link" target="_blank" rel="noopener" href="${p.github}">GitHub ↗</a>`:''}${p.demo?`<a class="ll-link" target="_blank" rel="noopener" href="${p.demo}">Demo ↗</a>`:''}</div></div>
    <div class="ll-research-desc">${p.description||''}</div></div></div>`).join('');
}

function teachingHTML(teaching){
  const byYear = groupBy(teaching, t=>t.academicYear);
  const years=Object.keys(byYear).sort().reverse();
  return years.map(y=>`<div class="ll-teach-group" data-reveal><div class="ll-teach-year">Academic Year ${y}</div>
    <div class="ll-teach-list">${byYear[y].map(t=>{const role=t.category==='Teaching'?'T':'TA';
      const title = t.link ? `<a class="ll-link" target="_blank" rel="noopener" href="${t.link}">${t.title}</a>` : t.title;
      return `<div class="ll-teach-row"><span class="ll-teach-role" data-role="${role}">${role}</span>
      <div><div class="ll-teach-title">${title} <span class="ll-teach-lvl">${t.level||''}</span></div>
      <div class="ll-research-desc">${t.degree}${t.department?` @${t.department}, `:' '}${t.institution}</div></div></div>`;}).join('')}</div></div>`).join('');
}

function talksHTML(talks){
  const order = ['Talk','Tutorial','Course','Service'];
  const labels = { Talk:'Invited Talks', Tutorial:'Tutorials', Course:'Courses', Service:'Academic Service' };
  const byType = groupBy(talks, t=>t.type);
  const types = Object.keys(byType).sort((a,b)=>{
    const i=order.indexOf(a), j=order.indexOf(b);
    return (i<0?99:i)-(j<0?99:j);
  });
  return types.map(ty=>`<div class="ll-teach-group" data-reveal>
    <div class="ll-teach-year">${labels[ty]||ty}</div>
    <div class="ll-teach-list">${byType[ty]
      .slice().sort((a,b)=>String(b.year).localeCompare(String(a.year)))
      .map(t=>{
        const title = t.link ? `<a class="ll-link" target="_blank" rel="noopener" href="${t.link}">${t.title}</a>` : t.title;
        const sub = [t.venue, t.location].filter(Boolean).join(' · ');
        return `<div class="ll-teach-row"><span class="ll-teach-role">${t.year||''}</span>
        <div><div class="ll-teach-title">${title}</div>
        ${sub?`<div class="ll-research-desc">${sub}</div>`:''}</div></div>`;
      }).join('')}</div></div>`).join('');
}

function socialChipsHTML(links){
  return links.map(s=>`<a class="ll-chip" target="_blank" ${s.rel?`rel="${s.rel} noopener"`:'rel="noopener"'} href="${s.href}">${s.label}<span>↗</span></a>`).join('');
}
