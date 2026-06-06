// Only the YAML each page actually needs (profile is always required for header/footer).
const PAGE_FILES = {
  home:         ['profile','news','publications'],
  news:         ['profile','news'],
  publications: ['profile','publications'],
  projects:     ['profile','projects'],
  teaching:     ['profile','teaching'],
  talks:        ['profile','talks'],
};

// Page bootstrap: loads only the needed content, then renders the current page.
let _booted = false;
async function bootPage(){
  if(_booted) return;            // run-once guard (avoids double-init / duplicated filter options)
  _booted = true;
  const page = document.body.dataset.page;
  let data;
  try { data = await loadContent(PAGE_FILES[page]); } catch { return; }
  mountBackdrop(); mountHeader(data.profile); mountFooter(data.profile); setupThemeToggle(); setupMobileNav(); mountChrome();
  if(page==='home') renderHome(data);
  else if(page==='news') renderNews(data);
  else if(page==='publications') renderPublications(data);
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
  attachBibtexToggles();
  trackActiveSection({ hero:null, research:'research', news:'news', pubs:'publications', contact:'contact' });
}

function renderPublications(d){
  const c = document.getElementById('publications-container');
  c.innerHTML = pubGroupsHTML(d.publications,{});
  attachBibtexToggles();
  setupPubFilters(d.publications);
}

// Publications page: live search (title/authors/venue) + year filter + topic/tag chips.
function setupPubFilters(allPubs){
  const search = document.getElementById('pub-search');
  const yearSel = document.getElementById('pub-year-filter');
  const topics = document.getElementById('pub-topics');
  if(!search || !yearSel) return;

  [...new Set(allPubs.map(p=>p.year))].sort((a,b)=>Number(b)-Number(a)).forEach(y=>{
    const o=document.createElement('option'); o.value=y; o.textContent=y; yearSel.appendChild(o);
  });

  let activeTag = 'all';
  if(topics){
    const tags = [...new Set(allPubs.map(p=>p.tag).filter(Boolean))].sort();
    topics.innerHTML = ['all', ...tags].map(t=>
      `<button class="ll-filter-chip${t==='all'?' is-active':''}" data-tag="${t}">${t==='all'?'All topics':t}</button>`
    ).join('');
    topics.addEventListener('click', ev=>{
      const btn = ev.target.closest('.ll-filter-chip'); if(!btn) return;
      activeTag = btn.dataset.tag;
      topics.querySelectorAll('.ll-filter-chip').forEach(b=>b.classList.toggle('is-active', b===btn));
      apply();
    });
  }

  const apply=()=>{
    const q=search.value.toLowerCase(); const y=yearSel.value;
    const filtered=allPubs.filter(p=>{
      const hit=!q || [p.title,p.authors,p.venue].some(f=>(f||'').toLowerCase().includes(q));
      const yr = y==='all' || String(p.year)===y;
      const tg = activeTag==='all' || p.tag===activeTag;
      return hit && yr && tg;
    });
    const c=document.getElementById('publications-container');
    c.innerHTML = pubGroupsHTML(filtered,{}) || '<p class="ll-empty">No publications match.</p>';
    attachBibtexToggles(); revealObserve();
  };
  search.addEventListener('input', apply);
  yearSel.addEventListener('change', apply);
}

// News page: render all items + category filter chips.
function renderNews(d){
  document.getElementById('news-container').innerHTML = newsRowsHTML(d.news);
  setupNewsFilters(d.news);
}

function setupNewsFilters(allNews){
  const chips = document.getElementById('news-topics');
  if(!chips) return;
  const cats = [...new Set(allNews.map(n=>newsCategory(n).label))].sort();
  let active = 'all';
  chips.innerHTML = ['all', ...cats].map(c=>
    `<button class="ll-filter-chip${c==='all'?' is-active':''}" data-cat="${c}">${c==='all'?'All':c}</button>`
  ).join('');
  chips.addEventListener('click', ev=>{
    const btn = ev.target.closest('.ll-filter-chip'); if(!btn) return;
    active = btn.dataset.cat;
    chips.querySelectorAll('.ll-filter-chip').forEach(b=>b.classList.toggle('is-active', b===btn));
    const filtered = active==='all' ? allNews : allNews.filter(n=>newsCategory(n).label===active);
    document.getElementById('news-container').innerHTML = newsRowsHTML(filtered);
    revealObserve();
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
  window.addEventListener('resize', ()=>{ if(window.innerWidth > 860) close(); });
}

document.addEventListener('DOMContentLoaded', bootPage);
