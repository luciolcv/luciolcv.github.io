// Streaming-bio terminal: types the bio token-by-token with live top-5 logits, then stops,
// leaving the full bio on screen. A hidden copy of the full text reserves the final height
// and is what screen readers get (the animated parts are aria-hidden).

// Static markup, before any typing (build.mjs also bakes it into the deployed index.html).
function bioHTML(phrases) {
  return `
    <div class="ll-bio-toolbar" aria-hidden="true">
      <div class="ll-bio-dots"><span></span><span></span><span class="ll-bio-live-dot"></span></div>
      <div class="ll-bio-title"><span class="filename">about.lucio</span><span class="sep">—</span><span>streaming bio · <span class="ll-bio-count">000</span> tokens</span></div>
      <div class="ll-bio-live"><span></span>LIVE</div>
    </div>
    <div class="ll-bio-grid">
      <div class="ll-bio-text"><p class="ll-bio-full">${esc(phrases.join(' '))}</p><p class="ll-bio-stream" aria-hidden="true"><span class="ll-bio-text-stream"></span><span class="ll-bio-caret"></span></p></div>
      <div class="ll-bio-logits" aria-hidden="true">
        <div class="ll-bio-logits-label">Next token · top-5</div>
        ${[0, 1, 2, 3, 4].map(function (i) {
          return '<div class="ll-bio-logit-row"><div class="ll-bio-logit-tok"></div><div class="ll-bio-logit-bar"><div class="ll-bio-logit-fill' + (i === 0 ? ' top' : '') + '"></div></div><div class="ll-bio-logit-p"></div></div>';
        }).join('')}
      </div>
    </div>`;
}

function startStreamingBio(container, phrases) {
  if (!container || !phrases || !phrases.length) return;
  var full = phrases.join(' ');
  container.innerHTML = bioHTML(phrases);

  var textEl = container.querySelector('.ll-bio-text-stream');
  var countEl = container.querySelector('.ll-bio-count');
  var rows = Array.prototype.slice.call(container.querySelectorAll('.ll-bio-logit-row')).map(function (r) {
    return {
      tok: r.querySelector('.ll-bio-logit-tok'),
      fill: r.querySelector('.ll-bio-logit-fill'),
      p: r.querySelector('.ll-bio-logit-p')
    };
  });

  var VOWELS = ['a', 'e', 't', 'o', 'n', 's', 'i', 'h', 'r', 'd', 'l', 'c', 'u'];
  var PUNCT = ['_', ' ', '—', '▁', '.', '#'];
  var CONS = ['m', 'p', 'g', 'b', 'f', 'y', 'w', 'k'];
  var RARE = ['z', 'x', 'q', 'j', 'v'];
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  // Pause briefly at each phrase boundary (keyed by the number of characters typed so far).
  var pauses = {}, pos = 0;
  phrases.forEach(function (ph) { pos += ph.length + 1; pauses[pos - 1] = true; });

  var i = 0, timeout;

  function step() {
    if (i >= full.length) return;   // done: the full bio stays on screen
    textEl.textContent = full.slice(0, i + 1);
    var cands = [full[i], pick(VOWELS), pick(PUNCT), pick(CONS), pick(RARE)]
      .map(function (tok, j) {
        return {
          tok: tok === ' ' ? '␣' : tok,
          p: j === 0 ? 0.62 + Math.random() * 0.3 : (0.38 - j * 0.07) * Math.random()
        };
      })
      .sort(function (a, b) { return b.p - a.p; });
    rows.forEach(function (row, j) {
      var l = cands[j];
      row.tok.textContent = l.tok;
      row.fill.style.width = Math.max(2, Math.min(98, l.p * 100)) + '%';
      row.p.textContent = l.p.toFixed(2);
    });
    i++;
    countEl.textContent = String(i).padStart(3, '0');
    timeout = setTimeout(step, pauses[i] ? 700 : 32 + Math.random() * 36);
  }
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) i = full.length - 1;   // just render the final frame
  step();

  // Pause the loop while the tab is hidden (saves CPU/battery), resume on return.
  document.addEventListener('visibilitychange', function () {
    clearTimeout(timeout);
    if (!document.hidden) step();
  });
}
