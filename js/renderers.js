/* ScaleSee — the picture-drawing department.
   Every renderer gets {cat, A, B, mode} where A/B = {base, label, color}
   and returns {svg, note}. Canvas is a fixed 1000×560 viewBox that CSS scales. */
const VW = 1000, VH = 560;
const UI = "'Inter Tight',ui-sans-serif,system-ui,-apple-system,sans-serif";
const MONO = "'DM Mono',ui-monospace,SFMono-Regular,Menlo,monospace";
const T = () => ART.T;   /* the palette for whatever theme is live */
const Renderers = {};

function wrap(inner, defs) {
  return `<svg viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" font-family="${UI}">`
    + ART.DEFS() + (defs || '') + inner + `</svg>`;
}
function tx(x, y, s, o) {
  o = o || {};
  return `<text x="${x}" y="${y}" text-anchor="${o.anchor || 'middle'}" font-size="${o.size || 14}"`
    + ` font-weight="${o.weight || 450}" fill="${o.fill || T().text}"`
    + (o.mono ? ` font-family="${MONO}"` : '')
    + (o.ls ? ` letter-spacing="${o.ls}"` : '')
    + (o.op ? ` opacity="${o.op}"` : '') + `>${U.esc(s)}</text>`;
}
/* the small all-caps label that names a part of the drawing */
function caption(x, y, s, o) {
  o = o || {};
  return tx(x, y, o.keep ? String(s) : String(s).toUpperCase(), Object.assign({ size: 10.5, weight: 500, fill: o.fill || T().faint, ls: o.keep ? '.02em' : '.10em', mono: true }, o));
}
function pill(x, y, txt, col, anchor, fs) {
  fs = fs || 15;
  const w = String(txt).length * fs * 0.60 + 24, h = fs * 1.85;
  const bx = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
  return `<g><rect x="${bx.toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${(h / 2).toFixed(1)}" fill="${col}"/>`
    + `<rect x="${bx.toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${(h / 2).toFixed(1)}" fill="url(#ss-sheen)"/>`
    + tx(bx + w / 2, y + fs * 0.34, txt, { size: fs, weight: 500, fill: T().onAccent, mono: true }) + `</g>`;
}
function hair(x1, y, x2, o) {
  return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${T().text}" stroke-opacity="${o || .1}" stroke-width="1"/>`;
}
function tiny(px) { return px < 7; }
/* a round number to step an axis by, so labels read 200 m and not 183.7 m */
function niceStep(range, want) {
  const raw = range / (want || 5);
  if (!(raw > 0) || !isFinite(raw)) return 0;
  const mag = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / mag;
  return (n >= 5 ? 5 : n >= 2.5 ? 2.5 : n >= 2 ? 2 : 1) * mag;
}
/* the name plate that sits under a drawn object, so you know what you are looking at */
function plate(x, y, name, sub, col, dim) {
  return tx(x, y, name, { size: dim ? 12.5 : 14, weight: dim ? 400 : 500, fill: col || T().text })
    + (sub ? tx(x, y + 17, sub, { size: 11.5, fill: dim ? '#b0b6bf' : T().dim, mono: true }) : '');
}

/* pick refs that land in a drawable range, evenly spread */
function pickRefs(refs, f, minPx, maxPx, n, skip) {
  const ok = refs.filter(r => {
    const p = f(r.v);
    return p >= minPx && p <= maxPx && !(skip || []).some(s => Math.abs(p - s) < 14);
  });
  if (ok.length <= n) return ok;
  const out = [];
  for (let i = 0; i < n; i++) out.push(ok[Math.round(i * (ok.length - 1) / (n - 1))]);
  return out.filter((r, i, a) => a.indexOf(r) === i);
}
/* The closest reference within a factor of `tol`. One resolver feeds two
   things: which model gets drawn, and what the thing is called. A figure of
   5.9 ft is not called "5.9 ft" — it is about a person, and it should be
   drawn as one, at 5.9 ft. */
function nearRef(cat, base, tol) {
  if (!(base > 0)) return null;
  let best = null, bd = Infinity;
  for (const r of cat.refs) {
    if (!(r.v > 0)) continue;
    const d = Math.abs(Math.log10(base / r.v));
    if (d < bd) { bd = d; best = r; }
  }
  if (!best || bd > Math.log10(tol || 1.35)) return null;
  return { ref: best, exact: bd < 0.0026, name: bd < 0.0026 ? best.n : 'about ' + best.n };
}
function whatIs(cat, base, tol) {
  const n = nearRef(cat, base, tol);
  return n ? n.name : '';
}

