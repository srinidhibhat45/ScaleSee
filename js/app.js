/* ScaleSee — state, wiring, and the words above the picture */
/* the two comparison colours, read from CSS so the theme owns them */
function readAccent(name, fallback) {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return /^#[0-9a-f]{3,8}$/i.test(v) ? v : fallback;
  } catch (e) { return fallback; }
}
let COL_A = '#8b3fa8', COL_B = '#2c7a4e';
const $ = id => document.getElementById(id);
const S = { cat: 'money', mode: 'true', a: { v: 1, u: 'mn', c: 'USD' }, b: { v: 1, u: 'bn', c: 'USD' } };

const catOf = () => CATS.find(c => c.id === S.cat) || CATS[0];
const unitOf = (cat, id) => cat.units.find(u => u.id === id) || cat.units[0];
const curOf = id => CURRENCIES.find(c => c.id === id) || CURRENCIES[0];

function baseOf(side) {
  const cat = catOf(), u = unitOf(cat, side.u);
  const v = Number(side.v) || 0;
  if (u.toBase) return u.toBase(v);
  let b = v * (u.f === undefined ? 1 : u.f);
  if (cat.currency) b = b / curOf(side.c).rate;
  return b;
}
function labelOf(side) {
  const cat = catOf(), u = unitOf(cat, side.u);
  if (cat.currency) return curOf(side.c).sym + U.fmt(side.v) + (u.short ? ' ' + u.short : '');
  const word = (Math.abs(side.v - 1) < 1e-9 && u.sing) ? u.sing : u.short;
  return U.fmt(side.v) + ' ' + word;
}
/* the units a human would actually reach for, so a landmark reads
   "828 m" and not "267.1 storeys" */
const NICE_UNITS = {
  money: ['one', 'k', 'mn', 'bn', 'tn'],
  height: ['cm', 'm', 'km'],
  distance: ['m', 'km', 'au', 'ly'],
  land: ['sqm', 'acre', 'sqkm'],
  weight: ['g', 'kg', 't'],
  temp: ['c'],
  time: ['s', 'min', 'h', 'd', 'y'],
  data: ['B', 'KB', 'MB', 'GB', 'TB', 'PB'],
  speed: ['kmh', 'c'],
  volume: ['ml', 'l', 'm3', 'pool'],
  energy: ['j', 'kj', 'mj', 'gj', 'tnt', 'mt']
};
function bestUnit(cat, base) {
  const nice = NICE_UNITS[cat.id] || [];
  let pool = cat.units.filter(u => u.f !== undefined && nice.indexOf(u.id) > -1);
  if (!pool.length) pool = cat.units.filter(u => u.f !== undefined);
  if (!pool.length) return { u: cat.units[0].id, v: base };
  pool.sort((x, y) => y.f - x.f);
  let pick = pool[pool.length - 1];
  for (const u of pool) if (Math.abs(base) / u.f >= 1) { pick = u; break; }
  return { u: pick.id, v: Number((base / pick.f).toPrecision(4)) };
}

/* ---------------- chrome ---------------- */
function buildCats() {
  $('cats').innerHTML = CATS.map(c =>
    `<button type="button" class="cat" data-cat="${c.id}" aria-pressed="${c.id === S.cat}">${icon(c.id)}${c.name}</button>`).join('');
}
function buildUnits() {
  const cat = catOf();
  ['A', 'B'].forEach(k => {
    const side = S[k.toLowerCase()];
    $('u' + k).innerHTML = cat.units.map(u =>
      `<option value="${u.id}"${u.id === side.u ? ' selected' : ''}>${U.esc(u.name)}</option>`).join('');
    const cur = $('c' + k);
    cur.hidden = !cat.currency;
    cur.innerHTML = CURRENCIES.map(c =>
      `<option value="${c.id}"${c.id === side.c ? ' selected' : ''}>${c.sym} ${c.id}</option>`).join('');
  });
}
function buildPresets() {
  $('presets').innerHTML = catOf().presets.map((p, i) =>
    `<button type="button" class="chip" data-preset="${i}">${U.esc(p.t)}</button>`).join('');
}
/* how a landmark reads on its own terms: 828 m, not 267.1 storeys */
function refReading(cat, r) {
  const nu = bestUnit(cat, r.v);
  const u = unitOf(cat, nu.u);
  const word = (Math.abs(nu.v - 1) < 1e-9 && u.sing) ? u.sing : u.short;
  return (cat.currency ? '$' : '') + U.fmt(nu.v) + (word ? ' ' + word : '');
}
/* the reference points, as a ladder you can read down rather than a cloud of
   chips: sorted, measured, and with a bar so the spread is visible */
