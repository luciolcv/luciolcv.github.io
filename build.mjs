// Deploy build: copies the site to _site/ and bakes the YAML content into each page's HTML,
// so search engines and link previews that don't run JavaScript still see it. It runs the
// real render code (js/*.js) against a stub `document` that records innerHTML writes; the
// interactive setup is stubbed out. In the browser the page JS re-renders the same markup.
// CI runs this on every push (.github/workflows/deploy.yml). Preview the result locally:
//   node build.mjs && python3 -m http.server 8000 -d _site
import fs from 'node:fs';
import vm from 'node:vm';

const OUT = '_site', SITE = `https://${fs.readFileSync('CNAME', 'utf8').trim()}/`;
const read = f => fs.readFileSync(f, 'utf8');

fs.rmSync(OUT, { recursive: true, force: true });
for (const f of fs.readdirSync('.')) if (!f.startsWith('.') && f !== OUT) fs.cpSync(f, `${OUT}/${f}`, { recursive: true });

// URLs of the previous (al-folio) site → their new pages. A static host can't send a 301; an instant
// meta refresh plus canonical is what search engines treat as a permanent redirect.
const MOVED = {
  publications: 'publications.html', teaching: 'teaching.html', news: 'news.html', projects: 'projects.html',
  'projects/Mastodonte': 'projects.html', 'projects/PyBluesky': 'projects.html', 'projects/LawNet-Viz': 'projects.html', 'projects/SONAR': 'projects.html',
};
for (const [from, to] of Object.entries(MOVED)) {
  fs.mkdirSync(`${OUT}/${from}`, { recursive: true });
  fs.writeFileSync(`${OUT}/${from}/index.html`, `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Moved</title><link rel="canonical" href="${SITE}${to}"><meta http-equiv="refresh" content="0; url=/${to}"></head><body><a href="/${to}">This page has moved.</a></body></html>\n`);
}

for (const file of fs.readdirSync('.').filter(f => f.endsWith('.html'))) {
  let src = read(file);
  const page = src.match(/<body data-page="(\w+)"/)[1];
  const html = {};   // element id → innerHTML the render code wrote
  const el = id => ({
    set innerHTML(h){ html[id] = h; }, set textContent(t){ html[id] = t.replace(/&/g, '&amp;').replace(/</g, '&lt;'); },
    value: 'all',   // the publications year <select>'s default option
    querySelector: () => null, addEventListener(){}, add(){},
  });
  const ctx = vm.createContext({
    console, read, URLSearchParams, Option: class {}, location: { search: '', pathname: '', hash: '' }, history: { replaceState(){} },
    document: { body: { dataset: { page } }, lastModified: new Date(), getElementById: el, addEventListener(){} },
  });
  for (const f of ['js/vendor/js-yaml.min.js', 'js/components.js', 'js/streaming-bio.js', 'js/pages.js']) vm.runInContext(read(f), ctx);
  vm.runInContext(`
    loadContent = async names => Object.fromEntries(names.map(n => [n, jsyaml.load(read('content/' + n + '.yaml'))]));
    showLoadError = err => { throw err; };
    startStreamingBio = (el, bio) => { el.innerHTML = bioHTML(bio); };
    mountBackdrop = setupThemeToggle = setupMobileNav = mountChrome = setupPubActions = revealObserve = trackActiveSection = () => {};
  `, ctx);
  await vm.runInContext('bootPage()', ctx);

  // Replace each recorded element's contents (empty, or a short fallback with no nested same-name tag).
  for (const [id, inner] of Object.entries(html)) {
    const re = new RegExp(`(<(\\w+)[^>]*\\sid="${id}"[^>]*>)[\\s\\S]*?(</\\2>)`);
    if (!re.test(src)) throw new Error(`${file}: #${id} not found`);
    src = src.replace(re, (_, open, tag, close) => open + inner + close);
  }

  // Structured data for name searches (schema.org Person), from profile.yaml.
  if (page === 'home') {
    const p = ctx.jsyaml.load(read('content/profile.yaml'));
    const person = {
      '@context': 'https://schema.org', '@type': 'Person', name: p.name, url: SITE, image: new URL(p.photo, SITE).href,
      jobTitle: p.role, worksFor: { '@type': 'Organization', name: p.affiliation },
      knowsAbout: p.research.map(r => r.title), sameAs: p.links.map(l => l.href).filter(h => h.startsWith('http')),
    };
    src = src.replace('</head>', `<script type="application/ld+json">${JSON.stringify(person).replace(/</g, '\\u003c')}</script>\n</head>`);
  }
  fs.writeFileSync(`${OUT}/${file}`, src);
  console.log(file, '←', Object.keys(html).join(', '));
}