/* ============================ HEIGHT ============================ */
Renderers.height = function (c) {
  const gy = 452, top = 74, avail = gy - top;
  const f = U.scaler(c.A.base, c.B.base, c.mode, avail, 2);
  const hA = f(c.A.base), hB = f(c.B.base), xA = 330, xB = 590;
  const nA = nearRef(c.cat, c.A.base), nB = nearRef(c.cat, c.B.base);
  const rA = nA && nA.ref, rB = nB && nB.ref;
  const hi = Math.max(c.A.base, c.B.base);

  let out = ART.scene(gy, VW, VH);

  /* a measured axis — only honest in true scale, so only drawn there */
  let axis = '';
  if (c.mode === 'true' && hi > 0) {
    const step = niceStep(hi, 5);
    for (let v = step; step > 0 && v <= hi * 1.001; v += step) {
      const y = gy - v * avail / hi;
      if (y < top - 12) break;
      axis += `<line x1="78" y1="${y.toFixed(1)}" x2="${VW - 18}" y2="${y.toFixed(1)}" stroke="${T().text}" stroke-opacity=".06" stroke-width="1"/>`
        + tx(70, y + 4, U.fmtLen(v), { anchor: 'end', size: 11, fill: T().axis, mono: true });
    }
    axis += `<line x1="78" y1="${top - 14}" x2="78" y2="${gy}" stroke="${T().text}" stroke-opacity=".10" stroke-width="1"/>`;
  }
  out += axis;

  /* landmarks that fit on the canvas: a rule, a name, and for two of them a
     hazy stand-in in the far background */
  const near = c.cat.refs.filter(r => {
    const p = f(r.v);
    return p >= 26 && p <= avail * 1.01 && Math.abs(p - hA) > 12 && Math.abs(p - hB) > 12;
  }).sort((x, y) => y.v - x.v);

  let rules = '', lastY = 1e9;
  const shown = [];
  near.forEach(r => {
    const y = gy - f(r.v);
    if (Math.abs(y - lastY) < 26) return;
    lastY = y;
    shown.push(r);
    rules += `<line x1="92" y1="${y.toFixed(1)}" x2="${VW - 20}" y2="${y.toFixed(1)}" stroke="${T().text}" stroke-width="1" stroke-dasharray="2 6" opacity=".26"/>`
      + tx(96, y - 7, r.n, { anchor: 'start', size: 12, fill: T().dim })
      + tx(96, y + 13, U.fmtLen(r.v), { anchor: 'start', size: 10.5, fill: T().axis, mono: true });
  });

  let ghosts = '';
  const slots = [786, 918];
  /* no point standing a grey person behind two people */
  const drawn = [rA && rA.art, rB && rB.art].filter(Boolean);
  const cast = shown.filter(r => r.art && drawn.indexOf(r.art) < 0 && f(r.v) < avail * 0.94).slice(0, 2);
  cast.forEach((r, i) => {
    const h = f(r.v);
    ghosts += `<g opacity=".9">${ART.draw(r.art, slots[i], gy, h, T().ghostArt)}</g>`
      + plate(slots[i], gy + 30, r.n, U.fmtLen(r.v), T().ghost, true);
  });

  const hHuman = f(1.7);
  let people = '';
  if (hHuman > 5 && !(rA && rA.art === 'human') && !(rB && rB.art === 'human')) {
    people = ART.human(xA - 92, gy, hHuman) + ART.human(xB - 92, gy, hHuman);
  }

  const drawSide = (x, h, n, side) => {
    const ref = n && n.ref;
    const art = ref && ref.art ? ref.art : 'bar';
    const shape = ART.draw(art, x, gy, h, side.color, art);
    const ly = U.clamp(gy - h - 26, 22, gy - 22);
    let leader = '';
    if (h < 30) leader = `<line x1="${x}" y1="${gy - h}" x2="${x}" y2="${ly + 13}" stroke="${side.color}" stroke-width="1" stroke-dasharray="2 3" opacity=".7"/>`;
    const nm = n ? n.name : side.label, sub = U.fmtLen(side.base);
    return shape + leader + pill(x, ly, side.label, side.color)
      + plate(x, gy + 30, nm, nm === sub ? '' : sub, side.color);
  };

  /* the comparison itself: a bracket up the side of the taller one, from the
     shorter one's height to its own */
  let bracket = '';
  const tall = hA >= hB ? { x: xA, h: hA, s: c.A } : { x: xB, h: hB, s: c.B };
  const shortH = Math.min(hA, hB);
  if (c.mode === 'true' && tall.h - shortH > 60 && shortH >= 0) {
    const bx = tall.x + 74, y0 = gy - shortH, y1 = gy - tall.h;
    const r = Math.max(c.A.base, c.B.base) / Math.max(Math.min(c.A.base, c.B.base), 1e-12);
    bracket = `<line x1="${bx}" y1="${y0.toFixed(1)}" x2="${bx}" y2="${y1.toFixed(1)}" stroke="${T().text}" stroke-opacity=".3" stroke-width="1"/>`
      + `<line x1="${bx - 5}" y1="${y0.toFixed(1)}" x2="${bx + 5}" y2="${y0.toFixed(1)}" stroke="${T().text}" stroke-opacity=".3" stroke-width="1"/>`
      + `<line x1="${bx - 5}" y1="${y1.toFixed(1)}" x2="${bx + 5}" y2="${y1.toFixed(1)}" stroke="${T().text}" stroke-opacity=".3" stroke-width="1"/>`
      + pill(bx + 6, (y0 + y1) / 2, U.fmtRatio(r), T().dim, 'start', 13);
  }

  const svg = wrap(ART.scene(gy, VW, VH) + axis + ghosts + rules + people + bracket +
    drawSide(xA, hA, nA, c.A) + drawSide(xB, hB, nB, c.B));
  let note = '';
  if (c.mode === 'true' && tiny(Math.min(hA, hB))) note = 'at true scale the smaller one is only a couple of pixels tall — that is the point, but log scale will show you where it is';
  else if (c.mode === 'log') note = 'log scale: the gap is squashed so both fit, so the ruler on the left sits this one out';
  return { svg, note };
};

/* ============================ DISTANCE ============================ */
function road(x0, y, len, h) {
  const r = h / 2;
  let g = `<rect x="${x0}" y="${(y + h * .82).toFixed(1)}" width="${len.toFixed(1)}" height="${(h * .3).toFixed(1)}" rx="${(h * .15).toFixed(1)}" fill="${T().kerb}" opacity=".55"/>`;
  g += `<rect x="${x0}" y="${y}" width="${len.toFixed(1)}" height="${h}" rx="${r}" fill="${T().road}"/>`;
  g += `<rect x="${x0}" y="${y}" width="${len.toFixed(1)}" height="${h}" rx="${r}" fill="url(#ss-sheen)" opacity=".5"/>`;
  if (len > 70) g += `<line x1="${x0 + 14}" y1="${y + h / 2}" x2="${x0 + len - 14}" y2="${y + h / 2}" stroke="${T().roadLine}" stroke-width="2.5" stroke-dasharray="15 14" stroke-linecap="round" opacity=".55"/>`;
  return g;
}
function marker(x, y, col) {
  return `<g><line x1="${x}" y1="${y}" x2="${x}" y2="${y - 40}" stroke="${ART.sink(col, .35)}" stroke-width="2.5" stroke-linecap="round"/>`
    + `<path d="M ${x + 1.5} ${y - 40} l 24 5 l -24 5 z" fill="${col}"/></g>`;
}
Renderers.distance = function (c) {
  const x0 = 70, maxLen = 840, laneY = [196, 384], rh = 38;
  const f = U.scaler(c.A.base, c.B.base, c.mode, maxLen, 4);
  let out = ART.flat(VW, VH) + `<rect y="0" width="${VW}" height="${VH}" fill="url(#ss-horizon)" opacity=".5"/>`;
  const pxPerSec = maxLen / 7;

  [c.A, c.B].forEach((s, i) => {
    const y = laneY[i], len = f(s.base);
    const dur = U.clamp(len / pxPerSec, 0.35, 30);
    out += road(x0, y, len, rh);
    out += `<circle cx="${x0}" cy="${y + rh / 2}" r="7" fill="${s.color}"/>`;
    out += marker(x0 + len, y + rh / 2 + 4, s.color);
    out += `<g>${U.motion() ? `<animateTransform attributeName="transform" type="translate" values="0 0;${len.toFixed(1)} 0" dur="${dur}s" repeatCount="indefinite"/>` : ''}`
      + ART.car(x0, y + rh - 4, 44, s.color) + `</g>`;
    out += pill(x0, y - 28, s.label, s.color, 'start')
      + caption(x0, y - 50, whatIs(c.cat, s.base), { anchor: 'start', fill: T().dim });
    out += tx(Math.min(x0 + len + 46, VW - 14), y + rh + 26, U.fmtLen(s.base), { anchor: 'end', size: 13, fill: T().dim, mono: true });
  });

  const longer = c.A.base >= c.B.base ? c.A : c.B, ly = c.A.base >= c.B.base ? laneY[0] : laneY[1];
  pickRefs(c.cat.refs, f, 60, f(longer.base) - 30, 3, []).forEach(r => {
    const x = x0 + f(r.v);
    out += `<line x1="${x.toFixed(1)}" y1="${ly - 10}" x2="${x.toFixed(1)}" y2="${ly + rh + 12}" stroke="${T().text}" stroke-width="1" stroke-dasharray="2 5" opacity=".3"/>`
      + caption(x, ly + rh + 28, r.n, { fill: T().faint });
  });
  out += caption(VW / 2, VH - 18, 'both cars move at the same real-world speed', { fill: T().faint });
  return { svg: wrap(out), note: c.mode === 'true' && tiny(f(Math.min(c.A.base, c.B.base))) ? 'the shorter road is a few pixels long — that is the honest answer, but log scale is easier on the eyes' : '' };
};

