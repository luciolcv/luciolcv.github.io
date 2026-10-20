// Only the YAML each page actually needs (profile is always required for header/footer).
const PAGE_FILES = {
  home:         ['profile','news','publications'],
  news:         ['profile','news'],
  publications: ['profile','publications'],
  projects:     ['profile','projects'],
  teaching:     ['profile','teaching'],
  talks:        ['profile','talks'],
  notfound:     ['profile'],
};

// Load the named YAML files (e.g. ['profile','news']) into { profile: …, news: … }.
// Requires global `jsyaml` (js/vendor/js-yaml.min.js).
async function loadContent(names){
  return Object.fromEntries(await Promise.all(names.map(async name => {
    const res = await fetch(`content/${name}.yaml`);   // matches the <link rel="preload"> in each page
    if(!res.ok) throw new Error(`${name}.yaml → HTTP ${res.status}`);
    return [name, jsyaml.load(await res.text())];
  })));
}

function showLoadError(err){
  const ids = ['news-container','publications-container','projects-container','teaching-container','talks-container','research-cards','social-chips','streaming-bio'];
  const msg = `<div class="ll-error">Could not load content (${esc(err.message)}). If viewing locally, serve over HTTP: <code>python3 -m http.server</code></div>`;
  // Deployed pages already carry the prerendered content: keep it (and show it) instead.
  ids.forEach(id => { const el = document.getElementById(id); if(el && !el.firstElementChild) el.innerHTML = msg; });
  document.querySelectorAll('[data-reveal]').forEach(e=>e.classList.add('is-shown'));
  console.error('[loadContent]', err);
}

// Page bootstrap: loads only the needed content, then renders the current page.
async function bootPage(){
  const page = document.body.dataset.page;
  let data;
  try { data = await loadContent(PAGE_FILES[page]); }
  catch(err){ showLoadError(err); return; }
  mountBackdrop(); mountHeader(data.profile); mountFooter(data.profile); setupThemeToggle(); setupMobileNav(); mountChrome(); setupPubActions();
  if(page==='home') renderHome(data);
  else if(page==='news') renderNews(data);
  else if(page==='publications') setupPubFilters(data.publications);
  else if(page==='projects') document.getElementById('projects-container').innerHTML = projectsHTML(data.projects);
  else if(page==='teaching') document.getElementById('teaching-container').innerHTML = teachingHTML(data.teaching);
  else if(page==='talks') document.getElementById('talks-container').innerHTML = talksHTML(data.talks);
  revealObserve();
}

function renderHome(d){
  mountHero(d.profile);
  document.getElementById('hero-icons').innerHTML = heroIconStripHTML(d.profile);
  startStreamingBio(document.getElementById('streaming-bio'), d.profile.bio);
  document.getElementById('research-cards').innerHTML = researchCardsHTML(d.profile.research);
  document.getElementById('news-container').innerHTML = newsRowsHTML(d.news, 5);
  document.getElementById('publications-container').innerHTML = pubGroupsHTML(d.publications,{selectedOnly:true,hideCount:true});
  document.getElementById('social-chips').innerHTML = socialChipsHTML(d.profile.links);
  trackActiveSection({ hero:null, research:'research', news:'news', pubs:'publications', contact:'contact' });
}

