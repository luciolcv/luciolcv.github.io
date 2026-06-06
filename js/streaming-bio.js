// Streaming-bio terminal: types phrases token-by-token with live top-5 logits.
function startStreamingBio(container, phrases) {
  if (!container || !phrases || !phrases.length) return;
  container.classList.add('ll-bio');
  container.innerHTML = `
    <div class="ll-bio-toolbar">
      <div class="ll-bio-dots"><span></span><span></span><span class="ll-bio-live-dot"></span></div>
      <div class="ll-bio-title"><span class="filename">about.lucio</span><span class="sep">—</span><span>streaming bio · <span class="ll-bio-count">000</span> tokens</span></div>
      <div class="ll-bio-live"><span></span>LIVE</div>
    </div>
    <div class="ll-bio-grid">
      <div class="ll-bio-text"><span class="ll-bio-text-stream"></span><span class="ll-bio-caret"></span></div>
      <div class="ll-bio-logits">
        <div class="ll-bio-logits-label">Next token · top-5</div>
        ${[0, 1, 2, 3, 4].map(function (i) {
          return '<div class="ll-bio-logit-row"><div class="ll-bio-logit-tok"></div><div class="ll-bio-logit-bar"><div class="ll-bio-logit-fill' + (i === 0 ? ' top' : '') + '"></div></div><div class="ll-bio-logit-p"></div></div>';
        }).join('')}
      </div>
    </div>`;

  var textEl = container.querySelector('.ll-bio-text-stream');
  var countEl = container.querySelector('.ll-bio-count');
  var rows = Array.prototype.slice.call(container.querySelectorAll('.ll-bio-logit-row')).map(function (r) {
    return {
      tok: r.querySelector('.ll-bio-logit-tok'),
      fill: r.querySelector('.ll-bio-logit-fill'),
      p: r.querySelector('.ll-bio-logit-p')
    };
  });

  if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion:reduce)').matches) {
    textEl.textContent = phrases[0];
    return;
  }

  var VOWELS = ['a', 'e', 't', 'o', 'n', 's', 'i', 'h', 'r', 'd', 'l', 'c', 'u'];
  var PUNCT = ['_', ' ', '—', '▁', '.', '#'];
  var CONS = ['m', 'p', 'g', 'b', 'f', 'y', 'w', 'k'];
  var RARE = ['z', 'x', 'q', 'j', 'v'];
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  var i = 0, phraseIdx = 0, n = 0, timeout;
  var phrase = phrases[0];

  function step() {
    if (i < phrase.length) {
      textEl.textContent = phrase.slice(0, i + 1);
      var correct = phrase[i] || ' ';
      var cands = [correct, pick(VOWELS), pick(PUNCT), pick(CONS), pick(RARE)]
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
      n++;
      countEl.textContent = String(n).padStart(3, '0');
      i++;
      timeout = setTimeout(step, 32 + Math.random() * 36);
    } else {
      timeout = setTimeout(function () {
        phraseIdx = (phraseIdx + 1) % phrases.length;
        phrase = phrases[phraseIdx];
        i = 0;
        textEl.textContent = '';
        step();
      }, 2400);
    }
  }
  step();

  // Pause the loop while the tab is hidden (saves CPU/battery), resume on return.
  document.addEventListener('visibilitychange', function () {
    clearTimeout(timeout);
    if (!document.hidden) step();
  });
}
window.startStreamingBio = startStreamingBio;