/* ============================ LAND ============================ */
Renderers.land = function (c) {
  const K = 0.8660254;
  const dA = Math.sqrt(c.A.base), dB = Math.sqrt(c.B.base);
  const avail = 262;
  const f = U.scaler(dA, dB, c.mode, avail, 2.5);
  const sA = f(dA), sB = f(dB);
  const bigIsA = c.A.base >= c.B.base;
  const big = bigIsA ? { s: sA, col: c.A.color, side: c.A } : { s: sB, col: c.B.color, side: c.B };
  const small = bigIsA ? { s: sB, col: c.B.color, side: c.B } : { s: sA, col: c.A.color, side: c.A };
  const fits = big.side.base / small.side.base;
  const S = big.s, ox = 252, oy = 306 - S / 2, thick = 13;

  const toPlot = (x, y) => [ox + (x - y) * K, oy + (x + y) * 0.5];
  const V = { far: toPlot(0, 0), left: toPlot(0, S), right: toPlot(S, 0), near: toPlot(S, S) };
  const pt = a => a[0].toFixed(1) + ',' + a[1].toFixed(1);

  let out = ART.flat(VW, VH);
  /* the slab of earth under the plot */
  out += `<ellipse cx="${ox}" cy="${(V.near[1] + 8).toFixed(1)}" rx="${(S * K * 1.05).toFixed(1)}" ry="${(S * .34).toFixed(1)}" fill="url(#ss-blob)"/>`;
  out += `<polygon points="${pt(V.left)} ${pt(V.near)} ${pt([V.near[0], V.near[1] + thick])} ${pt([V.left[0], V.left[1] + thick])}" fill="${T().soilA}"/>`;
  out += `<polygon points="${pt(V.near)} ${pt(V.right)} ${pt([V.right[0], V.right[1] + thick])} ${pt([V.near[0], V.near[1] + thick])}" fill="${T().soilB}"/>`;

  const g = [];
  g.push(`<rect width="${S.toFixed(1)}" height="${S.toFixed(1)}" fill="${T().grass}"/>`);
  g.push(`<rect width="${S.toFixed(1)}" height="${S.toFixed(1)}" fill="url(#ss-sheen)"/>`);
  /* tiling: how many of the small plot fit across the big one */
  if (big.s / Math.max(small.s, .001) < 260 && small.s > 1.6) {
    const step = small.s, n = Math.ceil(big.s / step);
    if (step > 3.5 && n <= 200) {
      let grid = '';
      for (let i = 1; i < n; i++) {
        grid += `<line x1="${(i * step).toFixed(1)}" y1="0" x2="${(i * step).toFixed(1)}" y2="${S.toFixed(1)}" stroke="#fff" stroke-width="1" opacity=".45"/>`;
        grid += `<line x1="0" y1="${(i * step).toFixed(1)}" x2="${S.toFixed(1)}" y2="${(i * step).toFixed(1)}" stroke="#fff" stroke-width="1" opacity=".45"/>`;
      }
      g.push(grid);
    }
  }
  const ss = Math.max(small.s, 2.5);
  g.push(`<rect x="${(S - ss).toFixed(1)}" y="${(S - ss).toFixed(1)}" width="${ss.toFixed(1)}" height="${ss.toFixed(1)}" fill="${small.col}" fill-opacity=".92"/>`);
  g.push(`<rect width="${S.toFixed(1)}" height="${S.toFixed(1)}" fill="none" stroke="${big.col}" stroke-width="2.5"/>`);
  out += `<g transform="translate(${ox},${oy}) matrix(${K},0.5,${-K},0.5,0,0)">${g.join('')}</g>`;

  /* a house at the near corner, for scale */
  const pxPerM = S / Math.sqrt(big.side.base);
  const hh = 9.5 * pxPerM;
  if (hh > 14 && hh < S * 0.45) {
    const spot = toPlot(S * 0.78, S * 0.62);
    out += ART.house(spot[0], spot[1], hh * .8, T().house);
    const sp2 = toPlot(S * 0.55, S * 0.86);
    out += ART.shrub(sp2[0], sp2[1], hh * .74, T().tree);
    out += caption(spot[0], spot[1] + 20, 'a house, for scale', { fill: T().scaleNote });
  }
  if (small.s < 9) {
    out += `<line x1="${(V.near[0] - 4).toFixed(1)}" y1="${(V.near[1] - 4).toFixed(1)}" x2="${(V.near[0] - 48).toFixed(1)}" y2="${(V.near[1] + 34).toFixed(1)}" stroke="${small.col}" stroke-width="1.5"/>`
      + tx(V.near[0] - 52, V.near[1] + 46, 'it is right there', { anchor: 'end', size: 12.5, fill: T().dim });
  }

  /* the reading, set as type */
  const cx = 736;
  out += caption(cx, 108, big.side.base >= small.side.base ? 'the bigger plot' : 'the plot', { fill: T().faint });
  out += pill(cx, 138, big.side.label, big.col);
  out += tx(cx, 178, 'holds', { size: 14, fill: T().dim });
  out += tx(cx, 238, U.fmt(fits), { size: 52, weight: 500, fill: T().text, mono: true });
  out += tx(cx, 266, 'of', { size: 14, fill: T().dim });
  out += pill(cx, 296, small.side.label, small.col);
  out += hair(cx - 160, 330, cx + 160, .12);
  const rows = [
    ['football pitches', big.side.base / 7140],
    ['tennis courts', big.side.base / 260.9],
    ['parking spaces', big.side.base / 12.5]
  ];
  rows.forEach((r, i) => {
    const y = 362 + i * 34;
    out += tx(cx - 160, y, r[0], { anchor: 'start', size: 14.5, fill: T().dim });
    out += tx(cx + 160, y, U.fmt(r[1]), { anchor: 'end', size: 14.5, fill: T().text, mono: true });
    if (i < 2) out += hair(cx - 160, y + 12, cx + 160, .07);
  });
  out += tx(cx, 486, U.fmtArea(big.side.base) + '   vs   ' + U.fmtArea(small.side.base), { size: 12.5, fill: T().faint, mono: true });
  return { svg: wrap(out), note: 'plots are drawn as squares of equal area, laid flat on the ground' };
};

