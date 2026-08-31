/* ScaleSee — the drawing kit.
   Flat silhouettes given a shallow extrusion, one light from the upper
   left, and soft contact shadows: not flat, not a rendered 3-D scene,
   somewhere in between. Nothing is outlined — form comes from tone.

   The landmarks are drawn from their published elevations. Every setback
   height and width below is the real dimension divided by the building's
   own height, so the silhouette holds up at any size:
     Burj Khalifa   828 m — top floor 585.4 (.707), spire base 739.4 (.893)
     Eiffel Tower   330 m — base 125 m square, decks at 57 (.173), 115 (.348), 276 (.836)
     Empire State   443 m — roof 381 (.860), base 129 m across, mast 62 m
     Great Pyramid  146.6 m original — half-base 115.2 m, faces at 51.8°
   Every shape draws a thing `h` px tall, standing on y = by, centred on cx. */

const INK = '#171a1f';
const EX = 0.8660254, EY = 0.5;          /* extrusion runs up and to the right */
const ART = {};

/* ---------------- colour ---------------- */
function hex2rgb(h) {
  h = String(h).replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgb2hex(a) {
  return '#' + a.map(v => U.clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
}
function mix(a, b, t) {
  const A = hex2rgb(a), B = hex2rgb(b);
  return rgb2hex([0, 1, 2].map(i => A[i] + (B[i] - A[i]) * t));
}
ART.mix = mix;
ART.lift = (c, t) => mix(c, '#ffffff', t);
ART.sink = (c, t) => mix(c, '#0c1016', t);
ART.shade = (c, amt) => amt >= 0 ? ART.lift(c, amt / 255) : ART.sink(c, -amt / 255);
ART.faces = c => ({ top: ART.lift(c, 0.26), front: c, side: ART.sink(c, 0.30) });

/* ---------------- themes ----------------
   Everything the pictures paint that is not one of the two comparison colours
   lives here, so light and dark are the same drawing in two palettes. Text
   tones were picked to clear 4.5:1 against the surface they land on. */
const THEMES = {
  light: {
    name: 'light',
    ink: '#171a1f', grid: '#171a1f', gridOp: 1,
    text: '#232227', dim: '#585759', faint: '#68676a', axis: '#68676a',
    ghost: '#585759', ghostArt: '#b9b8bc',
    sky0: '#e6e6e9', sky1: '#eeedee', sky2: '#f2f1f0',
    ground0: '#dfdcd8', ground1: '#d0cdc9', horizon: '#eeedee',
    stone: '#8e8d92', haze: '#eaeaec',
    panel: '#ffffff', panelOp: '.55',
    road: '#3d434c', roadLine: '#e8e3d6', kerb: '#2b3037', flag: '#efece4',
    tube: '#e4e1da', track: '#e4e2dc',
    grass: '#b9cba0', soilA: '#a8a08f', soilB: '#8d8676',
    stand: '#b9b2a4', standDark: '#a49c8e', pan: '#dcd6ca', panDark: '#b8b1a3',
    rope: '#9aa1ab', pivot: '#4c545f', pivotHi: '#a8b0ba', beam: '#5f6773', beamHi: '#98a0ab',
    token: '#b0aa9c', house: '#e2d3b4', tree: '#6a9d53', scaleNote: '#4a5a3e',
    onAccent: '#ffffff', dimLine: '#22262c'
  },
  dark: {
    name: 'dark',
    ink: '#e8e7ea', grid: '#e8e7ea', gridOp: 1,
    text: '#e8e6e1', dim: '#aab1bb', faint: '#8f97a1', axis: '#858d97',
    ghost: '#8b939d', ghostArt: '#39404a',
    sky0: '#191820', sky1: '#151417', sky2: '#161519',
    ground0: '#25242a', ground1: '#1c1b20', horizon: '#151417',
    stone: '#6f7783', haze: '#1b1a1f',
    panel: '#ffffff', panelOp: '.05',
    road: '#31373f', roadLine: '#8a8578', kerb: '#1e2228', flag: '#c9c6bf',
    tube: '#2a2f36', track: '#2a2e34',
    grass: '#4b6641', soilA: '#4a4437', soilB: '#38332a',
    stand: '#4d4a43', standDark: '#3e3b35', pan: '#5a564d', panDark: '#413e38',
    rope: '#767d88', pivot: '#8f97a1', pivotHi: '#c3cad3', beam: '#8d949e', beamHi: '#c0c7d0',
    token: '#4f4c45', house: '#6b6047', tree: '#41703a', scaleNote: '#b7c9a8',
    onAccent: '#12151a', dimLine: '#e8e6e1'
  }
};
ART.T = THEMES.light;
ART.setTheme = function (m) { ART.T = THEMES[m === 'dark' ? 'dark' : 'light']; return ART.T; };
ART.haze = (c, t) => mix(c, ART.T.haze, t);          /* push toward the backdrop = distance */

/* ---------------- shared gradients ----------------
   A function rather than a constant, because the sky and the ground change
   with the theme. */
ART.DEFS = function () {
  const T = ART.T;
  return `<defs>
<linearGradient id="ss-sheen" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#fff" stop-opacity="${T.name === 'dark' ? '.20' : '.30'}"/>
  <stop offset=".5" stop-color="#fff" stop-opacity="${T.name === 'dark' ? '.03' : '.05'}"/>
  <stop offset="1" stop-color="#fff" stop-opacity="0"/>
</linearGradient>
<linearGradient id="ss-deep" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#0c1016" stop-opacity="0"/>
  <stop offset="1" stop-color="#0c1016" stop-opacity=".20"/>
</linearGradient>
<linearGradient id="ss-cyl" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#0c1016" stop-opacity=".20"/>
  <stop offset=".28" stop-color="#fff" stop-opacity=".26"/>
  <stop offset=".62" stop-color="#fff" stop-opacity="0"/>
  <stop offset="1" stop-color="#0c1016" stop-opacity=".22"/>
</linearGradient>
<linearGradient id="ss-sky" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="${T.sky0}"/>
  <stop offset=".72" stop-color="${T.sky1}"/>
  <stop offset="1" stop-color="${T.sky2}"/>
</linearGradient>
<linearGradient id="ss-ground" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="${T.ground0}"/>
  <stop offset="1" stop-color="${T.ground1}"/>
</linearGradient>
<linearGradient id="ss-horizon" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="${T.horizon}" stop-opacity=".9"/>
  <stop offset="1" stop-color="${T.horizon}" stop-opacity="0"/>
</linearGradient>
<radialGradient id="ss-blob">
  <stop offset="0" stop-color="${T.name === 'dark' ? '#000000' : '#171a1f'}" stop-opacity="${T.name === 'dark' ? '.42' : '.30'}"/>
  <stop offset=".55" stop-color="${T.name === 'dark' ? '#000000' : '#171a1f'}" stop-opacity="${T.name === 'dark' ? '.18' : '.12'}"/>
  <stop offset="1" stop-color="${T.name === 'dark' ? '#000000' : '#171a1f'}" stop-opacity="0"/>
</radialGradient>
</defs>`;
};

/* ---------------- primitives ---------------- */

/* the soft pool a thing sits in */
ART.cast = function (cx, by, rx, ry) {
  rx = Math.max(rx, 2.5);
  return `<ellipse cx="${cx.toFixed(1)}" cy="${(by + 1.5).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${Math.max(ry || rx * 0.17, 1.8).toFixed(1)}" fill="url(#ss-blob)"/>`;
};

/* a rectangular solid: front face, plus the top and right faces you'd see
   looking slightly down and slightly left of it */
ART.box = function (x, y, w, h, d, c, rx) {
  const F = ART.faces(c), dx = d * EX, dy = -d * EY;
  const r = rx ? ` rx="${rx}"` : '';
  let g = '';
  if (d > 0.5 && w > 2) {
    g += `<path d="M ${(x + w).toFixed(1)} ${y.toFixed(1)} l ${dx.toFixed(1)} ${dy.toFixed(1)} l 0 ${h.toFixed(1)} l ${(-dx).toFixed(1)} ${(-dy).toFixed(1)} z" fill="${F.side}"/>`;
    g += `<path d="M ${x.toFixed(1)} ${y.toFixed(1)} l ${dx.toFixed(1)} ${dy.toFixed(1)} l ${w.toFixed(1)} 0 l ${(-dx).toFixed(1)} ${(-dy).toFixed(1)} z" fill="${F.top}"/>`;
  }
  g += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"${r} fill="${F.front}"/>`;
  g += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"${r} fill="url(#ss-sheen)"/>`;
  return g;
};

/* the same trick for an arbitrary silhouette: a copy shifted along the
   extrusion axis, sitting behind, reads as thickness */
ART.prism = function (d, depth, c, sheen) {
  const F = ART.faces(c), dx = (depth * EX).toFixed(2), dy = (-depth * EY).toFixed(2);
  return `<g>${depth > 0.4 ? `<path d="${d}" fill="${F.side}" transform="translate(${dx},${dy})"/>` : ''}`
    + `<path d="${d}" fill="${F.front}"/>`
    + (sheen === false ? '' : `<path d="${d}" fill="url(#ss-sheen)"/>`) + `</g>`;
};

/* sky, ground, and a floor grid that bunches up toward the horizon */
ART.scene = function (gy, VW, VH, o) {
  o = o || {};
  let g = `<rect width="${VW}" height="${VH}" fill="url(#ss-sky)"/>`;
  g += `<rect y="${gy}" width="${VW}" height="${VH - gy}" fill="url(#ss-ground)"/>`;
  const depth = VH - gy, vp = o.vp === undefined ? VW / 2 : o.vp;
  for (let i = 1; i <= 7; i++) {
    const t = i / 7, y = gy + depth * t * t;
    g += `<line x1="0" y1="${y.toFixed(1)}" x2="${VW}" y2="${y.toFixed(1)}" stroke="${ART.T.grid}" stroke-opacity="${(0.04 + 0.05 * t).toFixed(3)}" stroke-width="1"/>`;
  }
  for (let i = -7; i <= 7; i++) {
    if (!i) continue;
    g += `<line x1="${(vp + i * 30).toFixed(1)}" y1="${gy}" x2="${(vp + i * VW / 7).toFixed(1)}" y2="${VH}" stroke="${ART.T.grid}" stroke-opacity=".045" stroke-width="1"/>`;
  }
  g += `<rect y="${gy}" width="${VW}" height="30" fill="url(#ss-horizon)"/>`;
  g += `<line x1="0" y1="${gy}" x2="${VW}" y2="${gy}" stroke="${ART.T.grid}" stroke-opacity=".18" stroke-width="1"/>`;
  return g;
};

/* a flat backdrop for the diagrams that aren't standing on ground */
ART.flat = function (VW, VH) {
  return `<rect width="${VW}" height="${VH}" fill="url(#ss-sky)"/>`;
};

/* ---------------- facade detail ---------------- */
function mullions(x, y, w, hh, c, n) {
  if (w < 9 || hh < 16) return '';
  const step = Math.max(3.4, w / (n || 8));
  let o = '';
  for (let xx = x + step; xx < x + w - step * 0.4; xx += step)
    o += `<line x1="${xx.toFixed(1)}" y1="${y.toFixed(1)}" x2="${xx.toFixed(1)}" y2="${(y + hh).toFixed(1)}" stroke="${ART.lift(c, .55)}" stroke-opacity=".34" stroke-width="1"/>`;
  return o;
}
function courses(x, y, w, hh, c, gap) {
  if (hh < 26 || w < 8) return '';
  let o = '', step = Math.max(5, hh * (gap || .06));
  for (let yy = y + step; yy < y + hh - step * .4; yy += step)
    o += `<line x1="${(x + w * .08).toFixed(1)}" y1="${yy.toFixed(1)}" x2="${(x + w * .92).toFixed(1)}" y2="${yy.toFixed(1)}" stroke="${ART.sink(c, .3)}" stroke-opacity=".26" stroke-width="1"/>`;
  return o;
}
/* a stack of setbacks: each entry is [y0, y1, halfLeft, halfRight] as a
   fraction of the building's own height */
function stack(cx, by, h, c, list, o) {
  o = o || {};
  let g = '';
  list.forEach(t => {
    const x = cx - t[2] * h, w = (t[2] + t[3]) * h;
    const y = by - t[1] * h, hh = (t[1] - t[0]) * h;
    const d = Math.min(w * (o.depth === undefined ? 0.62 : o.depth), h * 0.11);
    g += ART.box(x, y, w, hh, d, c);
    if (o.mull) g += mullions(x, y, w, hh, c, o.mull);
    if (o.courses) g += courses(x, y, w, hh, c, o.courses);
  });
  return g;
}

/* ---------------- people ---------------- */

/* a scale figure, drawn the way an architect draws entourage: eight heads
   tall, slim limbs, nothing cartoonish. */
ART.human = function (cx, by, h, c) {
  c = c || ART.T.stone;
  const F = ART.faces(c);
  const P = (X, Y) => (cx + X * h).toFixed(2) + ' ' + (by - Y * h).toFixed(2);
  if (h < 8) return `<rect x="${(cx - h * 0.13).toFixed(2)}" y="${(by - h).toFixed(2)}" width="${(h * 0.26).toFixed(2)}" height="${h.toFixed(2)}" rx="${(h * 0.12).toFixed(2)}" fill="${c}"/>`;

  /* shoulders → waist → hips, with a neck rising into the head */
  const torso = `M ${P(-.026, .890)} L ${P(.026, .890)} L ${P(.034, .862)} `
    + `C ${P(.070, .852)} ${P(.088, .830)} ${P(.089, .800)} `
    + `C ${P(.086, .720)} ${P(.072, .655)} ${P(.070, .590)} `
    + `L ${P(.078, .452)} L ${P(-.078, .452)} L ${P(-.070, .590)} `
    + `C ${P(-.072, .655)} ${P(-.086, .720)} ${P(-.089, .800)} `
    + `C ${P(-.088, .830)} ${P(-.068, .852)} ${P(-.034, .862)} Z`;
  const limb = (x1, y1, x2, y2, w, col) =>
    `<line x1="${(cx + x1 * h).toFixed(2)}" y1="${(by - y1 * h).toFixed(2)}" x2="${(cx + x2 * h).toFixed(2)}" y2="${(by - y2 * h).toFixed(2)}" stroke="${col}" stroke-width="${(w * h).toFixed(2)}" stroke-linecap="round"/>`;
  const figure = col =>
    limb(-.078, .790, -.100, .455, .042, col) + limb(.078, .790, .100, .455, .042, col)
    + limb(-.036, .450, -.046, .038, .060, col) + limb(.036, .450, .046, .038, .060, col)
    + `<path d="${torso}" fill="${col}"/>`
    + `<circle cx="${cx.toFixed(2)}" cy="${(by - h * 0.934).toFixed(2)}" r="${(h * 0.066).toFixed(2)}" fill="${col}"/>`;

  const dx = (h * 0.016).toFixed(2), dy = (-h * 0.008).toFixed(2);
  return ART.cast(cx, by, h * 0.15, h * 0.026)
    + `<g transform="translate(${dx},${dy})">${figure(F.side)}</g>`
    + `<g>${figure(F.front)}</g>`;
};

/* ---------------- the landmarks ---------------- */

/* Burj Khalifa: setbacks spiral, so the profile steps alternately left and
   right on the way up, then the occupied tower stops and a long needle
   carries the last 30% of the height. */
ART.burj = function (cx, by, h, c) {
  const F = ART.faces(c), TOP = .707;
  /* long straight runs between setbacks, alternating sides on the way up */
  const list = [
    [0, .176, .0720, .0720], [.175, .301, .0660, .0720], [.300, .401, .0660, .0640],
    [.400, .486, .0580, .0640], [.485, .556, .0580, .0535], [.555, .616, .0490, .0535],
    [.615, .666, .0490, .0430], [.665, TOP, .0380, .0430]
  ];
  let g = ART.cast(cx, by, h * .13, h * .028);
  g += stack(cx, by, h, c, list, { depth: .5, mull: 6 });
  const yF = by - h * TOP, yS = by - h * .893;
  g += ART.prism(`M ${cx - h * .0195} ${yF} L ${cx + h * .0165} ${yF} L ${cx + h * .0062} ${yS} L ${cx - h * .0062} ${yS} Z`, h * .012, c);
  g += `<path d="M ${cx - h * .0042} ${yS} L ${cx + h * .0042} ${yS} L ${cx} ${by - h} Z" fill="${F.side}"/>`;
  return g;
};

/* Eiffel Tower: the identity is the curve of the piers and the three decks.
   Legs are filled ribbons that taper as they rise, with the back pair drawn
   darker so the tower reads as an object rather than a sign. */
ART.truss = function (cx, by, h, c) {
  const F = ART.faces(c);
  const P1 = .173, P2 = .348, P3 = .836;
  const half = t => .189 * Math.exp(-3.05 * Math.min(t, P3));
  const thick = t => (.030 - .020 * (t / P3)) * h;
  const X = (t, s) => cx + s * half(t) * h, Y = t => by - t * h;

  const legPair = (col, inset, tw) => {
    let out = '';
    [-1, 1].forEach(s => {
      let up = '', down = '';
      for (let t = 0; t <= P3 + 1e-9; t += P3 / 26) {
        const o = X(t, s) - s * inset * h, w = thick(t) * tw;
        up += `${up ? 'L' : 'M'} ${o.toFixed(2)} ${Y(t).toFixed(2)} `;
        down = `L ${(o - s * w).toFixed(2)} ${Y(t).toFixed(2)} ` + down;
      }
      out += `<path d="${up}${down}Z" fill="${col}"/>`;
    });
    return out;
  };
  const deck = (t, pad, dh, col) => {
    const w = (half(t) + pad) * h * 2;
    return ART.box(cx - w / 2, Y(t) - dh * h, w, dh * h, Math.min(w * .3, h * .05), col);
  };

  let g = ART.cast(cx, by, h * .24, h * .05);
  g += legPair(ART.sink(c, .34), .052, .8);                 /* the far pair */
  /* the arch that springs between the piers under the first deck */
  const a0 = X(0, -1) - h * .01, a1 = X(0, 1) + h * .01;
  g += `<path d="M ${a0.toFixed(1)} ${Y(P1 - .012).toFixed(1)} Q ${cx} ${Y(P1 - .175).toFixed(1)} ${a1.toFixed(1)} ${Y(P1 - .012).toFixed(1)}
    L ${a1.toFixed(1)} ${Y(P1 - .048).toFixed(1)} Q ${cx} ${Y(P1 - .140).toFixed(1)} ${a0.toFixed(1)} ${Y(P1 - .048).toFixed(1)} Z" fill="${ART.sink(c, .16)}"/>`;
  g += legPair(F.front, 0, 1);                              /* the near pair */
  /* lattice between the decks */
  let lat = '';
  const bands = [[P1 + .012, P2 - .014, 5], [P2 + .012, P3 - .01, 9]];
  bands.forEach(b => {
    const n = b[2];
    for (let i = 0; i < n; i++) {
      const t0 = b[0] + (b[1] - b[0]) * i / n, t1 = b[0] + (b[1] - b[0]) * (i + 1) / n;
      lat += `<path d="M ${X(t0, -1).toFixed(1)} ${Y(t0).toFixed(1)} L ${X(t1, 1).toFixed(1)} ${Y(t1).toFixed(1)}
        M ${X(t0, 1).toFixed(1)} ${Y(t0).toFixed(1)} L ${X(t1, -1).toFixed(1)} ${Y(t1).toFixed(1)}" stroke="${ART.lift(c, .3)}" stroke-width="${Math.max(h * .0042, .7)}" fill="none" opacity=".75"/>`;
    }
  });
  g += lat;
  g += deck(P1, .030, .020, ART.sink(c, .1)) + deck(P2, .022, .016, ART.sink(c, .1)) + deck(P3, .016, .014, ART.sink(c, .1));
  g += ART.box(cx - h * .015, Y(P3) - h * .026, h * .030, h * .026, h * .012, ART.lift(c, .1));
  g += `<path d="M ${cx - h * .006} ${Y(P3 + .026)} L ${cx + h * .006} ${Y(P3 + .026)} L ${cx} ${by - h} Z" fill="${F.side}"/>`;
  return g;
};

/* Empire State: a five-storey podium, an unbroken shaft to the 86th, the
   stepped art-deco crown, then the mooring mast. */
ART.artdeco = function (cx, by, h, c) {
  const F = ART.faces(c);
  let g = ART.cast(cx, by, h * .21, h * .045);
  g += stack(cx, by, h, c, [
    [0, .055, .146, .146], [.055, .105, .120, .120], [.105, .715, .082, .082],
    [.715, .782, .060, .060], [.782, .828, .043, .043], [.828, .860, .030, .030]
  ], { depth: .6, mull: 7 });
  const yM = by - h * .860;
  g += ART.prism(`M ${cx - h * .019} ${yM} L ${cx + h * .019} ${yM} L ${cx + h * .011} ${by - h * .952} L ${cx - h * .011} ${by - h * .952} Z`, h * .012, ART.lift(c, .08));
  g += `<path d="M ${cx - h * .004} ${by - h * .952} L ${cx + h * .004} ${by - h * .952} L ${cx} ${by - h} Z" fill="${F.side}"/>`;
  return g;
};

/* a generic modern tower, for anything with no portrait of its own */
ART.tower = function (cx, by, h, c, style) {
  if (style === 'burj') return ART.burj(cx, by, h, c);
  if (style === 'artdeco') return ART.artdeco(cx, by, h, c);
  const W = U.clamp(h * 0.115, 5, 44);
  let g = ART.cast(cx, by, W * 1.5, W * .32);
  g += stack(cx, by, h, c, [[0, .94, W / h, W / h]], { depth: .6, mull: 7, courses: .07 });
  g += `<rect x="${(cx - Math.max(W * .05, .8)).toFixed(1)}" y="${(by - h).toFixed(1)}" width="${Math.max(W * .1, 1.6).toFixed(1)}" height="${(h * .06).toFixed(1)}" fill="${ART.sink(c, .3)}"/>`;
  return g;
};

/* the Great Pyramid: half-base over height is 115.2 / 146.6, so the faces
   sit at the real 51.8°. */
ART.pyramid = function (cx, by, h, c) {
  const F = ART.faces(c), b = h * 0.786;
  const full = `M ${cx} ${by - h} L ${cx + b} ${by} L ${cx - b} ${by} Z`;
  let g = ART.cast(cx, by, b * 1.08, b * 0.15);
  g += `<path d="${full}" fill="${F.front}"/>`;
  g += `<path d="M ${cx} ${by - h} L ${cx + b} ${by} L ${cx} ${by} Z" fill="${F.side}"/>`;
  const n = U.clamp(Math.floor(h / 16), 0, 26);
  let lines = '';
  for (let i = 1; i < n; i++) {
    const t = i / n, y = by - h * t, w = b * (1 - t);
    lines += `<line x1="${(cx - w).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(cx + w).toFixed(1)}" y2="${y.toFixed(1)}" stroke="${ART.sink(c, .35)}" stroke-opacity=".18" stroke-width="1"/>`;
  }
  g += lines;
  /* the smooth casing that still caps the real thing */
  if (h > 60) g += `<path d="M ${cx} ${by - h} L ${cx + b * .13} ${by - h * .835} L ${cx - b * .13} ${by - h * .835} Z" fill="${ART.lift(c, .3)}"/>`;
  g += `<path d="${full}" fill="url(#ss-sheen)"/>`;
  return g;
};

/* Everest: three depth layers, so the summit sits behind its own foothills */
ART.mountain = function (cx, by, h, c) {
  const b = h * 0.86, F = ART.faces(c);
  const ridge = `M ${cx - b} ${by} L ${cx - b * .62} ${by - h * .40} L ${cx - b * .42} ${by - h * .34}
    L ${cx - b * .17} ${by - h * .78} L ${cx} ${by - h} L ${cx + b * .21} ${by - h * .72}
    L ${cx + b * .46} ${by - h * .38} L ${cx + b * .70} ${by - h * .45} L ${cx + b} ${by} Z`;
  const far = `M ${cx - b * 1.30} ${by} L ${cx - b * .78} ${by - h * .52} L ${cx - b * .40} ${by - h * .20} L ${cx - b * .18} ${by} Z`;
  const far2 = `M ${cx + b * .42} ${by} L ${cx + b * .86} ${by - h * .44} L ${cx + b * 1.28} ${by} Z`;
  let g = ART.cast(cx, by, b * 1.14, b * 0.12);
  g += `<path d="${far}" fill="${ART.haze(c, .70)}"/><path d="${far2}" fill="${ART.haze(c, .76)}"/>`;
  g += `<path d="${ridge}" fill="${F.front}"/>`;
  g += `<path d="M ${cx} ${by - h} L ${cx + b * .21} ${by - h * .72} L ${cx + b * .46} ${by - h * .38}
    L ${cx + b * .70} ${by - h * .45} L ${cx + b} ${by} L ${cx} ${by} Z" fill="${ART.sink(c, .26)}"/>`;
  /* the snowline sits about two thirds up and is not a straight cut */
  g += `<path d="M ${cx - b * .285} ${by - h * .585} L ${cx - b * .17} ${by - h * .78} L ${cx} ${by - h}
    L ${cx + b * .21} ${by - h * .72} L ${cx + b * .30} ${by - h * .555}
    L ${cx + b * .20} ${by - h * .615} L ${cx + b * .105} ${by - h * .545}
    L ${cx + b * .02} ${by - h * .655} L ${cx - b * .075} ${by - h * .575}
    L ${cx - b * .175} ${by - h * .645} Z" fill="${ART.T.name === 'dark' ? '#c9ced6' : '#fbfafa'}"/>`;
  /* two rock ribs running down the near face */
  if (h > 70) g += `<path d="M ${cx - b * .10} ${by - h * .88} L ${cx - b * .30} ${by - h * .30}
    M ${cx + b * .09} ${by - h * .84} L ${cx + b * .20} ${by - h * .26}" stroke="${ART.sink(c, .34)}" stroke-opacity=".35" stroke-width="${Math.max(h * .006, 1)}" fill="none"/>`;
  g += `<path d="${ridge}" fill="url(#ss-sheen)"/>`;
  return g;
};

/* the Statue of Liberty: pedestal is 47 of the 93 m, so it is half the thing */
ART.statue = function (cx, by, h, c) {
  const F = ART.faces(c), st = ART.lift(c, .16);
  let g = ART.cast(cx, by, h * .26, h * .055);
  g += stack(cx, by, h, c, [[0, .115, .175, .175], [.115, .140, .150, .150],
    [.140, .455, .108, .108], [.455, .500, .126, .126]], { depth: .5, courses: .16 });
  /* the robe */
  g += ART.prism(`M ${cx - h * .088} ${by - h * .500} L ${cx - h * .060} ${by - h * .700}
    C ${cx - h * .058} ${by - h * .760} ${cx - h * .046} ${by - h * .800} ${cx - h * .030} ${by - h * .818}
    L ${cx + h * .030} ${by - h * .818} C ${cx + h * .050} ${by - h * .798} ${cx + h * .058} ${by - h * .756}
    ${cx + h * .062} ${by - h * .700} L ${cx + h * .086} ${by - h * .500} Z`, h * .022, st);
  /* raised arm and torch, reaching the full height */
  g += `<path d="M ${cx + h * .040} ${by - h * .790} L ${cx + h * .072} ${by - h * .930}
    L ${cx + h * .100} ${by - h * .926} L ${cx + h * .074} ${by - h * .776} Z" fill="${ART.faces(st).front}"/>`;
  g += `<path d="M ${cx + h * .070} ${by - h * .930} L ${cx + h * .104} ${by - h * .930}
    L ${cx + h * .098} ${by - h * .962} L ${cx + h * .076} ${by - h * .962} Z" fill="${ART.faces(st).side}"/>`;
  g += `<path d="M ${cx + h * .074} ${by - h * .962} L ${cx + h * .100} ${by - h * .962}
    L ${cx + h * .087} ${by - h} Z" fill="#e8c76a"/>`;
  /* the tablet, held low on the other side */
  g += `<path d="M ${cx - h * .092} ${by - h * .700} L ${cx - h * .050} ${by - h * .742}
    L ${cx - h * .036} ${by - h * .690} L ${cx - h * .078} ${by - h * .648} Z" fill="${ART.sink(st, .18)}"/>`;
  /* head and the seven-point crown */
  g += `<circle cx="${cx}" cy="${(by - h * .855).toFixed(1)}" r="${(h * .032).toFixed(1)}" fill="${ART.faces(st).front}"/>`;
  if (h > 70) {
    let cr = '';
    for (let i = -3; i <= 3; i++) {
      const a = i * 0.36, r0 = h * .034, r1 = h * .060;
      cr += `<line x1="${(cx + Math.sin(a) * r0).toFixed(1)}" y1="${(by - h * .862 - Math.cos(a) * r0).toFixed(1)}"
        x2="${(cx + Math.sin(a) * r1).toFixed(1)}" y2="${(by - h * .862 - Math.cos(a) * r1).toFixed(1)}"
        stroke="${ART.faces(st).front}" stroke-width="${Math.max(h * .008, 1)}" stroke-linecap="round"/>`;
    }
    g += cr;
  }
  return g;
};

/* Elizabeth Tower: shaft, clock stage, belfry, spire */
ART.clocktower = function (cx, by, h, c) {
  const F = ART.faces(c);
  let g = ART.cast(cx, by, h * .13, h * .028);
  g += stack(cx, by, h, c, [
    [0, .075, .078, .078], [.075, .560, .062, .062], [.560, .580, .072, .072],
    [.580, .665, .068, .068], [.665, .690, .076, .076], [.690, .755, .062, .062]
  ], { depth: .55, courses: .10 });
  /* clock face */
  const cyy = by - h * .622, r = h * .046;
  g += `<circle cx="${cx.toFixed(1)}" cy="${cyy.toFixed(1)}" r="${r.toFixed(1)}" fill="${ART.T.name === 'dark' ? '#cdd2d9' : '#f6f3ec'}"/>`;
  g += `<circle cx="${cx.toFixed(1)}" cy="${cyy.toFixed(1)}" r="${r.toFixed(1)}" fill="url(#ss-sheen)"/>`;
  if (r > 7) g += `<path d="M ${cx} ${cyy} v ${-r * .62} M ${cx} ${cyy} l ${r * .44} ${r * .3}" stroke="${ART.T.ink}" stroke-opacity=".6" stroke-width="${Math.max(r * .1, 1)}" fill="none" stroke-linecap="round"/>`;
  /* belfry louvres */
  if (h > 90) for (let i = 0; i < 3; i++)
    g += `<rect x="${(cx - h * .046 + i * h * .038).toFixed(1)}" y="${(by - h * .742).toFixed(1)}" width="${(h * .022).toFixed(1)}" height="${(h * .062).toFixed(1)}" rx="${(h * .011).toFixed(1)}" fill="${ART.sink(c, .38)}"/>`;
  /* spire */
  g += ART.prism(`M ${cx - h * .062} ${by - h * .755} L ${cx + h * .062} ${by - h * .755} L ${cx} ${by - h * .965} Z`, h * .028, ART.sink(c, .1));
  g += `<path d="M ${cx - h * .008} ${by - h * .955} L ${cx + h * .008} ${by - h * .955} L ${cx} ${by - h} Z" fill="${ART.lift(c, .35)}"/>`;
  return g;
};

/* an ordinary two-storey house */
ART.house = function (cx, by, h, c) {
  const w = h * 0.90, d = Math.min(w * 0.30, h * 0.26);
  let g = ART.cast(cx, by, w * 0.70, w * 0.11);
  g += ART.box(cx - w * .46, by - h * .56, w * .92, h * .56, d, c);
  /* chimney, sitting on the near slope so the roof crosses it */
  g += ART.box(cx - w * .30, by - h * .88, w * .10, h * .20, d * .35, ART.sink(c, .38));
  /* eaves, then the gable */
  g += ART.box(cx - w * .54, by - h * .60, w * 1.08, h * .045, d * .45, ART.sink(c, .30));
  g += ART.prism(`M ${cx - w * .515} ${by - h * .595} L ${cx} ${by - h} L ${cx + w * .515} ${by - h * .595} Z`, d * .55, ART.sink(c, .16));
  if (w > 22) {
    g += `<rect x="${(cx - w * .09).toFixed(1)}" y="${(by - h * .30).toFixed(1)}" width="${(w * .18).toFixed(1)}" height="${(h * .30).toFixed(1)}" rx="${(w * .012).toFixed(1)}" fill="${ART.sink(c, .48)}"/>`;
    g += `<rect x="${(cx - w * .38).toFixed(1)}" y="${(by - h * .45).toFixed(1)}" width="${(w * .16).toFixed(1)}" height="${(h * .15).toFixed(1)}" fill="${ART.lift(c, .64)}"/>`;
    g += `<rect x="${(cx + w * .22).toFixed(1)}" y="${(by - h * .45).toFixed(1)}" width="${(w * .16).toFixed(1)}" height="${(h * .15).toFixed(1)}" fill="${ART.lift(c, .64)}"/>`;
  }
  return g;
};

/* a redwood: a tall narrow conifer, not a lollipop */
ART.tree = function (cx, by, h, c) {
  const F = ART.faces(c), tw = h * .050;
  let g = ART.cast(cx, by, h * .17, h * .034);
  g += `<path d="M ${cx - tw * .85} ${by} L ${cx - tw * .30} ${by - h * .70} L ${cx + tw * .30} ${by - h * .70} L ${cx + tw * .85} ${by} Z" fill="${ART.sink(c, .58)}"/>`;
  const N = 9, LO = .17, HI = .94;
  const crown = (col, off) => {
    let o = '';
    for (let i = 0; i < N; i++) {
      const t0 = LO + (HI - LO) * i / N, t1 = t0 + (HI - LO) / N * 1.7;
      const w = h * (.180 - .168 * Math.pow(i / N, .85));
      o += `<path d="M ${cx - w + off} ${by - h * t0} Q ${cx + off} ${by - h * (t0 + .015)} ${cx + w + off} ${by - h * t0}
        Q ${cx + off} ${by - h * t1} ${cx - w + off} ${by - h * t0} Z" fill="${col}"/>`;
    }
    o += `<path d="M ${cx - h * .016 + off} ${by - h * .935} L ${cx + off} ${by - h} L ${cx + h * .016 + off} ${by - h * .935} Z" fill="${col}"/>`;
    return o;
  };
  g += crown(F.side, h * .014) + crown(F.front, 0);
  return g;
};

/* an ordinary round tree, for when the scene wants greenery rather than a
   hundred-metre redwood */
ART.shrub = function (cx, by, h, c) {
  const F = ART.faces(c), tw = Math.max(h * .095, 1.5);
  const puff = (x, y, r, col) => `<circle cx="${(cx + x).toFixed(1)}" cy="${(by - y).toFixed(1)}" r="${Math.max(r, .8).toFixed(1)}" fill="${col}"/>`;
  const crown = col => puff(-h * .155, h * .50, h * .185, col) + puff(h * .155, h * .52, h * .175, col) + puff(0, h * .70, h * .255, col);
  let g = ART.cast(cx, by, h * .30, h * .055);
  g += `<rect x="${(cx - tw / 2).toFixed(1)}" y="${(by - h * .44).toFixed(1)}" width="${tw.toFixed(1)}" height="${(h * .44).toFixed(1)}" fill="${ART.sink(c, .55)}"/>`;
  g += `<g transform="translate(${(h * .026).toFixed(2)},${(-h * .013).toFixed(2)})">${crown(F.side)}</g>` + crown(F.front);
  return g;
};

ART.giraffe = function (cx, by, h, c) {
  const F = ART.faces(c);
  const leg = (x0, x1, w, col) => `<line x1="${cx + x0 * h}" y1="${by - h * .36}" x2="${cx + x1 * h}" y2="${by - h * .015}" stroke="${col}" stroke-width="${w * h}" stroke-linecap="round"/>`;
  let g = ART.cast(cx, by, h * .26, h * .04);
  g += leg(-.135, -.162, .038, F.side) + leg(.105, .128, .038, F.side);
  g += leg(-.175, -.202, .042, F.front) + leg(.145, .172, .042, F.front);
  /* barrel: short and deep, sloping down toward the hindquarters */
  g += ART.prism(`M ${cx - h * .215} ${by - h * .385} q ${-h * .015} ${-h * .105} ${h * .080} ${-h * .120}
    l ${h * .240} ${-h * .022} q ${h * .085} ${-h * .008} ${h * .085} ${h * .070}
    q 0 ${h * .085} ${-h * .080} ${h * .090} l ${-h * .240} ${h * .010}
    q ${-h * .075} ${h * .004} ${-h * .085} ${-h * .032} z`, h * .022, c);
  /* neck, rising forward at about 60° */
  g += `<line x1="${cx + h * .120}" y1="${by - h * .500}" x2="${cx + h * .225}" y2="${by - h * .880}" stroke="${F.front}" stroke-width="${h * .068}" stroke-linecap="round"/>`;
  g += `<line x1="${cx + h * .118}" y1="${by - h * .520}" x2="${cx + h * .218}" y2="${by - h * .880}" stroke="${ART.sink(c, .16)}" stroke-width="${h * .020}" stroke-linecap="round" opacity=".5"/>`;
  /* head: a wedge with a muzzle, ossicones on top */
  g += `<path d="M ${cx + h * .200} ${by - h * .900} q ${h * .020} ${-h * .048} ${h * .085} ${-h * .034}
    l ${h * .080} ${h * .020} q ${h * .026} ${h * .026} ${-h * .018} ${h * .042}
    l ${-h * .120} ${h * .020} z" fill="${F.front}"/>`;
  g += `<path d="M ${cx + h * .218} ${by - h * .935} l ${-h * .010} ${-h * .044}
    M ${cx + h * .258} ${by - h * .941} l ${h * .006} ${-h * .044}" stroke="${F.side}" stroke-width="${h * .016}" stroke-linecap="round" fill="none"/>`;
  g += `<circle cx="${cx + h * .224}" cy="${by - h * .988}" r="${h * .015}" fill="${F.side}"/>`;
  g += `<circle cx="${cx + h * .266}" cy="${by - h * .992}" r="${h * .015}" fill="${F.side}"/>`;
  /* tail */
  g += `<path d="M ${cx - h * .205} ${by - h * .455} q ${-h * .048} ${h * .050} ${-h * .030} ${h * .155}" stroke="${ART.sink(c, .2)}" stroke-width="${h * .013}" fill="none" stroke-linecap="round"/>`;
  if (h > 48) {
    let sp = '';
    [[-.16, .44], [-.08, .49], [.00, .43], [.06, .49], [-.13, .53], [-.03, .55], [.14, .58], [.17, .68], [.20, .78]]
      .forEach(pt => { sp += `<ellipse cx="${(cx + h * pt[0]).toFixed(1)}" cy="${(by - h * pt[1]).toFixed(1)}" rx="${(h * .024).toFixed(1)}" ry="${(h * .019).toFixed(1)}" fill="${ART.sink(c, .34)}" opacity=".5"/>`; });
    g += sp;
  }
  return g;
};

ART.rocket = function (cx, by, h, c) {
  const w = U.clamp(h * 0.13, 6, 40), F = ART.faces(c);
  let g = ART.cast(cx, by, w * 1.2, w * 0.24);
  g += `<path d="M ${cx - w / 2} ${by - h * .20} q ${-w * .30} ${h * .08} ${-w * .34} ${h * .20} l ${w * .34} 0 z" fill="${F.side}"/>`;
  g += `<path d="M ${cx + w / 2} ${by - h * .20} q ${w * .30} ${h * .08} ${w * .34} ${h * .20} l ${-w * .34} 0 z" fill="${F.side}"/>`;
  g += ART.box(cx - w / 2, by - h * .70, w, h * .70, w * .38, c, w * .08);
  g += ART.prism(`M ${cx - w / 2} ${by - h * .685} q ${w / 2} ${-h * .33} ${w} 0 z`, w * .3, ART.lift(c, .2));
  g += `<circle cx="${cx}" cy="${(by - h * .50).toFixed(1)}" r="${(w * .16).toFixed(1)}" fill="${ART.lift(c, .65)}"/>`;
  g += `<rect x="${(cx - w / 2).toFixed(1)}" y="${(by - h * .30).toFixed(1)}" width="${w.toFixed(1)}" height="${(h * .035).toFixed(1)}" fill="${ART.sink(c, .3)}"/>`;
  return g;
};

/* a measured column — the fallback for "just a number" */
ART.bar = function (cx, by, h, c) {
  const w = U.clamp(h * 0.115, 8, 58), d = Math.min(w * 0.4, h * 0.3);
  let g = ART.cast(cx, by, w * 0.9);
  g += ART.box(cx - w / 2, by - h, w, h, d, c, Math.min(w * 0.1, 3));
  const n = U.clamp(Math.floor(h / 44), 0, 18);
  for (let i = 1; i < n; i++) {
    const y = (by - h * i / n).toFixed(1);
    g += `<line x1="${(cx - w / 2).toFixed(1)}" y1="${y}" x2="${(cx - w / 2 + w * 0.34).toFixed(1)}" y2="${y}" stroke="#fff" stroke-opacity=".3" stroke-width="1"/>`;
  }
  return g;
};

/* a car, side on — shared by the distance and speed scenes */
ART.car = function (cx, cy, w, c) {
  const F = ART.faces(c), s = w, r = s * 0.105;
  const body = `M ${cx - s * .50} ${cy - s * .13} L ${cx - s * .50} ${cy - s * .28}
    Q ${cx - s * .50} ${cy - s * .35} ${cx - s * .41} ${cy - s * .36}
    L ${cx - s * .27} ${cy - s * .38} L ${cx - s * .17} ${cy - s * .52}
    Q ${cx - s * .13} ${cy - s * .57} ${cx - s * .05} ${cy - s * .57}
    L ${cx + s * .13} ${cy - s * .57} Q ${cx + s * .20} ${cy - s * .57} ${cx + s * .24} ${cy - s * .52}
    L ${cx + s * .34} ${cy - s * .38} L ${cx + s * .45} ${cy - s * .35}
    Q ${cx + s * .50} ${cy - s * .33} ${cx + s * .50} ${cy - s * .26}
    L ${cx + s * .50} ${cy - s * .13} Z`;
  const glass = `M ${cx - s * .13} ${cy - s * .40} L ${cx - s * .05} ${cy - s * .52}
    L ${cx + s * .12} ${cy - s * .52} L ${cx + s * .21} ${cy - s * .40} Z`;
  const wheel = x => `<circle cx="${x}" cy="${cy - r}" r="${r}" fill="${ART.sink(c, .62)}"/>`
    + `<circle cx="${x}" cy="${cy - r}" r="${r * 0.42}" fill="${ART.lift(c, .55)}" fill-opacity=".7"/>`;
  return ART.cast(cx, cy, s * 0.52, s * 0.09)
    + wheel(cx - s * 0.27) + wheel(cx + s * 0.28)
    + `<path d="${body}" fill="${F.front}"/><path d="${body}" fill="url(#ss-sheen)"/>`
    + `<path d="${glass}" fill="${ART.lift(c, .62)}" fill-opacity=".85"/>`
    + `<path d="M ${cx - s * .50} ${cy - s * .20} L ${cx + s * .50} ${cy - s * .20} L ${cx + s * .50} ${cy - s * .13} L ${cx - s * .50} ${cy - s * .13} Z" fill="${F.side}" fill-opacity=".55"/>`;
};

/* ---------------- isometric block, used by money / weight / volume ---------------- */
const ISO_K = 0.8660254;
ART.isoSize = (W, D, H, s) => ({ w: (W + D) * ISO_K * s, h: (W + D) * 0.5 * s + H * s });

ART.iso = function (x0, y0, W, D, H, s, col, div) {
  const p = (w, d, h) => [x0 + (w - d) * ISO_K * s, y0 - (w + d) * 0.5 * s - h * s];
  const poly = (pts, fill) =>
    `<polygon points="${pts.map(a => a[0].toFixed(2) + ',' + a[1].toFixed(2)).join(' ')}" fill="${fill}"/>`;
  const line = (A, B, c, o, w) => `<line x1="${A[0].toFixed(2)}" y1="${A[1].toFixed(2)}" x2="${B[0].toFixed(2)}" y2="${B[1].toFixed(2)}" stroke="${c}" stroke-opacity="${o}" stroke-width="${w || 0.7}"/>`;
  const size = ART.isoSize(W, D, H, s);
  const big = size.w > 16;
  const right = [p(0, 0, 0), p(W, 0, 0), p(W, 0, H), p(0, 0, H)];
  const left = [p(0, 0, 0), p(0, D, 0), p(0, D, H), p(0, 0, H)];
  const top = [p(0, 0, H), p(W, 0, H), p(W, D, H), p(0, D, H)];
  let g = poly(right, col.right) + poly(left, col.left) + poly(top, col.top);
  if (div && big) {
    const grid = (n, span, fn) => {
      const stepPx = span * s / n;
      if (stepPx < 3.2 || n < 2) return '';
      const every = Math.ceil(n / 26);
      let o = '';
      for (let i = every; i < n; i += every) o += fn(i / n);
      return o;
    };
    g += grid(div.nx, W, t => line(p(W * t, 0, 0), p(W * t, 0, H), '#fff', .16));
    g += grid(div.ny, H, t => line(p(0, 0, H * t), p(W, 0, H * t), '#fff', .16) + line(p(0, 0, H * t), p(0, D, H * t), '#000', .10));
    g += grid(div.nz, D, t => line(p(0, D * t, 0), p(0, D * t, H), '#000', .10));
    g += grid(div.nx, W, t => line(p(W * t, 0, H), p(W * t, D, H), '#000', .09));
    g += grid(div.nz, D, t => line(p(0, D * t, H), p(W, D * t, H), '#000', .09));
  }
  if (big) {
    g += line(p(0, 0, H), p(W, 0, H), '#fff', .35, U.clamp(s * .05, .6, 1.6));
    g += line(p(0, 0, H), p(0, D, H), '#fff', .22, U.clamp(s * .05, .6, 1.6));
    g += line(p(0, 0, 0), p(0, 0, H), '#fff', .18, U.clamp(s * .04, .5, 1.2));
  }
  return `<g>${g}</g>`;
};

ART.draw = function (name, cx, by, h, c, style) {
  const f = ART[name];
  return f ? f(cx, by, h, c, style) : ART.bar(cx, by, h, c);
};