function buildRefs() {
  const cat = catOf();
  const vals = cat.refs.map(r => r.v);
  const hi = Math.max.apply(null, vals), lo = Math.min.apply(null, vals);
  const useLog = lo > 0 && hi / lo > 40;
  const frac = v => useLog
    ? Math.log10(v / lo) / (Math.log10(hi / lo) || 1)
    : (v - lo) / ((hi - lo) || 1);
  const live = [baseOf(S.a), baseOf(S.b)];
  const isOn = v => live.some(b => Math.abs(b - v) / Math.max(Math.abs(v), 1e-12) < 0.006);
  $('refs').innerHTML = cat.refs
    .map((r, i) => ({ r, i }))
    .sort((x, y) => y.r.v - x.r.v)
    .map(x => `<button type="button" class="ref" data-ref="${x.i}" aria-pressed="${isOn(x.r.v)}">`
      + `<span class="ref-name">${U.esc(x.r.n)}</span>`
      + `<span class="ref-bar"><i style="width:${(6 + 94 * U.clamp(frac(x.r.v), 0, 1)).toFixed(1)}%"></i></span>`
      + `<span class="ref-val">${U.esc(refReading(cat, x.r))}</span></button>`).join('');
}
function syncInputs() {
  $('vA').value = U.fmtExact(S.a.v);
  $('vB').value = U.fmtExact(S.b.v);
  ['A', 'B'].forEach(k => {
    $('u' + k).value = S[k.toLowerCase()].u;
    if (catOf().currency) $('c' + k).value = S[k.toLowerCase()].c;
  });
}

/* ---------------- the headline ---------------- */
function analogyFor(r) {
  if (r < 2.5) return '';
  let best = null, bd = Infinity;
  for (const a of ANALOGIES) {
    const d = Math.abs(Math.log10(a.r) - Math.log10(r));
    if (d < bd) { bd = d; best = a; }
  }
  if (!best || bd > 0.62) return '';
  return `That gap is roughly <b>${best.a}</b> next to <b>${best.b}</b>.`;
}
function writeVerdict(A, B) {
  const cat = catOf();
  const la = `<span class="hi-a">${U.esc(A.label)}</span>`, lb = `<span class="hi-b">${U.esc(B.label)}</span>`;
  if (cat.diff) {
    const d = Math.abs(B.base - A.base);
    $('verdict').innerHTML = d < 1e-9
      ? `${la} and ${lb} are <span class="big">the same temperature</span>`
      : `${lb} is <span class="big">${U.fmt(d)} °C</span> ${B.base > A.base ? 'hotter' : 'colder'} than ${la}`;
    $('verdictSub').innerHTML = `That is <b>${U.fmt(d * 9 / 5)} °F</b> of difference — the same gap either way, because degrees are steps, not sizes.`;
    return;
  }
  const big = Math.max(A.base, B.base), small = Math.min(A.base, B.base);
  const bigger = A.base >= B.base ? la : lb, smaller = A.base >= B.base ? lb : la;
  if (!(small > 0)) {
    $('verdict').innerHTML = `${bigger} vs ${smaller}`;
    $('verdictSub').innerHTML = 'Pop in a number bigger than zero and we can compare properly.';
    return;
  }
  const r = big / small;
  if (r < 1.0005) {
    $('verdict').innerHTML = `${la} and ${lb} are <span class="big">exactly the same</span>`;
    $('verdictSub').innerHTML = 'Different words, same amount. Satisfying, isn\'t it.';
    return;
  }
  const word = { land: 'bigger', height: 'taller', distance: 'longer', weight: 'heavier', time: 'longer', speed: 'faster', volume: 'bigger', data: 'bigger', money: 'more' }[cat.id] || 'bigger';
  $('verdict').innerHTML = `${bigger} is <span class="big">${U.fmtRatio(r)}</span> ${word} than ${smaller}`;
  $('verdictSub').innerHTML = `You could fit <b>${U.fmtExact(U.r(r, 2))}</b> of the smaller one inside the bigger one. ` + analogyFor(r);
}