/* ============================ MONEY ============================ */
const CASH_TIERS = [
  { n: '$100 bills', v: 100, w: 0.156, d: 0.0663, h: 0.000109 },
  { n: '$10k straps', v: 1e4, w: 0.156, d: 0.0663, h: 0.0109 },
  { n: '$1M bricks', v: 1e6, w: 0.40, d: 0.33, h: 0.0873 },
  { n: '$100M pallets', v: 1e8, w: 1.2, d: 1.0, h: 0.96 }
];
function pile(usd, tier) {
  const count = usd / tier.v;
  const V = count * tier.w * tier.d * tier.h;
  if (count < 1) { const S = Math.cbrt(Math.max(V, 1e-12)); return { W: S, D: S, H: S, count, nx: 1, nz: 1, ny: 1 }; }
  const S = Math.cbrt(V);
  const nx = Math.max(1, Math.round(S / tier.w)), nz = Math.max(1, Math.round(S / tier.d));
  const ny = Math.max(1, Math.ceil(count / (nx * nz)));
  return { W: nx * tier.w, D: nz * tier.d, H: ny * tier.h, count, nx, nz, ny };
}
Renderers.money = function (c) {
  const hi = Math.max(c.A.base, c.B.base);
  let tier = CASH_TIERS[CASH_TIERS.length - 1];
  for (const t of CASH_TIERS) if (hi / t.v <= 4000) { tier = t; break; }
  const pA = pile(c.A.base, tier), pB = pile(c.B.base, tier);
  const gy = 470, availH = 340, availW = 390;
  const boxOf = (p, s) => ART.isoSize(p.W, p.D, p.H, s);
  const fit = p => Math.min(availW / boxOf(p, 1).w, availH / boxOf(p, 1).h);
  const sFit = Math.min(fit(pA), fit(pB), availH / 1.95);
  const SS = U.sideScales(Math.cbrt(pA.W * pA.D * pA.H), Math.cbrt(pB.W * pB.D * pB.H), c.mode, sFit);
  const draw = (p, cx, side, key) => {
    const ss = SS[key];
    const size = boxOf(p, ss);
    const x0 = cx - (size.w / 2) + p.D * 0.8660254 * ss;
    const cols = { top: ART.lift(side.color, .26), right: side.color, left: ART.sink(side.color, .30) };
    let g = ART.cast(cx, gy, Math.max(size.w * .58, 6), Math.max(size.w * .12, 3));
    g += ART.iso(x0, gy, p.W, p.D, p.H, ss, cols, { nx: p.nx, ny: p.ny, nz: p.nz });
    const hp = 1.7 * ss;
    if (hp > 5 && c.mode === 'true') g += ART.human(cx - Math.max(size.w / 2, 32) - 30, gy, hp);
    g += pill(cx, U.clamp(gy - Math.max(size.h, c.mode === 'true' ? hp : 0) - 28, 24, gy - 46), side.label, side.color);
    const capt = p.count >= 1 ? U.fmt(p.count) + ' × ' + tier.n.replace(/s$/, '') : 'a fraction of one ' + tier.n.replace(/s$/, '');
    g += tx(cx, gy + 28, capt, { size: 13.5, fill: T().dim, mono: true });
    g += caption(cx, gy + 46, U.fmt(p.W) + ' × ' + U.fmt(p.D) + ' × ' + U.fmt(p.H) + ' m', { fill: T().faint, keep: true });
    g += caption(cx, gy + 66, whatIs(c.cat, side.base), { fill: T().dim });
    return g;
  };
  let out = ART.scene(gy, VW, VH);
  out += draw(pA, 268, c.A, 'a') + draw(pB, 726, c.B, 'b');
  out += caption(VW / 2, 34, c.mode === 'true' ? 'stacked in real cash, at the same scale' : 'stacked in real cash — each pile at its own zoom', { fill: T().dim });
  const smallPx = Math.min(boxOf(pA, SS.a).h, boxOf(pB, SS.b).h);
  return {
    svg: wrap(out),
    note: c.mode === 'log' ? 'in log scale each pile gets its own zoom, so the little human sits this one out'
      : (smallPx < 8 ? 'yes — the smaller pile really is that small next to the bigger one' : '')
  };
};

