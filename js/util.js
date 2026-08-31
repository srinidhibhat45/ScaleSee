/* ScaleSee — number wrangling + tiny helpers */
const U = {};

U.clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
U.cbrt = v => Math.sign(v) * Math.pow(Math.abs(v), 1 / 3);

U.WORDS = [
  [1e33, 'decillion'], [1e30, 'nonillion'], [1e27, 'octillion'], [1e24, 'septillion'],
  [1e21, 'sextillion'], [1e18, 'quintillion'], [1e15, 'quadrillion'], [1e12, 'trillion'],
  [1e9, 'billion'], [1e6, 'million']
];

U.trim = function (x) {
  let s = String(x);
  if (s.indexOf('e') > -1) return s;
  if (s.indexOf('.') > -1) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s;
};

U.group = function (x) {
  const parts = String(x).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

/* friendly short number: 1,234 · 12.5 · 3.4 million · 1.03 billion */
U.fmt = function (n, sig) {
  sig = sig || 3;
  if (n === null || n === undefined || !isFinite(n)) return '∞';
  const sign = n < 0 ? '−' : '';
  const a = Math.abs(n);
  if (a === 0) return '0';
  if (a < 1e-6) return sign + a.toExponential(1).replace('e', '×10^');
  if (a < 1) return sign + U.trim(Number(a.toPrecision(2)));
  if (a < 10) return sign + U.trim(Number(a.toPrecision(3)));
  if (a < 1e6) return sign + U.group(U.trim(Math.round(a * 10) / 10));
  for (let i = 0; i < U.WORDS.length; i++) {
    if (a >= U.WORDS[i][0]) return sign + U.trim(Number((a / U.WORDS[i][0]).toPrecision(sig))) + ' ' + U.WORDS[i][1];
  }
  return sign + a.toExponential(2);
};

/* every last digit, for the "wow that's a lot of zeros" effect */
U.fmtExact = function (n) {
  const a = Math.abs(n);
  if (a >= 1e21 || (a < 1e-4 && a > 0)) return U.fmt(n);
  return (n < 0 ? '−' : '') + U.group(U.trim(Math.round(a * 100) / 100));
};

U.fmtRatio = function (r) {
  if (!isFinite(r)) return '∞×';
  if (r < 10) return U.trim(Number(r.toPrecision(3))) + '×';
  if (r < 1e6) return U.group(Math.round(r)) + '×';
  return U.fmt(r) + '×';
};

/* ---- domain-flavoured formatters, used all over the fun facts ---- */
U.fmtDur = function (s) {
  const a = Math.abs(s);
  if (a < 1e-3) return U.fmt(s * 1e6) + ' microseconds';
  if (a < 1) return U.fmt(s * 1e3) + ' milliseconds';
  if (a < 100) return U.fmt(s) + ' seconds';
  if (a < 5400) return U.fmt(s / 60) + ' minutes';
  if (a < 172800) return U.fmt(s / 3600) + ' hours';
  if (a < 63113852) return U.fmt(s / 86400) + ' days';
  return U.fmt(s / 31557600) + ' years';
};

U.fmtLen = function (m) {
  const a = Math.abs(m);
  if (a < 1e-3) return U.fmt(m * 1e6) + ' µm';
  if (a < 0.01) return U.fmt(m * 1000) + ' mm';
  if (a < 1) return U.fmt(m * 100) + ' cm';
  if (a < 1000) return U.fmt(m) + ' m';
  if (a < 9.4607e15) return U.fmt(m / 1000) + ' km';
  const ly = m / 9.4607e15;
  return U.fmt(ly) + (Math.abs(ly - 1) < 0.005 ? ' light-year' : ' light-years');
};

U.fmtMass = function (kg) {
  const a = Math.abs(kg);
  if (a < 1e-3) return U.fmt(kg * 1e6) + ' mg';
  if (a < 1) return U.fmt(kg * 1000) + ' g';
  if (a < 1000) return U.fmt(kg) + ' kg';
  return U.fmt(kg / 1000) + ' tonnes';
};

U.fmtArea = function (m2) {
  const a = Math.abs(m2);
  if (a < 1) return U.fmt(m2 * 10000) + ' cm²';
  if (a < 1e6) return U.fmt(m2) + ' m²';
  return U.fmt(m2 / 1e6) + ' km²';
};

U.fmtVol = function (l) {
  const a = Math.abs(l);
  if (a < 1) return U.fmt(l * 1000) + ' ml';
  if (a < 1000) return U.fmt(l) + ' litres';
  return U.fmt(l / 1000) + ' m³';
};

/* pluralise a count of things: 3 elephants, 1 elephant, 0.4 of an elephant */
U.count = function (n, one, many) {
  if (n < 1) return U.fmt(n) + ' of ' + (/^[aeiou]/i.test(one) ? 'an ' : 'a ') + one;
  return U.fmt(n) + ' ' + (Math.abs(n - 1) < 1e-9 ? one : (many || one + 's'));
};

/* joules, in SI steps all the way up — the prefixes stay short enough to
   label an axis with, which "90.8 billion Mt TNT" does not */
U.fmtEnergy = function (j) {
  const a = Math.abs(j);
  const steps = [[1e24, 'YJ'], [1e21, 'ZJ'], [1e18, 'EJ'], [1e15, 'PJ'],
                 [1e12, 'TJ'], [1e9, 'GJ'], [1e6, 'MJ'], [1e3, 'kJ']];
  for (const st of steps) if (a >= st[0]) return U.fmt(j / st[0]) + ' ' + st[1];
  return U.fmt(j) + ' J';
};

U.esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
U.r = (n, d) => Math.round(n * Math.pow(10, d || 0)) / Math.pow(10, d || 0);

/* shared scaler: turns a pair of display magnitudes into pixels.
   'true'  -> honest linear pixels (a speck is a speck)
   'log'   -> squashed, so a 1,000,000× gap still fits on one screen */
U.scaler = function (dispA, dispB, mode, avail, minPx) {
  const hi = Math.max(dispA, dispB), lo = Math.min(dispA, dispB);
  const floor = minPx === undefined ? 2 : minPx;
  if (mode === 'log' && lo > 0 && hi / lo > 1.02) {
    const L = Math.log10(hi / lo) + 1;
    return v => (v <= 0 ? 0 : U.clamp(avail * (Math.log10(v / lo) + 1) / L, floor, avail * 1.35));
  }
  if (!(hi > 0)) return () => 0;
  return v => (v <= 0 ? 0 : Math.max(v * avail / hi, v > 0 ? floor : 0));
};

/* per-side scale factors for renderers that draw solids (money, volume):
   keeps the pair honest in true mode, gently compresses in log mode */
U.sideScales = function (dA, dB, mode, sFit) {
  const dMax = Math.max(dA, dB) || 1;
  const f = U.scaler(dA, dB, mode, 1000, 1);
  const C = sFit * dMax / 1000;
  return { a: dA > 0 ? C * f(dA) / dA : 0, b: dB > 0 ? C * f(dB) / dB : 0 };
};

/* respect the OS "reduce motion" setting — the SVG animations are SMIL,
   which CSS cannot switch off, so renderers ask before emitting them */
U.motion = function () {
  try { return !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  catch (e) { return true; }
};