/* ---------------- render ---------------- */
function render() {
  const cat = catOf();
  const A = { base: baseOf(S.a), label: labelOf(S.a), color: COL_A, side: 'a' };
  const B = { base: baseOf(S.b), label: labelOf(S.b), color: COL_B, side: 'b' };
  $('legA').textContent = A.label;
  $('legB').textContent = B.label;
  writeVerdict(A, B);

  const guard = v => (cat.diff ? v : (isFinite(v) && v > 0 ? v : 1e-9));
  const ctx = { cat, mode: S.mode, A: Object.assign({}, A, { base: guard(A.base) }), B: Object.assign({}, B, { base: guard(B.base) }) };
  let out;
  try { out = Renderers[cat.renderer](ctx); }
  catch (err) { console.error(err); out = { svg: '', note: 'that one broke the drawing board — try another number' }; }
  $('stage').innerHTML = out.svg;
  $('stageNote').textContent = out.note || '';

  $('facts').innerHTML =
    `<caption class="sr-only">${U.esc(A.label)} and ${U.esc(B.label)}, expressed in other terms</caption>`
    + `<thead><tr><th scope="col" class="fh-l">measured as</th>`
    + `<th scope="col" class="fh fh-a">${U.esc(A.label)}</th>`
    + `<th scope="col" class="fh fh-b">${U.esc(B.label)}</th></tr></thead><tbody>`
    + (FACTS[cat.id] || []).map(f =>
      `<tr><th scope="row">${U.esc(f.l)}</th>`
      + `<td>${U.esc(f.fn(A.base))}</td><td>${U.esc(f.fn(B.base))}</td></tr>`).join('')
    + `</tbody>`;

  buildRefs();
  document.querySelectorAll('.mode').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === S.mode)));
  document.querySelectorAll('.cat').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cat === S.cat)));
  /* the picture is the main content, so it needs to say what it shows */
  $('stage').setAttribute('aria-label',
    ($('verdict').textContent || '').trim() + '. Drawn at ' + (S.mode === 'log' ? 'log' : 'true') + ' scale'
    + (out.note ? '. ' + out.note : '') + '. The same figures are listed in the table below.');
  writeHash();
}