/* ============================ WEIGHT ============================ */
Renderers.weight = function (c) {
  const px = 500, py = 244, L = 296;
  const t = U.clamp(Math.log10(c.B.base / c.A.base) * 9, -27, 27) * Math.PI / 180;
  const lx = px - L * Math.cos(t), ly = py - L * Math.sin(t);
  const rx = px + L * Math.cos(t), ry = py + L * Math.sin(t);
  const f = U.scaler(U.cbrt(c.A.base), U.cbrt(c.B.base), c.mode, 112, 6);
  const wA = f(U.cbrt(c.A.base)), wB = f(U.cbrt(c.B.base));

  const pan = (x, y, size, col, side) => {
    const py2 = y + 92, rim = py2 - 7;
    return `<line x1="${x}" y1="${y}" x2="${x - 54}" y2="${rim}" stroke="${T().rope}" stroke-width="1.5"/>`
      + `<line x1="${x}" y1="${y}" x2="${x + 54}" y2="${rim}" stroke="${T().rope}" stroke-width="1.5"/>`
      + `<ellipse cx="${x}" cy="${rim + 4}" rx="56" ry="12" fill="${T().panDark}"/>`
      + `<ellipse cx="${x}" cy="${rim}" rx="56" ry="12" fill="${T().pan}"/>`
      + `<ellipse cx="${x}" cy="${rim}" rx="56" ry="12" fill="url(#ss-sheen)"/>`
      + ART.box(x - size * .42, rim - size * .62, size * .84, size * .62, Math.min(size * .3, 24), col)
      + pill(x, py2 + 38, side.label, col)
      + caption(x, py2 + 60, whatIs(c.cat, side.base), { fill: T().dim });
  };

  let out = ART.flat(VW, VH);
  out += `<ellipse cx="${px}" cy="482" rx="150" ry="18" fill="url(#ss-blob)"/>`;
  out += ART.prism(`M ${px - 48} 468 L ${px - 15} ${py + 8} h 30 L ${px + 48} 468 z`, 9, T().stand);
  out += ART.box(px - 92, 464, 184, 16, 10, T().standDark, 8);
  /* the beam */
  out += `<line x1="${lx.toFixed(1)}" y1="${(ly + 3).toFixed(1)}" x2="${rx.toFixed(1)}" y2="${(ry + 3).toFixed(1)}" stroke="${T().beamHi}" stroke-width="8" stroke-linecap="round" opacity=".5"/>`;
  out += `<line x1="${lx.toFixed(1)}" y1="${ly.toFixed(1)}" x2="${rx.toFixed(1)}" y2="${ry.toFixed(1)}" stroke="${T().beam}" stroke-width="8" stroke-linecap="round"/>`;
  out += `<line x1="${lx.toFixed(1)}" y1="${(ly - 1.6).toFixed(1)}" x2="${rx.toFixed(1)}" y2="${(ry - 1.6).toFixed(1)}" stroke="${T().beamHi}" stroke-width="2" stroke-linecap="round"/>`;
  out += `<circle cx="${px}" cy="${py}" r="11" fill="${T().pivot}"/><circle cx="${px - 2}" cy="${py - 2}" r="5" fill="${T().pivotHi}"/>`;
  out += pan(lx, ly, wA, c.A.color, c.A) + pan(rx, ry, wB, c.B.color, c.B);

  const heavier = c.A.base >= c.B.base ? c.A : c.B;
  let best = c.cat.refs[0], bd = Infinity;
  for (const r of c.cat.refs) {
    const k = heavier.base / r.v;
    if (k < 1) continue;
    const d = Math.abs(Math.log10(k) - Math.log10(4));
    if (d < bd) { bd = d; best = r; }
  }
  const n = heavier.base / best.v;
  const show = U.clamp(Math.round(n), 1, 12);
  let row = '';
  for (let i = 0; i < show; i++) row += ART.box(VW / 2 - (show - 1) * 15 + i * 30 - 10, 528, 20, 16, 7, T().token, 3);
  out += tx(VW / 2, 512, 'the heavier side ≈ ' + U.count(n, best.n.replace(/^an? /, '')), { size: 14.5, fill: T().dim });
  out += row;
  return { svg: wrap(out), note: 'the beam tips by the log of the ratio, otherwise it would just point straight down' };
};

/* ============================ TEMPERATURE ============================ */
const TEMP_STOPS = [[-273.15, '#93b6f0'], [-40, '#7ec4dd'], [0, '#63bed2'], [21, '#79b98a'], [37, '#e8b955'], [100, '#dd8845'], [500, '#cd5b46'], [1500, '#a83028'], [5500, '#f0dca8']];
function tempColor(v) {
  if (v <= TEMP_STOPS[0][0]) return TEMP_STOPS[0][1];
  for (let i = 1; i < TEMP_STOPS.length; i++) {
    if (v <= TEMP_STOPS[i][0]) {
      const a = TEMP_STOPS[i - 1], b = TEMP_STOPS[i];
      return ART.mix(a[1], b[1], (v - a[0]) / (b[0] - a[0]));
    }
  }
  return TEMP_STOPS[TEMP_STOPS.length - 1][1];
}
Renderers.temp = function (c) {
  const top = 74, bot = 416, bulbY = 458, R = 32, W = 26;
  let lo = Math.min(c.A.base, c.B.base), hi = Math.max(c.A.base, c.B.base);
  const padTop = Math.max((hi - lo) * 0.18, 8);
  hi += padTop; lo -= Math.max((hi - lo) * 0.10, 8);
  const y = v => bot - (bot - top) * (U.clamp(v, lo, hi) - lo) / (hi - lo);

  let out = ART.flat(VW, VH);
  /* the scale itself, as a ramp down the left edge */
  let stops = '';
  for (let i = 0; i <= 10; i++) stops += `<stop offset="${i * 10}%" stop-color="${tempColor(hi - (hi - lo) * i / 10)}"/>`;
  const defs = `<defs><linearGradient id="ramp" x1="0" y1="0" x2="0" y2="1">${stops}</linearGradient></defs>`;
  out += `<rect x="74" y="${top}" width="12" height="${bot - top}" rx="6" fill="url(#ramp)"/>`;
  out += `<rect x="74" y="${top}" width="12" height="${bot - top}" rx="6" fill="url(#ss-cyl)"/>`;
  for (let i = 0; i <= 4; i++) {
    const v = lo + (hi - lo) * (1 - i / 4), yy = y(v);
    out += hair(92, yy, VW - 30, .07) + tx(68, yy + 4, U.fmt(v) + '°', { anchor: 'end', size: 11.5, fill: T().faint, mono: true });
  }
  let lastRef = 1e9;
  c.cat.refs.slice().sort((p, q) => q.v - p.v).forEach(r => {
    if (r.v < lo + (hi - lo) * 0.02 || r.v > hi) return;
    const ry = y(r.v);
    if (Math.abs(ry - lastRef) < 17) return;
    lastRef = ry;
    out += `<line x1="96" y1="${ry.toFixed(1)}" x2="${VW - 30}" y2="${ry.toFixed(1)}" stroke="${T().text}" stroke-width="1" stroke-dasharray="2 6" opacity=".26"/>`
      + tx(VW - 34, ry - 7, r.n, { anchor: 'end', size: 12, fill: T().faint });
  });

  [[350, c.A], [580, c.B]].forEach(pair => {
    const x = pair[0], s = pair[1], fy = y(s.base), col = tempColor(s.base);
    out += `<ellipse cx="${x}" cy="${bulbY + R - 2}" rx="${R * 1.1}" ry="${R * .3}" fill="url(#ss-blob)"/>`;
    out += `<rect x="${x - W / 2}" y="${top - 16}" width="${W}" height="${bot - top + 44}" rx="${W / 2}" fill="${T().tube}"/>`;
    out += `<circle cx="${x}" cy="${bulbY}" r="${R}" fill="${T().tube}"/>`;
    out += `<circle cx="${x}" cy="${bulbY}" r="${R - 5}" fill="${col}"/>`;
    out += `<rect x="${x - W / 2 + 5}" y="${fy.toFixed(1)}" width="${W - 10}" height="${(bulbY - fy).toFixed(1)}" fill="${col}"/>`;
    out += `<rect x="${x - W / 2 + 5}" y="${(fy - 5).toFixed(1)}" width="${W - 10}" height="10" rx="5" fill="${col}"/>`;
    out += `<circle cx="${x}" cy="${bulbY}" r="${R}" fill="url(#ss-cyl)"/>`;
    out += `<rect x="${x - W / 2}" y="${top - 16}" width="${W}" height="${bot - top + 44}" rx="${W / 2}" fill="url(#ss-cyl)"/>`;
    out += `<circle cx="${x}" cy="${fy.toFixed(1)}" r="6" fill="${s.color}"/>`;
    out += pill(x, U.clamp(fy - 32, 26, bot), s.label, s.color);
    const others = c.cat.units.filter(u => u.short !== '°C').map(u => U.fmt(u.fromBase ? u.fromBase(s.base) : s.base) + ' ' + u.short).join('   ');
    out += tx(x, bulbY + R + 28, others, { size: 12.5, fill: T().dim, mono: true });
  });
  const d = Math.abs(c.A.base - c.B.base);
  out += caption(VW / 2, 40, 'gap  ' + U.fmt(d) + ' °C  ·  ' + U.fmt(d * 9 / 5) + ' °F', { size: 13, fill: T().text, ls: '.06em' });
  return { svg: wrap(out, defs), note: 'temperature is a position on a scale, not a size — so this one ignores the scale toggle' };
};

