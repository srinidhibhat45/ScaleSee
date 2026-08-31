/* ScaleSee — "ok but what does that MEAN" */
const FACTS = {
  money: [
    { e: '⏱️', l: 'counting it out, one a second', fn: v => U.fmtDur(v) },
    { e: '📚', l: 'stacked up in $100 bills', fn: v => U.fmtLen(v / 100 * 0.000109) },
    { e: '☕', l: 'flat whites at $5 a go', fn: v => U.fmt(v / 5) },
    { e: '⚖️', l: 'that cash, on a scale', fn: v => U.fmtMass(v / 100 * 0.001) },
    { e: '🏡', l: 'houses at $420,000', fn: v => U.fmt(v / 420000) },
    { e: '💸', l: 'spending $1,000 a day', fn: v => U.fmtDur(v / 1000 * 86400) }
  ],
  height: [
    { e: '🧍', l: 'people, head to toe', fn: v => U.fmt(v / 1.7) },
    { e: '🏢', l: 'storeys of a building', fn: v => U.fmt(v / 3.1) },
    { e: '🪂', l: 'time to fall from the top', fn: v => U.fmtDur(Math.sqrt(2 * Math.abs(v) / 9.81)) },
    { e: '🪜', l: 'stair steps to climb it', fn: v => U.fmt(v / 0.18) },
    { e: '🚶', l: 'walking that far, flat out', fn: v => U.fmtDur(v / 1.389) },
    { e: '📏', l: 'in plain old metres', fn: v => U.fmtLen(v) }
  ],
  distance: [
    { e: '🚶', l: 'walking non-stop at 5 km/h', fn: v => U.fmtDur(v / 1.389) },
    { e: '🚗', l: 'driving at 100 km/h', fn: v => U.fmtDur(v / 27.78) },
    { e: '✈️', l: 'in a jet at 900 km/h', fn: v => U.fmtDur(v / 250) },
    { e: '💡', l: 'at the speed of light', fn: v => U.fmtDur(v / 299792458) },
    { e: '🥇', l: 'marathons back to back', fn: v => U.fmt(v / 42195) },
    { e: '🌍', l: 'laps of the Earth', fn: v => U.fmt(v / 40075000) }
  ],
  land: [
    { e: '⚽', l: 'football pitches', fn: v => U.fmt(v / 7140) },
    { e: '🛋️', l: 'two-bedroom flats', fn: v => U.fmt(v / 111) },
    { e: '🚶', l: 'walking around the edge', fn: v => U.fmtDur(4 * Math.sqrt(v) / 1.389) },
    { e: '🧍', l: 'people packed in, 4 per m²', fn: v => U.fmt(v * 4) },
    { e: '📐', l: 'as a square, each side', fn: v => U.fmtLen(Math.sqrt(v)) },
    { e: '🌾', l: 'in acres', fn: v => U.fmt(v / 4046.86) }
  ],
  weight: [
    { e: '🧍', l: 'average people', fn: v => U.fmt(v / 62) },
    { e: '🐘', l: 'elephants', fn: v => U.fmt(v / 6000) },
    { e: '🚗', l: 'family cars', fn: v => U.fmt(v / 1500) },
    { e: '📎', l: 'paperclips', fn: v => U.fmt(v / 0.001) },
    { e: '🐋', l: 'blue whales', fn: v => U.fmt(v / 150000) },
    { e: '🧊', l: 'as a cube of water, each side', fn: v => U.fmtLen(Math.cbrt(v / 1000)) }
  ],
  temp: [
    { e: '🌡️', l: 'in Fahrenheit', fn: v => U.fmt(v * 9 / 5 + 32) + ' °F' },
    { e: '🔬', l: 'in kelvin', fn: v => U.fmt(v + 273.15) + ' K' },
    { e: '❄️', l: 'compared to freezing water', fn: v => (v >= 0 ? '+' : '') + U.fmt(v) + ' °C' },
    { e: '🩺', l: 'compared to body heat', fn: v => (v - 37 >= 0 ? '+' : '−') + U.fmt(Math.abs(v - 37)) + ' °C' },
    { e: '☕', l: 'compared to boiling water', fn: v => (v - 100 >= 0 ? '+' : '−') + U.fmt(Math.abs(v - 100)) + ' °C' },
    { e: '🥶', l: 'above absolute zero', fn: v => U.fmt(v + 273.15) + ' °C worth' }
  ],
  time: [
    { e: '💓', l: 'heartbeats', fn: v => U.fmt(v * 1.1667) },
    { e: '😴', l: "nights' sleep", fn: v => U.fmt(v / 28800) },
    { e: '🌕', l: 'full moons', fn: v => U.fmt(v / 2551443) },
    { e: '📺', l: 'sitcom episodes', fn: v => U.fmt(v / 1320) },
    { e: '🧓', l: 'human lifetimes', fn: v => U.fmt(v / 2.3e9) },
    { e: '📅', l: 'in plain days', fn: v => U.fmt(v / 86400) }
  ],
  data: [
    { e: '📷', l: 'photos', fn: v => U.fmt(v / 3145728) },
    { e: '🎵', l: 'songs', fn: v => U.fmt(v / 5242880) },
    { e: '🎬', l: 'HD movies', fn: v => U.fmt(v / 4294967296) },
    { e: '💾', l: 'floppy disks', fn: v => U.fmt(v / 1509949) },
    { e: '💬', l: 'text messages', fn: v => U.fmt(v / 140) },
    { e: '📶', l: 'download time on 100 Mbps', fn: v => U.fmtDur(v * 8 / 1e8) }
  ],
  speed: [
    { e: '🏟️', l: 'crossing a football pitch', fn: v => U.fmtDur(105 / v) },
    { e: '🌍', l: 'once around the Earth', fn: v => U.fmtDur(40075000 / v) },
    { e: '🌕', l: 'getting to the Moon', fn: v => U.fmtDur(384400000 / v) },
    { e: '📏', l: 'ground covered in an hour', fn: v => U.fmtLen(v * 3600) },
    { e: '🔊', l: 'as a fraction of sound', fn: v => U.fmt(v / 343) + '× mach' },
    { e: '💡', l: 'as a fraction of light', fn: v => U.fmt(v / 299792458 * 100) + '% of c' }
  ],
  volume: [
    { e: '🛁', l: 'bathtubs', fn: v => U.fmt(v / 300) },
    { e: '🥤', l: 'cans of soda', fn: v => U.fmt(v / 0.355) },
    { e: '🏊', l: 'olympic pools', fn: v => U.fmt(v / 2.5e6) },
    { e: '🚿', l: 'showers at 65 litres', fn: v => U.fmt(v / 65) },
    { e: '🧊', l: 'as a cube, each side', fn: v => U.fmtLen(Math.cbrt(v / 1000)) },
    { e: '⚖️', l: 'if it were water, it weighs', fn: v => U.fmtMass(v) }
  ],
  energy: [
    { e: '\ud83d\udca1', l: 'a 10 W bulb, running for', fn: v => U.fmtDur(v / 10) },
    { e: '\u2615', l: 'kettles of water, boiled', fn: v => U.fmt(v / 3.35e5) },
    { e: '\ud83c\udf7d\ufe0f', l: 'days of food for one person', fn: v => U.fmt(v / 8.7e6) },
    { e: '\u26fd', l: 'litres of petrol', fn: v => U.fmt(v / 3.4e7) },
    { e: '\ud83e\uddcd', l: 'lifting a person one metre', fn: v => U.fmt(v / 608) },
    { e: '\ud83d\udca5', l: 'in TNT', fn: v => U.fmtMass(v / 4.184e6) }
  ]
};