/* ---------------- url state ---------------- */
function writeHash() {
  const p = [S.cat, S.a.v, S.a.u, S.a.c || '-', S.b.v, S.b.u, S.b.c || '-', S.mode];
  try { history.replaceState(null, '', '#' + p.join('~')); }
  catch (e) { /* embedded somewhere that won't let us touch the URL — no harm done */ }
}
function readHash() {
  const raw = decodeURIComponent(location.hash.replace(/^#/, ''));
  if (!raw) return false;
  const p = raw.split('~');
  const cat = CATS.find(c => c.id === p[0]);
  if (!cat || p.length < 7) return false;
  S.cat = cat.id;
  S.a = { v: parseFloat(p[1]), u: p[2], c: p[3] === '-' ? 'USD' : p[3] };
  S.b = { v: parseFloat(p[4]), u: p[5], c: p[6] === '-' ? 'USD' : p[6] };
  S.mode = p[7] === 'log' ? 'log' : 'true';
  if (!isFinite(S.a.v) || !isFinite(S.b.v)) return false;
  return true;
}

/* ---------------- interactions ---------------- */
function setCat(id) {
  const cat = CATS.find(c => c.id === id);
  if (!cat) return;
  S.cat = id;
  S.a = Object.assign({ c: 'USD' }, cat.def.a);
  S.b = Object.assign({ c: 'USD' }, cat.def.b);
  buildUnits(); buildPresets(); buildRefs(); syncInputs(); render();
}
function applyPreset(p) {
  S.a = { v: p.a[0], u: p.a[1], c: p.a[2] || 'USD' };
  S.b = { v: p.b[0], u: p.b[1], c: p.b[2] || 'USD' };
  syncInputs(); render();
}
function parseVal(str, allowNeg) {
  const n = parseFloat(String(str).replace(/[, ]/g, ''));
  if (!isFinite(n)) return null;
  return allowNeg ? n : Math.max(n, 0);
}


/* ---------------- theme ----------------
   Three states: follow the system, or pin light or dark. The choice is kept
   in localStorage, and the drawings are repainted because their palette lives
   in JS rather than CSS. */
const THEME_KEY = 'scalesee.theme';
let themePref = 'auto';
function systemDark() {
  try { return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; }
  catch (e) { return false; }
}
function effectiveTheme() { return themePref === 'auto' ? (systemDark() ? 'dark' : 'light') : themePref; }
function syncThemeButtons() {
  document.querySelectorAll('[data-theme-set]').forEach(b =>
    b.setAttribute('aria-pressed', String(b.dataset.themeSet === themePref)));
}
function applyTheme(pref, announce) {
  if (pref) themePref = pref;
  try { localStorage.setItem(THEME_KEY, themePref); } catch (e) { /* private window */ }
  if (themePref === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', themePref);
  ART.setTheme(effectiveTheme());
  COL_A = readAccent('--a', COL_A); COL_B = readAccent('--b', COL_B);
  syncThemeButtons();
  render();
  if (announce) say(themePref === 'auto' ? 'theme follows your system' : themePref + ' theme');
}
function initTheme() {
  try { themePref = localStorage.getItem(THEME_KEY) || 'auto'; } catch (e) { themePref = 'auto'; }
  if (['auto', 'light', 'dark'].indexOf(themePref) < 0) themePref = 'auto';
  if (themePref !== 'auto') document.documentElement.setAttribute('data-theme', themePref);
  ART.setTheme(effectiveTheme());
  COL_A = readAccent('--a', COL_A); COL_B = readAccent('--b', COL_B);
  syncThemeButtons();
  try {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (themePref !== 'auto') return;
      ART.setTheme(effectiveTheme());
      COL_A = readAccent('--a', COL_A); COL_B = readAccent('--b', COL_B);
      render();
    };
    mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange);
  } catch (e) { /* no matchMedia, no problem */ }
}

/* ---------------- announcements ---------------- */
let sayTimer = null;
function say(msg) {
  const el = $('liveMsg');
  if (!el) return;
  clearTimeout(sayTimer);
  el.textContent = '';
  sayTimer = setTimeout(() => { el.textContent = msg; }, 60);
}

/* ---------------- saving the picture ----------------
   The SVG is self-contained, so it can be rasterised through a canvas. Web
   fonts do not follow an image into a canvas, so the clone is switched to
   system stacks first — that way the export looks deliberate rather than
   broken. */
function download(url, name, revoke) {
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  if (revoke) setTimeout(() => URL.revokeObjectURL(url), 4000);
}
function savePicture() {
  const svg = $('stage').querySelector('svg');
  if (!svg) return;
  const W = 2000, H = 1120;
  const clone = svg.cloneNode(true);
  clone.setAttribute('width', W); clone.setAttribute('height', H);
  const SANS = 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';
  const MONOF = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
  clone.setAttribute('font-family', SANS);
  Array.prototype.forEach.call(clone.querySelectorAll('[font-family]'), n => {
    n.setAttribute('font-family', /mono/i.test(n.getAttribute('font-family') || '') ? MONOF : SANS);
  });
  const src = new XMLSerializer().serializeToString(clone);
  const name = 'scalesee-' + S.cat + '-' + Date.now().toString(36);
  const svgUrl = URL.createObjectURL(new Blob([src], { type: 'image/svg+xml;charset=utf-8' }));
  const bg = (getComputedStyle($('stage')).backgroundColor || '') || '#eeeeea';
  const img = new Image();
  img.onload = function () {
    try {
      const cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      const g = cv.getContext('2d');
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.drawImage(img, 0, 0, W, H);
      URL.revokeObjectURL(svgUrl);
      cv.toBlob(function (b) {
        if (!b) { download(svgUrl, name + '.svg'); return; }
        download(URL.createObjectURL(b), name + '.png', true);
        say('saved the picture as a PNG');
      }, 'image/png');
    } catch (e) { download(svgUrl, name + '.svg', true); say('saved the picture as an SVG'); }
  };
  img.onerror = function () { download(svgUrl, name + '.svg', true); say('saved the picture as an SVG'); };
  img.src = svgUrl;
}

/* ---------------- keyboard ---------------- */
function isTyping(e) {
  const t = e.target;
  return !!t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
}
function stepCat(dir) {
  const i = CATS.findIndex(c => c.id === S.cat);
  setCat(CATS[(i + dir + CATS.length) % CATS.length].id);
  say(catOf().name);
}
function bindKeys() {
  const sheet = $('sheet');
  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Escape' && sheet.open) { sheet.close(); return; }
    /* inside a number box the arrows are a decade nudge, everything else is left alone */
    if (isTyping(e)) {
      if ((e.target.id === 'vA' || e.target.id === 'vB') && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        const key = e.target.id === 'vA' ? 'a' : 'b';
        const v = Number(S[key].v) || 0;
        if (!v) return;
        S[key].v = Number((e.key === 'ArrowUp' ? v * 10 : v / 10).toPrecision(12));
        syncInputs(); render();
      }
      return;
    }
    const k = e.key.toLowerCase();
    if (k === 's') { $('swap').click(); say('swapped'); }
    else if (k === 'r') { $('shuffle').click(); }
    else if (k === 't') { S.mode = S.mode === 'true' ? 'log' : 'true'; render(); say(S.mode === 'log' ? 'log scale' : 'true scale'); }
    else if (k === 'd') { applyTheme(effectiveTheme() === 'dark' ? 'light' : 'dark', true); }
    else if (k === 'c') { $('copy').click(); }
    else if (k === 'p') { savePicture(); }
    else if (e.key === '[') { stepCat(-1); }
    else if (e.key === ']') { stepCat(1); }
    else if (e.key === '?' || (e.key === '/' && e.shiftKey)) { e.preventDefault(); sheet.showModal(); }
    else return;
    e.preventDefault();
  });
}