/* ============================ TIME ============================ */
const TIME_UNITS = [[1, 'sec'], [60, 'min'], [3600, 'hr'], [86400, 'day'], [604800, 'week'], [2629800, 'month'], [31557600, 'yr'], [3.15576e9, 'century'], [3.15576e13, 'Myr']];
Renderers.time = function (c) {
  const x0 = 72, maxLen = 856, laneY = [186, 366], rh = 50;
  const f = U.scaler(c.A.base, c.B.base, c.mode, maxLen, 4);
  let out = ART.flat(VW, VH);
  const pxPerSec = maxLen / 7;
  [c.A, c.B].forEach((s, i) => {
    const y = laneY[i], len = f(s.base), dur = U.clamp(len / pxPerSec, 0.4, 26);
    let unit = TIME_UNITS[0];
    for (const u of TIME_UNITS) if (s.base / u[0] >= 2.5) unit = u;
    const seg = len / (s.base / unit[0]);
    out += `<rect x="${x0}" y="${(y + rh - 2).toFixed(1)}" width="${len.toFixed(1)}" height="8" rx="4" fill="url(#ss-blob)"/>`;
    out += `<rect x="${x0}" y="${y}" width="${len.toFixed(1)}" height="${rh}" rx="9" fill="${T().track}"/>`;
    out += `<rect x="${x0}" y="${y}" width="${len.toFixed(1)}" height="${rh}" rx="9" fill="url(#ss-deep)" opacity=".5"/>`;
    out += `<clipPath id="clip${i}"><rect x="${x0}" y="${y}" width="${len.toFixed(1)}" height="${rh}" rx="9"/></clipPath>`;
    const move = U.motion();
    out += `<g clip-path="url(#clip${i})"><rect x="${x0}" y="${y}" width="${move ? 0 : len.toFixed(1)}" height="${rh}" fill="${s.color}">
      ${move ? `<animate attributeName="width" values="0;${len.toFixed(1)}" dur="${dur}s" repeatCount="indefinite"/>` : ''}</rect>`;
    out += `<rect x="${x0}" y="${y}" width="${len.toFixed(1)}" height="${rh}" fill="url(#ss-sheen)"/>`;
    if (seg > 6) {
      const n = Math.min(Math.floor(len / seg), 240), every = Math.ceil(n / 120);
      let ticks = '';
      for (let k = every; k <= n; k += every) ticks += `<line x1="${(x0 + k * seg).toFixed(1)}" y1="${y}" x2="${(x0 + k * seg).toFixed(1)}" y2="${y + rh}" stroke="${T().text}" stroke-width="1" opacity=".16"/>`;
      out += ticks;
    }
    out += `</g>`;
    out += pill(x0, y - 26, s.label, s.color, 'start')
      + caption(x0, y - 48, whatIs(c.cat, s.base), { anchor: 'start', fill: T().dim });
    out += tx(x0, y + rh + 24, U.fmtDur(s.base), { anchor: 'start', size: 13.5, fill: T().dim, mono: true });
    out += caption(Math.min(x0 + len, VW - 14), y + rh + 24, seg > 6 ? '1 tick = 1 ' + unit[1] : '', { anchor: 'end', fill: T().faint });
  });
  pickRefs(c.cat.refs, f, 40, maxLen, 4, []).forEach(r => {
    const x = x0 + f(r.v);
    out += `<line x1="${x.toFixed(1)}" y1="470" x2="${x.toFixed(1)}" y2="492" stroke="${T().text}" stroke-width="1" opacity=".28"/>`
      + caption(x, 508, r.n, { fill: T().faint });
  });
  out += caption(VW / 2, VH - 16, 'both bars fill at the same real-world rate', { fill: T().faint });
  return { svg: wrap(out), note: '' };
};