// Publications page: live search (title/authors/venue) + year filter + topic chips.
// Filter state is mirrored in the URL (?q=…&year=…&tag=…) so a filtered view can be shared.
function setupPubFilters(allPubs){
  const search = document.getElementById('pub-search');
  const yearSel = document.getElementById('pub-year-filter');
  const topics = document.getElementById('pub-topics');
  const total = document.getElementById('pub-total');
  const c = document.getElementById('publications-container');

  const years = [...new Set(allPubs.map(p=>String(p.year)))].sort((a,b)=>b-a);
  years.forEach(y=>yearSel.add(new Option(y, y)));
  const tags = [...new Set(allPubs.map(p=>p.tag).filter(Boolean))].sort();

  const params = new URLSearchParams(location.search);
  search.value = params.get('q') || '';
  if(years.includes(params.get('year'))) yearSel.value = params.get('year');
  let activeTag = tags.includes(params.get('tag')) ? params.get('tag') : 'all';

  topics.innerHTML = ['all', ...tags].map(t=>
    `<button type="button" class="ll-filter-chip" data-tag="${esc(t)}" aria-pressed="${t===activeTag}">${t==='all'?'All topics':esc(t)}</button>`
  ).join('');

  // `initial` renders with the scroll-reveal fade; later re-renders (typing, clicking) appear instantly.
  const apply = (initial)=>{
    const q = search.value.trim().toLowerCase(), y = yearSel.value;
    const filtered = allPubs.filter(p=>
      (!q || [p.title, formatAuthors(p.authors), p.venue].some(f=>String(f||'').toLowerCase().includes(q))) &&
      (y==='all' || String(p.year)===y) &&
      (activeTag==='all' || p.tag===activeTag));
    c.innerHTML = pubGroupsHTML(filtered,{}) || '<p class="ll-empty">No publications match.</p>';
    if(!initial) c.querySelectorAll('[data-reveal]').forEach(e=>e.classList.add('is-shown'));
    total.textContent = `${filtered.length} of ${allPubs.length} publications`;
    const qs = new URLSearchParams(Object.entries({ q: search.value.trim(), year: y, tag: activeTag }).filter(([,v])=>v && v!=='all'));
    history.replaceState(null, '', location.pathname + (String(qs) ? '?' + qs : '') + location.hash);
  };

  topics.addEventListener('click', ev=>{
    const btn = ev.target.closest('.ll-filter-chip'); if(!btn) return;
    activeTag = btn.dataset.tag;
    topics.querySelectorAll('.ll-filter-chip').forEach(b=>b.setAttribute('aria-pressed', b===btn));
    apply();
  });
  search.addEventListener('input', ()=>apply());
  yearSel.addEventListener('change', ()=>apply());
  apply(true);
}

// News page: all items + category filter chips.
function renderNews(d){
  const allNews = d.news, chips = document.getElementById('news-topics');
  document.getElementById('news-container').innerHTML = newsRowsHTML(allNews);
  const cats = [...new Set(allNews.map(n=>newsCategory(n).label))].sort();
  chips.innerHTML = ['all', ...cats].map(c=>
    `<button type="button" class="ll-filter-chip" data-cat="${c}" aria-pressed="${c==='all'}">${c==='all'?'All':c}</button>`
  ).join('');
  chips.addEventListener('click', ev=>{
    const btn = ev.target.closest('.ll-filter-chip'); if(!btn) return;
    const cat = btn.dataset.cat;
    chips.querySelectorAll('.ll-filter-chip').forEach(b=>b.setAttribute('aria-pressed', b===btn));
    document.getElementById('news-container').innerHTML = newsRowsHTML(cat==='all' ? allNews : allNews.filter(n=>newsCategory(n).label===cat));
  });
}

// Mobile navigation: hamburger toggles the collapsible panel.
function setupMobileNav(){
  const btn = document.getElementById('ll-hamburger');
  const panel = document.getElementById('ll-mobile-nav');
  if(!btn || !panel) return;
  const close = ()=>{ panel.classList.remove('open'); btn.setAttribute('aria-expanded','false'); btn.setAttribute('aria-label','Open menu'); btn.innerHTML = iconSVG('menu'); };
  const open = ()=>{ panel.classList.add('open'); btn.setAttribute('aria-expanded','true'); btn.setAttribute('aria-label','Close menu'); btn.innerHTML = iconSVG('close'); };
  btn.addEventListener('click', e=>{ e.stopPropagation(); panel.classList.contains('open') ? close() : open(); });
  panel.addEventListener('click', e=>{ if(e.target.closest('a')) close(); });
  document.addEventListener('click', e=>{ if(panel.classList.contains('open') && !panel.contains(e.target) && !btn.contains(e.target)) close(); });
  document.addEventListener('keydown', e=>{ if(e.key === 'Escape') close(); });
}

document.addEventListener('DOMContentLoaded', bootPage);
