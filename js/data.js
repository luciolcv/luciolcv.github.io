// Loads and caches YAML content. Requires global `jsyaml` (js/vendor/js-yaml.min.js).
const CONTENT_FILES = ['profile', 'news', 'publications', 'projects', 'teaching', 'talks'];
const _cache = {};

// Load the requested files (default: all). Cached per file and reused across page navigations.
async function loadContent(names) {
  const want = (names && names.length) ? names : CONTENT_FILES;
  try {
    await Promise.all(want.map(async name => {
      if (name in _cache) return;
      const res = await fetch(`content/${name}.yaml`);   // default browser HTTP caching
      if (!res.ok) throw new Error(`${name}.yaml → HTTP ${res.status}`);
      _cache[name] = jsyaml.load(await res.text());
    }));
    window.SiteData = _cache;
    return _cache;
  } catch (err) {
    showLoadError(err);
    throw err;
  }
}

function showLoadError(err) {
  const ids = ['news-container','publications-container','projects-container','teaching-container','talks-container','research-cards','social-chips','streaming-bio'];
  const msg = `<div class="ll-error" style="color:var(--accent);font-family:var(--font-mono);padding:24px;border:1px solid var(--border);border-radius:12px">Could not load content (${err.message}). If viewing locally, serve over HTTP: <code>python3 -m http.server</code></div>`;
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = msg; });
  console.error('[loadContent]', err);
}

window.loadContent = loadContent;