/* ============================ DATA ============================ */
Renderers.data = function (c) {
  const TIERS = [[1, 'byte'], [1024, 'KB'], [1048576, 'MB'], [1073741824, 'GB'], [1.0995e12, 'TB'], [1.1259e15, 'PB']];
  const hi = Math.max(c.A.base, c.B.base);
  let tier = TIERS[0];
  for (const t of TIERS) if (hi / t[0] <= 2500) { tier = t; break; }
  if (hi / tier[0] > 2500) tier = TIERS[TIERS.length - 1];
  const nHi = hi / tier[0];
  const panelW = 384, panelH = 316;
  let cell = U.clamp(Math.sqrt(panelW * panelH / Math.max(nHi, 1)) * 0.92, 2, 26);
  const gap = cell > 7 ? cell * 0.18 : 0.6, step = cell + gap;
  const cols = Math.max(1, Math.floor(panelW / step));
  const tallRows = Math.ceil(Math.min(Math.floor(nHi), 4000) / cols);
  const boxH = U.clamp(tallRows * step + 32, 64, panelH + 32);

  let out = ART.flat(VW, VH);
  [[62, c.A], [554, c.B]].forEach(pair => {
    const x0 = pair[0], s = pair[1];
    const n = s.base / tier[0];
    const full = Math.min(Math.floor(n), 4000);
    const rows = Math.ceil(full / cols);
    const y0 = 158;
    const blockW = Math.min(Math.max(full, 1), cols) * step - gap;
    const gx = x0 + (panelW - blockW) / 2;
    out += `<rect x="${x0 - 12}" y="${y0 - 22}" width="${panelW + 24}" height="${boxH.toFixed(1)}" rx="12" fill="${T().panel}" fill-opacity="${T().panelOp}"/>`;
    let g = '';
    const d = cell > 9 ? cell * 0.22 : 0;
    for (let i = 0; i < full; i++) {
      const cx = gx + (i % cols) * step, cy = y0 + Math.floor(i / cols) * step;
      g += d ? ART.box(cx, cy, cell, cell, d, s.color, Math.min(cell / 5, 3))
        : `<rect x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" width="${cell.toFixed(1)}" height="${cell.toFixed(1)}" rx="${Math.min(2, cell / 4).toFixed(1)}" fill="${s.color}"/>`;
    }
    const frac = n - full;
    if (frac > 0.02 && full < 4000) {
      const cx = gx + (full % cols) * step, cy = y0 + Math.floor(full / cols) * step;
      g += `<rect x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" width="${(cell * Math.min(frac, 1)).toFixed(1)}" height="${cell.toFixed(1)}" rx="1.5" fill="${s.color}" opacity=".5"/>`;
    }
    out += g;
    out += caption(x0 + panelW / 2, 82, whatIs(c.cat, s.base), { fill: T().dim });
    out += pill(x0 + panelW / 2, 104, s.label, s.color);
    out += tx(x0 + panelW / 2, 136, U.fmt(n) + ' × 1 ' + tier[1], { size: 13.5, fill: T().dim, mono: true });
    if (n > 4000) out += caption(x0 + panelW / 2, y0 + rows * step + 24, 'showing the first 4,000', { fill: T().faint });
  });
  out += caption(VW / 2, 48, 'one square = 1 ' + tier[1], { size: 12.5, fill: T().text, ls: '.08em' });
  out += hair(VW / 2 - 70, 62, VW / 2 + 70, .14);
  return { svg: wrap(out), note: 'squares are drawn at the same size on both sides, so the pile area is the honest comparison' };
};

/* ============================ SPEED ============================ */
function paceName(ms) {
  if (ms < 0.5) return 'slower than a walk';
  if (ms < 3) return 'walking pace';
  if (ms < 8) return 'cycling pace';
  if (ms < 20) return 'a sprint';
  if (ms < 60) return 'motorway pace';
  if (ms < 200) return 'jet pace';
  if (ms < 1200) return 'rocket pace';
  if (ms < 1e6) return 'orbital pace';
  return 'a fair slice of light speed';
}
Renderers.speed = function (c) {
  const x0 = 108, len = 700, laneY = [188, 348];
  const fast = Math.max(c.A.base, c.B.base);
  let out = ART.flat(VW, VH);
  [c.A, c.B].forEach((s, i) => {
    const y = laneY[i];
    const dur = U.clamp(3.2 * (fast / Math.max(s.base, 1e-12)), 3.2, 900);
    out += road(x0 - 30, y - 30, len + 88, 66);
    const fx = x0 + len + 30;
    out += `<rect x="${fx}" y="${y - 30}" width="18" height="66" fill="${T().flag}"/>`;
    for (let k = 0; k < 8; k++) out += `<rect x="${fx + (k % 2 ? 9 : 0)}" y="${y - 30 + k * 8.25}" width="9" height="8.25" fill="${T().road}"/>`;
    out += `<g>${U.motion() ? `<animateTransform attributeName="transform" type="translate" values="0 0;${len} 0" dur="${dur}s" repeatCount="indefinite"/>` : ''}`
      + ART.car(x0, y + 28, 62, s.color) + `</g>`;
    out += pill(x0 - 30, y - 52, s.label, s.color, 'start')
      + caption(x0 - 30, y - 74, whatIs(c.cat, s.base), { anchor: 'start', fill: T().dim });
    out += tx(x0 - 30, y + 60, U.fmt(s.base * 3.6) + ' km/h   ' + U.fmt(s.base) + ' m/s', { anchor: 'start', size: 12.5, fill: T().dim, mono: true });
    out += caption(x0 + len + 60, y + 60, paceName(s.base), { anchor: 'end', fill: T().faint });
  });
  const slow = Math.min(c.A.base, c.B.base), lapM = 400;
  out += hair(220, 452, 780, .12);
  out += caption(VW / 2, 486, 'the same 400 m lap, side by side', { size: 12.5, fill: T().text, ls: '.08em' });
  out += tx(VW / 2, 514, 'quick one: ' + U.fmtDur(lapM / fast) + '     slow one: ' + U.fmtDur(lapM / slow), { size: 14, fill: T().dim, mono: true });
  out += tx(VW / 2, 538, 'in the time the fast one finishes, the slow one covers ' + U.fmtLen(lapM * slow / fast), { size: 12.5, fill: T().faint });
  return { svg: wrap(out), note: fast / slow > 200 ? 'the slow one is moving — give it a decade' : '' };
};

/* ============================ VOLUME ============================ */
Renderers.volume = function (c) {
  const gy = 460, availH = 330, availW = 370;
  const side = l => Math.cbrt(Math.max(l, 1e-9) / 1000);
  const sA = side(c.A.base), sB = side(c.B.base);
  const isoH = S => ART.isoSize(S, S, S, 1).h, isoW = S => ART.isoSize(S, S, S, 1).w;
  const fitS = S => Math.min(availW / isoW(S), availH / isoH(S));
  const SS = U.sideScales(sA, sB, c.mode, Math.min(fitS(sA), fitS(sB), availH / 1.95));
  let out = ART.scene(gy, VW, VH);
  [[266, c.A, sA, 'a'], [734, c.B, sB, 'b']].forEach(row => {
    const cx = row[0], sd = row[1], S = row[2], ss = SS[row[3]];
    const size = ART.isoSize(S, S, S, ss);
    const x0 = cx - size.w / 2 + S * 0.8660254 * ss;
    const cols = { top: ART.lift(sd.color, .30), right: sd.color, left: ART.sink(sd.color, .30) };
    let div = null;
    const unit = S > 2 ? { s: 1, n: 'm³' } : S > 0.2 ? { s: 0.1, n: '100 L' } : { s: 0.01, n: 'litre' };
    const n = S / unit.s;
    if (n >= 2 && n <= 40) div = { nx: Math.round(n), ny: Math.round(n), nz: Math.round(n) };
    out += ART.cast(cx, gy, Math.max(size.w * .56, 6), Math.max(size.w * .12, 3));
    out += ART.iso(x0, gy, S, S, S, ss, cols, div);
    const hp = 1.7 * ss;
    if (hp > 6 && c.mode === 'true') out += ART.human(cx - Math.max(size.w / 2, 32) - 28, gy, hp);
    out += pill(cx, U.clamp(gy - size.h - 26, 24, gy - 66), sd.label, sd.color);
    out += tx(cx, gy + 28, U.fmtVol(sd.base) + '  ·  a ' + U.fmt(S) + ' m cube', { size: 13, fill: T().dim, mono: true });
    if (div) out += caption(cx, gy + 46, 'gridded in ' + unit.n, { fill: T().faint, keep: true });
    out += caption(cx, gy + 66, whatIs(c.cat, sd.base), { fill: T().dim });
  });
  out += caption(VW / 2, 34, c.mode === 'true' ? 'poured into a cube, at the same scale' : 'poured into a cube — each at its own zoom', { fill: T().dim });
  return { svg: wrap(out), note: c.mode === 'log' ? 'in log scale each cube gets its own zoom, so the little human sits this one out' : '' };
};