function init() {
  if (!readHash()) { const c = CATS[0]; S.a = Object.assign({ c: 'USD' }, c.def.a); S.b = Object.assign({ c: 'USD' }, c.def.b); }
  initTheme();
  buildCats(); buildUnits(); buildPresets(); buildRefs(); syncInputs(); render();
  bindKeys();

  $('themer').addEventListener('click', e => {
    const b = e.target.closest('[data-theme-set]');
    if (b) applyTheme(b.dataset.themeSet, true);
  });
  $('help').addEventListener('click', () => $('sheet').showModal());
  $('sheetClose').addEventListener('click', () => $('sheet').close());
  $('sheet').addEventListener('click', e => { if (e.target === $('sheet')) $('sheet').close(); });
  $('save').addEventListener('click', savePicture);

  $('cats').addEventListener('click', e => { const b = e.target.closest('.cat'); if (b) setCat(b.dataset.cat); });
  $('presets').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) applyPreset(catOf().presets[+b.dataset.preset]); });
  $('refs').addEventListener('click', e => {
    const b = e.target.closest('.ref'); if (!b) return;
    const r = catOf().refs[+b.dataset.ref];
    S.a = { v: S.b.v, u: S.b.u, c: S.b.c };                 // last pick slides left
    const nu = bestUnit(catOf(), r.v);
    S.b = { v: nu.v, u: nu.u, c: 'USD' };
    syncInputs(); render();
  });
  $('modes').addEventListener('click', e => { const b = e.target.closest('.mode'); if (b) { S.mode = b.dataset.mode; render(); } });
  $('swap').addEventListener('click', () => { const t = S.a; S.a = S.b; S.b = t; syncInputs(); render(); });

  ['A', 'B'].forEach(k => {
    const key = k.toLowerCase();
    $('v' + k).addEventListener('input', e => {
      const n = parseVal(e.target.value, !!catOf().diff);
      if (n === null) return;
      S[key].v = n; render();
    });
    $('v' + k).addEventListener('blur', () => syncInputs());
    $('u' + k).addEventListener('change', e => { S[key].u = e.target.value; render(); });
    $('c' + k).addEventListener('change', e => { S[key].c = e.target.value; render(); });
  });

  $('shuffle').addEventListener('click', () => {
    const c = CATS[Math.floor(Math.random() * CATS.length)];
    S.cat = c.id; buildUnits(); buildPresets(); buildRefs();
    applyPreset(c.presets[Math.floor(Math.random() * c.presets.length)]);
    document.querySelector('.stagewrap').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  $('copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); $('copy').textContent = 'copied to clipboard'; say('link copied to the clipboard'); }
    catch (e) { $('copy').textContent = location.hash; say('could not reach the clipboard'); }
    setTimeout(() => { $('copy').textContent = 'copy this comparison'; }, 1600);
  });
  window.addEventListener('hashchange', () => { if (readHash()) { buildCats(); buildUnits(); buildPresets(); buildRefs(); syncInputs(); render(); } });
}
document.addEventListener('DOMContentLoaded', init);