/* ============================ ENERGY ============================
   A magnitude ladder. Energy runs from a heartbeat to a second of sunshine —
   twenty-six powers of ten — so drawing it to size would be absurd. Instead
   every rung is ten times the one below, the landmarks are a ledger down the
   right, and the two quantities are joined by a painted span on the rail. */
Renderers.energy = function (c) {
  const ax = 258, top = 64, bot = 494;
  const refs = c.cat.refs.map(r => r.v).filter(v => v > 0);
  const rLo = Math.log10(Math.min.apply(null, refs)), rHi = Math.log10(Math.max.apply(null, refs));
  const a = Math.log10(Math.max(Math.min(c.A.base, c.B.base), 1e-12));
  const b = Math.log10(Math.max(Math.max(c.A.base, c.B.base), 1e-12));

  /* frame the window on the two quantities rather than on the whole ladder,
     or a kettle and a lightning bolt end up two pixels apart */
  const pad = Math.max((b - a) * 0.55, 1.7);
  let l0 = Math.max(a - pad, rLo - 0.6), l1 = Math.min(b + pad, rHi + 0.6);
  if (l1 - l0 < 4.2) { const m = (l0 + l1) / 2; l0 = m - 2.1; l1 = m + 2.1; }
  l0 = Math.min(l0, a - 0.3); l1 = Math.max(l1, b + 0.3);

  const y = v => bot - (bot - top) * (U.clamp(Math.log10(Math.max(v, 1e-12)), l0, l1) - l0) / (l1 - l0);
  const yA = y(c.A.base), yB = y(c.B.base);

  const defs = `<defs><linearGradient id="ss-span" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${yA <= yB ? c.A.color : c.B.color}"/>
    <stop offset="1" stop-color="${yA <= yB ? c.B.color : c.A.color}"/></linearGradient></defs>`;

  let out = ART.flat(VW, VH);
  const every = Math.max(1, Math.ceil((l1 - l0) / 11));
  for (let e = Math.ceil(l0); e <= Math.floor(l1); e++) {
    const yy = y(Math.pow(10, e)), show = e % every === 0;
    out += `<line x1="74" y1="${yy.toFixed(1)}" x2="${VW - 28}" y2="${yy.toFixed(1)}" stroke="${T().text}" stroke-opacity="${show ? '.09' : '.04'}" stroke-width="1"/>`;
    if (show) out += tx(66, yy + 4, U.fmtEnergy(Math.pow(10, e)), { anchor: 'end', size: 11, fill: T().axis, mono: true });
  }
  out += `<line x1="${ax}" y1="${top - 16}" x2="${ax}" y2="${bot + 16}" stroke="${T().text}" stroke-opacity=".2" stroke-width="1"/>`;
  out += `<rect x="${ax - 5}" y="${Math.min(yA, yB).toFixed(1)}" width="10" height="${Math.max(Math.abs(yA - yB), 2).toFixed(1)}" rx="5" fill="url(#ss-span)"/>`;

  /* whatever fell off the ends of the window still gets a mention */
  const above = c.cat.refs.filter(r => Math.log10(r.v) > l1).sort((p, q) => p.v - q.v)[0];
  const below = c.cat.refs.filter(r => Math.log10(r.v) < l0).sort((p, q) => q.v - p.v)[0];
  if (above) out += tx(VW - 30, top - 22, '\u2191  ' + above.n + ', up at ' + U.fmtEnergy(above.v), { anchor: 'end', size: 11.5, fill: T().faint });
  if (below) out += tx(VW - 30, bot + 32, '\u2193  ' + below.n + ', down at ' + U.fmtEnergy(below.v), { anchor: 'end', size: 11.5, fill: T().faint });

  let last = -1e9;
  c.cat.refs.slice().sort((p, q) => q.v - p.v).forEach(r => {
    const e = Math.log10(r.v);
    if (e < l0 || e > l1) return;                    /* off the window, not clamped onto its edge */
    const yy = y(r.v);
    if (Math.abs(yy - last) < 15 || Math.abs(yy - yA) < 17 || Math.abs(yy - yB) < 17) return;
    last = yy;
    out += `<circle cx="${ax}" cy="${yy.toFixed(1)}" r="2.6" fill="${T().faint}"/>`
      + tx(ax + 20, yy + 4, r.n, { anchor: 'start', size: 12.5, fill: T().dim })
      + tx(VW - 30, yy + 4, U.fmtEnergy(r.v), { anchor: 'end', size: 11.5, fill: T().faint, mono: true });
  });

  [[c.A, yA], [c.B, yB]].forEach(p => {
    const s = p[0], yy = p[1];
    out += `<circle cx="${ax}" cy="${yy.toFixed(1)}" r="7.5" fill="${s.color}"/>`
      + `<line x1="${ax - 13}" y1="${yy.toFixed(1)}" x2="${ax - 5}" y2="${yy.toFixed(1)}" stroke="${s.color}" stroke-width="2"/>`
      + pill(ax - 17, yy, s.label, s.color, 'end');
  });

  const ratio = Math.max(c.A.base, c.B.base) / Math.max(Math.min(c.A.base, c.B.base), 1e-12);
  const dec = Math.log10(ratio);
  out += caption(VW / 2, 34, isFinite(dec) && dec > 0 ? U.fmt(U.r(dec, 1)) + ' orders of magnitude apart' : 'the same amount of energy',
    { size: 12.5, fill: T().text, ls: '.08em' });
  out += caption(74, bot + 56, 'every line is ten times the one below it', { anchor: 'start', fill: T().faint });
  return { svg: wrap(out, defs), note: 'energy runs over too many powers of ten to draw to size, so this one is always a log ladder' };
};
