/* ScaleSee — everything measurable, and the things we measure it against.
   Every `v` in `refs` is in the category's base unit.
   Rough real-world figures, rounded for vibes rather than surveying. */

const CURRENCIES = [
  { id: 'USD', sym: '$', rate: 1 },
  { id: 'INR', sym: '₹', rate: 83 },
  { id: 'EUR', sym: '€', rate: 0.92 },
  { id: 'GBP', sym: '£', rate: 0.79 },
  { id: 'JPY', sym: '¥', rate: 150 }
];

const CATS = [
{
  id: 'money', name: 'Money', emoji: '💰', renderer: 'money', currency: true,
  blurb: 'a million is a rounding error',
  units: [
    { id: 'one', name: 'just the number', short: '', f: 1 },
    { id: 'k', name: 'thousand', short: 'thousand', f: 1e3 },
    { id: 'lakh', name: 'lakh', short: 'lakh', f: 1e5 },
    { id: 'mn', name: 'million', short: 'million', f: 1e6 },
    { id: 'cr', name: 'crore', short: 'crore', f: 1e7 },
    { id: 'bn', name: 'billion', short: 'billion', f: 1e9 },
    { id: 'tn', name: 'trillion', short: 'trillion', f: 1e12 }
  ],
  def: { a: { v: 1, u: 'mn', c: 'USD' }, b: { v: 1, u: 'bn', c: 'USD' } },
  presets: [
    { t: '$1M vs $1B', a: [1, 'mn'], b: [1, 'bn'] },
    { t: '$1B vs $1T', a: [1, 'bn'], b: [1, 'tn'] },
    { t: '1 crore vs $1 million', a: [1, 'cr', 'INR'], b: [1, 'mn', 'USD'] },
    { t: 'a coffee vs a house', a: [5, 'one'], b: [420, 'k'] },
    { t: '$103M vs $0.9B', a: [103, 'mn'], b: [0.9, 'bn'] }
  ],
  refs: [
    { n: 'a flat white', v: 5, e: '☕' },
    { n: 'a video game', v: 70, e: '🎮' },
    { n: 'a phone', v: 1000, e: '📱' },
    { n: 'a used car', v: 12000, e: '🚗' },
    { n: 'a nice car', v: 45000, e: '🚙' },
    { n: 'a US home', v: 420000, e: '🏡' },
    { n: 'a supercar', v: 300000, e: '🏎️' },
    { n: 'a private jet', v: 65e6, e: '✈️' },
    { n: 'a 787', v: 250e6, e: '🛫' },
    { n: 'an aircraft carrier', v: 13e9, e: '🚢' },
    { n: 'Apple, roughly', v: 3.4e12, e: '🍎' },
    { n: 'US GDP, roughly', v: 29e12, e: '🇺🇸' }
  ]
},
{
  id: 'height', name: 'Height', emoji: '🏙️', renderer: 'height',
  blurb: 'look up. now look further up.',
  units: [
    { id: 'cm', name: 'centimetres', short: 'cm', f: 0.01 },
    { id: 'in', name: 'inches', short: 'in', f: 0.0254 },
    { id: 'ft', name: 'feet', short: 'ft', sing: 'foot', f: 0.3048 },
    { id: 'm', name: 'metres', short: 'm', f: 1 },
    { id: 'storey', name: 'storeys', short: 'storeys', sing: 'storey', f: 3.1 },
    { id: 'km', name: 'kilometres', short: 'km', f: 1000 },
    { id: 'mi', name: 'miles', short: 'mi', f: 1609.344 }
  ],
  def: { a: { v: 5.9, u: 'ft' }, b: { v: 828, u: 'm' } },
  presets: [
    { t: 'you vs the Burj Khalifa', a: [5.9, 'ft'], b: [828, 'm'] },
    { t: 'Empire State vs Everest', a: [443.2, 'm'], b: [8848.86, 'm'] },
    { t: '10 storeys vs 100 storeys', a: [10, 'storey'], b: [100, 'storey'] },
    { t: 'a giraffe vs the Eiffel Tower', a: [5.5, 'm'], b: [330, 'm'] }
  ],
  refs: [
    { n: 'a person', v: 1.7, e: '🧍', art: 'human' },
    { n: 'a giraffe', v: 5.5, e: '🦒', art: 'giraffe' },
    { n: 'a house', v: 8, e: '🏠', art: 'house' },
    { n: 'a redwood', v: 100, e: '🌲', art: 'tree' },
    { n: 'the Statue of Liberty', v: 93, e: '🗽', art: 'statue' },
    { n: 'Big Ben', v: 96, e: '🕰️', art: 'clocktower' },
    { n: 'the Great Pyramid', v: 138.8, e: '🔺', art: 'pyramid' },
    { n: 'the Eiffel Tower', v: 330, e: '🗼', art: 'truss' },
    { n: 'the Empire State', v: 443.2, e: '🏢', art: 'artdeco' },
    { n: 'the Burj Khalifa', v: 828, e: '🕌', art: 'burj' },
    { n: 'Mount Everest', v: 8848.86, e: '🏔️', art: 'mountain' },
    { n: 'cruising altitude', v: 11000, e: '✈️', art: 'bar' },
    { n: 'the Kármán line', v: 100000, e: '🚀', art: 'rocket' }
  ]
},
{
  id: 'distance', name: 'Distance', emoji: '🛣️', renderer: 'distance',
  blurb: 'are we there yet',
  units: [
    { id: 'm', name: 'metres', short: 'm', f: 1 },
    { id: 'ft', name: 'feet', short: 'ft', sing: 'foot', f: 0.3048 },
    { id: 'km', name: 'kilometres', short: 'km', f: 1000 },
    { id: 'mi', name: 'miles', short: 'mi', sing: 'mile', f: 1609.344 },
    { id: 'nmi', name: 'nautical miles', short: 'nmi', f: 1852 },
    { id: 'ls', name: 'light-seconds', short: 'light-sec', f: 299792458 },
    { id: 'au', name: 'astronomical units', short: 'AU', f: 1.495978707e11 },
    { id: 'ly', name: 'light-years', short: 'ly', f: 9.4607e15 }
  ],
  def: { a: { v: 1, u: 'mi' }, b: { v: 1, u: 'km' } },
  presets: [
    { t: 'a mile vs a kilometre', a: [1, 'mi'], b: [1, 'km'] },
    { t: 'a marathon vs Manhattan', a: [42.195, 'km'], b: [21.6, 'km'] },
    { t: 'to the Moon vs to the Sun', a: [384400, 'km'], b: [149.6e6, 'km'] },
    { t: 'around Earth vs to the Moon', a: [40075, 'km'], b: [384400, 'km'] }
  ],
  refs: [
    { n: 'a city block', v: 100, e: '🏘️' },
    { n: 'a lap of a track', v: 400, e: '🏃' },
    { n: 'Manhattan, end to end', v: 21600, e: '🌃' },
    { n: 'the English Channel', v: 33800, e: '🏊' },
    { n: 'a marathon', v: 42195, e: '🥇' },
    { n: 'London to Paris', v: 344000, e: '🚄' },
    { n: 'New York to LA', v: 3944000, e: '🛫' },
    { n: 'around the Earth', v: 40075000, e: '🌍' },
    { n: 'Earth to the Moon', v: 384400000, e: '🌕' },
    { n: 'Earth to the Sun', v: 1.496e11, e: '☀️' },
    { n: 'to Proxima Centauri', v: 4.0e16, e: '✨' }
  ]
},
{
  id: 'land', name: 'Land', emoji: '🟩', renderer: 'land',
  blurb: 'one cent is not one percent of an acre (it is)',
  units: [
    { id: 'sqft', name: 'square feet', short: 'sq ft', f: 0.09290304 },
    { id: 'sqm', name: 'square metres', short: 'm²', f: 1 },
    { id: 'gaj', name: 'square yards (gaj)', short: 'sq yd', f: 0.83612736 },
    { id: 'cent', name: 'cents', short: 'cents', sing: 'cent', f: 40.4686 },
    { id: 'guntha', name: 'gunthas', short: 'gunthas', sing: 'guntha', f: 101.17 },
    { id: 'ground', name: 'grounds', short: 'grounds', sing: 'ground', f: 222.967 },
    { id: 'acre', name: 'acres', short: 'acres', sing: 'acre', f: 4046.8564 },
    { id: 'ha', name: 'hectares', short: 'ha', f: 10000 },
    { id: 'pitch', name: 'football pitches', short: 'pitches', sing: 'pitch', f: 7140 },
    { id: 'sqkm', name: 'square kilometres', short: 'km²', f: 1e6 },
    { id: 'sqmi', name: 'square miles', short: 'sq mi', f: 2589988 }
  ],
  def: { a: { v: 1, u: 'cent' }, b: { v: 1, u: 'acre' } },
  presets: [
    { t: '1 cent vs 1 acre', a: [1, 'cent'], b: [1, 'acre'] },
    { t: '5 cents vs 1.5 acres', a: [5, 'cent'], b: [1.5, 'acre'] },
    { t: 'a flat vs a football pitch', a: [1200, 'sqft'], b: [1, 'pitch'] },
    { t: 'Central Park vs Manhattan', a: [3.41, 'sqkm'], b: [59.1, 'sqkm'] }
  ],
  refs: [
    { n: 'a parking space', v: 12.5, e: '🅿️' },
    { n: 'a 2BHK flat', v: 111, e: '🛋️' },
    { n: 'a tennis court', v: 260.9, e: '🎾' },
    { n: 'a basketball court', v: 436.6, e: '🏀' },
    { n: 'a football pitch', v: 7140, e: '⚽' },
    { n: 'an acre', v: 4046.86, e: '🌾' },
    { n: 'Central Park', v: 3.41e6, e: '🌳' },
    { n: 'Manhattan', v: 59.1e6, e: '🏙️' },
    { n: 'Paris', v: 105.4e6, e: '🥐' },
    { n: 'Singapore', v: 728.6e6, e: '🇸🇬' }
  ]
},
{
  id: 'weight', name: 'Weight', emoji: '⚖️', renderer: 'weight',
  blurb: 'heavier than it looks',
  units: [
    { id: 'g', name: 'grams', short: 'g', f: 0.001 },
    { id: 'oz', name: 'ounces', short: 'oz', f: 0.0283495 },
    { id: 'lb', name: 'pounds', short: 'lb', f: 0.45359237 },
    { id: 'kg', name: 'kilograms', short: 'kg', f: 1 },
    { id: 'st', name: 'stone', short: 'st', f: 6.35029 },
    { id: 't', name: 'tonnes', short: 't', f: 1000 },
    { id: 'kt', name: 'kilotonnes', short: 'kt', f: 1e6 }
  ],
  def: { a: { v: 70, u: 'kg' }, b: { v: 6, u: 't' } },
  presets: [
    { t: 'you vs an elephant', a: [70, 'kg'], b: [6, 't'] },
    { t: 'a car vs a blue whale', a: [1.5, 't'], b: [150, 't'] },
    { t: 'a cat vs a person', a: [4.5, 'kg'], b: [70, 'kg'] },
    { t: 'a 747 vs the Eiffel Tower', a: [183.5, 't'], b: [10100, 't'] }
  ],
  refs: [
    { n: 'a paperclip', v: 0.001, e: '📎' },
    { n: 'a phone', v: 0.19, e: '📱' },
    { n: 'a house cat', v: 4.5, e: '🐈' },
    { n: 'a person', v: 62, e: '🧍' },
    { n: 'a grand piano', v: 400, e: '🎹' },
    { n: 'a car', v: 1500, e: '🚗' },
    { n: 'an elephant', v: 6000, e: '🐘' },
    { n: 'a bus', v: 12000, e: '🚌' },
    { n: 'a blue whale', v: 150000, e: '🐋' },
    { n: 'a 747, empty', v: 183500, e: '✈️' },
    { n: 'the Eiffel Tower', v: 10.1e6, e: '🗼' }
  ]
},
{
  id: 'temp', name: 'Temperature', emoji: '🌡️', renderer: 'temp', diff: true,
  blurb: 'degrees of regret',
  units: [
    { id: 'c', name: 'degrees Celsius', short: '°C', f: 1 },
    { id: 'f', name: 'degrees Fahrenheit', short: '°F', toBase: v => (v - 32) * 5 / 9, fromBase: c => c * 9 / 5 + 32 },
    { id: 'k', name: 'kelvin', short: 'K', toBase: v => v - 273.15, fromBase: c => c + 273.15 }
  ],
  def: { a: { v: 0, u: 'c' }, b: { v: 100, u: 'c' } },
  presets: [
    { t: 'freezing vs boiling', a: [0, 'c'], b: [100, 'c'] },
    { t: 'body heat vs lava', a: [37, 'c'], b: [1200, 'c'] },
    { t: '100 °F vs 100 °C', a: [100, 'f'], b: [100, 'c'] },
    { t: 'absolute zero vs a nice day', a: [0, 'k'], b: [24, 'c'] }
  ],
  refs: [
    { n: 'absolute zero', v: -273.15, e: '🥶' },
    { n: 'coldest ever recorded', v: -89.2, e: '🇦🇶' },
    { n: 'a freezer', v: -18, e: '🧊' },
    { n: 'water freezing', v: 0, e: '❄️' },
    { n: 'a nice day', v: 24, e: '😎' },
    { n: 'body temperature', v: 37, e: '🩺' },
    { n: 'a hot day in Delhi', v: 45, e: '🥵' },
    { n: 'water boiling', v: 100, e: '☕' },
    { n: 'a pizza oven', v: 430, e: '🍕' },
    { n: 'lava', v: 1200, e: '🌋' },
    { n: "the Sun's surface", v: 5505, e: '☀️' }
  ]
},
{
  id: 'time', name: 'Time', emoji: '⏳', renderer: 'time',
  blurb: 'a million seconds is 11 days. a billion is 31 years.',
  units: [
    { id: 's', name: 'seconds', short: 's', f: 1 },
    { id: 'min', name: 'minutes', short: 'min', f: 60 },
    { id: 'h', name: 'hours', short: 'h', f: 3600 },
    { id: 'd', name: 'days', short: 'days', sing: 'day', f: 86400 },
    { id: 'wk', name: 'weeks', short: 'weeks', sing: 'week', f: 604800 },
    { id: 'mo', name: 'months', short: 'months', sing: 'month', f: 2629800 },
    { id: 'y', name: 'years', short: 'years', sing: 'year', f: 31557600 },
    { id: 'dec', name: 'decades', short: 'decades', sing: 'decade', f: 315576000 },
    { id: 'cen', name: 'centuries', short: 'centuries', sing: 'century', f: 3155760000 },
    { id: 'my', name: 'million years', short: 'Myr', f: 3.15576e13 }
  ],
  def: { a: { v: 1, u: 'd' }, b: { v: 1, u: 'y' } },
  presets: [
    { t: 'a day vs a year', a: [1, 'd'], b: [1, 'y'] },
    { t: '1M seconds vs 1B seconds', a: [1e6, 's'], b: [1e9, 's'] },
    { t: 'a lifetime vs the pyramids', a: [73, 'y'], b: [4500, 'y'] },
    { t: 'all of history vs the dinosaurs', a: [5000, 'y'], b: [66, 'my'] }
  ],
  refs: [
    { n: 'a blink', v: 0.1, e: '😑' },
    { n: 'a heartbeat', v: 0.86, e: '💓' },
    { n: 'a sitcom episode', v: 1320, e: '📺' },
    { n: "a night's sleep", v: 28800, e: '😴' },
    { n: 'a pregnancy', v: 2.36e7, e: '🤰' },
    { n: 'a human life', v: 2.3e9, e: '🧓' },
    { n: 'since the Moon landing', v: 1.75e9, e: '🌕' },
    { n: 'since Rome fell', v: 4.9e10, e: '🏛️' },
    { n: 'since the pyramids', v: 1.42e11, e: '🔺' },
    { n: 'since the dinosaurs', v: 2.08e15, e: '🦖' },
    { n: 'the age of the Earth', v: 1.43e17, e: '🌍' }
  ]
},
{
  id: 'data', name: 'Data', emoji: '💾', renderer: 'data',
  blurb: 'your phone holds more than 1995 did',
  units: [
    { id: 'B', name: 'bytes', short: 'B', f: 1 },
    { id: 'KB', name: 'kilobytes', short: 'KB', f: 1024 },
    { id: 'MB', name: 'megabytes', short: 'MB', f: 1048576 },
    { id: 'GB', name: 'gigabytes', short: 'GB', f: 1073741824 },
    { id: 'TB', name: 'terabytes', short: 'TB', f: 1.099511627776e12 },
    { id: 'PB', name: 'petabytes', short: 'PB', f: 1.125899906842624e15 }
  ],
  def: { a: { v: 1, u: 'GB' }, b: { v: 1, u: 'TB' } },
  presets: [
    { t: 'a GB vs a TB', a: [1, 'GB'], b: [1, 'TB'] },
    { t: 'a photo vs a movie', a: [3, 'MB'], b: [4, 'GB'] },
    { t: 'a floppy vs a phone', a: [1.44, 'MB'], b: [256, 'GB'] },
    { t: 'your phone vs Wikipedia', a: [256, 'GB'], b: [22, 'GB'] }
  ],
  refs: [
    { n: 'a text message', v: 140, e: '💬' },
    { n: 'this webpage', v: 120000, e: '📄' },
    { n: 'a floppy disk', v: 1509949, e: '💾' },
    { n: 'a photo', v: 3145728, e: '📷' },
    { n: 'a song', v: 5242880, e: '🎵' },
    { n: 'an HD movie', v: 4294967296, e: '🎬' },
    { n: 'Wikipedia, text only', v: 2.36e10, e: '📚' },
    { n: 'a phone', v: 2.75e11, e: '📱' },
    { n: 'a big hard drive', v: 1.76e13, e: '🗄️' }
  ]
},
{
  id: 'speed', name: 'Speed', emoji: '🏎️', renderer: 'speed',
  blurb: 'everything is slow compared to light',
  units: [
    { id: 'kmh', name: 'km per hour', short: 'km/h', f: 0.277778 },
    { id: 'mph', name: 'miles per hour', short: 'mph', f: 0.44704 },
    { id: 'ms', name: 'metres per second', short: 'm/s', f: 1 },
    { id: 'kn', name: 'knots', short: 'kn', f: 0.514444 },
    { id: 'mach', name: 'mach', short: 'mach', f: 343 },
    { id: 'c', name: 'the speed of light', short: 'c', f: 299792458 }
  ],
  def: { a: { v: 5, u: 'kmh' }, b: { v: 105, u: 'kmh' } },
  presets: [
    { t: 'walking vs a cheetah', a: [5, 'kmh'], b: [104, 'kmh'] },
    { t: 'a car vs a jet', a: [100, 'kmh'], b: [900, 'kmh'] },
    { t: 'sound vs light', a: [1, 'mach'], b: [1, 'c'] },
    { t: 'Usain Bolt vs the ISS', a: [44.7, 'kmh'], b: [27600, 'kmh'] }
  ],
  refs: [
    { n: 'a snail', v: 0.013, e: '🐌' },
    { n: 'walking', v: 1.4, e: '🚶' },
    { n: 'a bicycle', v: 5.5, e: '🚲' },
    { n: 'Usain Bolt', v: 12.4, e: '🏃' },
    { n: 'a car', v: 27.8, e: '🚗' },
    { n: 'a cheetah', v: 29, e: '🐆' },
    { n: 'sound', v: 343, e: '🔊' },
    { n: 'a bullet', v: 760, e: '🔫' },
    { n: 'the ISS', v: 7660, e: '🛰️' },
    { n: 'light', v: 299792458, e: '💡' }
  ]
},
{
  id: 'volume', name: 'Volume', emoji: '🧊', renderer: 'volume',
  blurb: 'how much fits inside',
  units: [
    { id: 'ml', name: 'millilitres', short: 'ml', f: 0.001 },
    { id: 'cup', name: 'cups', short: 'cups', sing: 'cup', f: 0.2366 },
    { id: 'pt', name: 'pints', short: 'pints', sing: 'pint', f: 0.4732 },
    { id: 'l', name: 'litres', short: 'L', f: 1 },
    { id: 'gal', name: 'US gallons', short: 'gal', f: 3.78541 },
    { id: 'm3', name: 'cubic metres', short: 'm³', f: 1000 },
    { id: 'pool', name: 'olympic pools', short: 'pools', sing: 'pool', f: 2.5e6 }
  ],
  def: { a: { v: 1, u: 'l' }, b: { v: 300, u: 'l' } },
  presets: [
    { t: 'a bottle vs a bathtub', a: [1, 'l'], b: [300, 'l'] },
    { t: 'a bathtub vs a pool', a: [300, 'l'], b: [1, 'pool'] },
    { t: 'a can vs a keg', a: [355, 'ml'], b: [58.7, 'l'] },
    { t: 'a pool vs a tanker', a: [1, 'pool'], b: [30000, 'l'] }
  ],
  refs: [
    { n: 'a teaspoon', v: 0.005, e: '🥄' },
    { n: 'a shot', v: 0.044, e: '🥃' },
    { n: 'a can of soda', v: 0.355, e: '🥤' },
    { n: 'a bottle of water', v: 1, e: '💧' },
    { n: 'a bucket', v: 10, e: '🪣' },
    { n: 'a bathtub', v: 300, e: '🛁' },
    { n: 'a hot tub', v: 1500, e: '🧖' },
    { n: 'a tanker truck', v: 30000, e: '🚛' },
    { n: 'an olympic pool', v: 2.5e6, e: '🏊' }
  ]
},
{
  id: 'energy', name: 'Energy', emoji: '\u26a1', renderer: 'energy',
  blurb: 'a battery and a bomb, on one ruler',
  units: [
    { id: 'j', name: 'joules', short: 'J', sing: 'joule', f: 1 },
    { id: 'kj', name: 'kilojoules', short: 'kJ', f: 1e3 },
    { id: 'cal', name: 'food calories', short: 'kcal', f: 4184 },
    { id: 'wh', name: 'watt-hours', short: 'Wh', f: 3600 },
    { id: 'kwh', name: 'kilowatt-hours', short: 'kWh', f: 3.6e6 },
    { id: 'mj', name: 'megajoules', short: 'MJ', f: 1e6 },
    { id: 'gj', name: 'gigajoules', short: 'GJ', f: 1e9 },
    { id: 'tnt', name: 'tons of TNT', short: 't TNT', sing: 'ton of TNT', f: 4.184e9 },
    { id: 'mt', name: 'megatons of TNT', short: 'Mt TNT', sing: 'megaton of TNT', f: 4.184e15 }
  ],
  def: { a: { v: 1, u: 'kwh' }, b: { v: 1, u: 'tnt' } },
  presets: [
    { t: 'a AA battery vs a lightning bolt', a: [10, 'kj'], b: [5, 'gj'] },
    { t: 'a day of food vs a litre of petrol', a: [2000, 'cal'], b: [34, 'mj'] },
    { t: 'Hiroshima vs the Tohoku quake', a: [15, 'tnt'], b: [2e18, 'j'] },
    { t: 'a phone charge vs a house for a year', a: [55, 'kj'], b: [40, 'gj'] },
    { t: 'all of humanity vs one second of Sun', a: [6e20, 'j'], b: [3.8e26, 'j'] }
  ],
  refs: [
    { n: 'a heartbeat', v: 1, e: '\ud83d\udc93' },
    { n: 'a AA battery', v: 1e4, e: '\ud83d\udd0b' },
    { n: 'a phone charge', v: 5.5e4, e: '\ud83d\udcf1' },
    { n: 'boiling a kettle', v: 3.35e5, e: '\u2615' },
    { n: 'a slice of pizza', v: 1.2e6, e: '\ud83c\udf55' },
    { n: 'a day of food', v: 8.7e6, e: '\ud83c\udf7d\ufe0f' },
    { n: 'a litre of petrol', v: 3.4e7, e: '\u26fd' },
    { n: 'a tank of petrol', v: 1.7e9, e: '\ud83d\ude97' },
    { n: 'a lightning bolt', v: 5e9, e: '\u26a1' },
    { n: 'a house for a year', v: 4e10, e: '\ud83c\udfe1' },
    { n: 'a rocket launch', v: 1.2e13, e: '\ud83d\ude80' },
    { n: 'the Hiroshima bomb', v: 6.3e13, e: '\u2622\ufe0f' },
    { n: 'the Tsar Bomba', v: 2.1e17, e: '\ud83d\udca5' },
    { n: 'the Tohoku earthquake', v: 2e18, e: '\ud83c\udf0a' },
    { n: 'a hurricane, in a day', v: 5.2e19, e: '\ud83c\udf00' },
    { n: 'the world, for a year', v: 6e20, e: '\ud83c\udf0d' },
    { n: 'the asteroid that ended the dinosaurs', v: 4.2e23, e: '\u2604\ufe0f' },
    { n: 'the Sun, every second', v: 3.8e26, e: '\u2600\ufe0f' }
  ]
}
];

/* pairs of real things whose ratio we can borrow to explain any other ratio */
const ANALOGIES = [
  { r: 3.24, a: 'a person', b: 'a giraffe' },
  { r: 13.8, a: 'a house cat', b: 'a person' },
  { r: 54.7, a: 'a person', b: 'the Statue of Liberty' },
  { r: 96.8, a: 'a person', b: 'an elephant' },
  { r: 487, a: 'a person', b: 'the Burj Khalifa' },
  { r: 2419, a: 'a person', b: 'a blue whale' },
  { r: 5205, a: 'a person', b: 'Mount Everest' },
  { r: 56260, a: 'one step', b: 'a marathon' },
  { r: 86400, a: 'a second', b: 'a day' },
  { r: 1.5e6, a: 'a paperclip', b: 'a car' },
  { r: 6e6, a: 'a drop of water', b: 'a bathtub' },
  { r: 3.16e7, a: 'a second', b: 'a year' },
  { r: 3e7, a: 'a text message', b: 'an HD movie' },
  { r: 1e9, a: 'a second', b: '32 years' },
  { r: 2.8e9, a: 'a heartbeat', b: 'a whole human life' },
  { r: 1.4e11, a: 'a second', b: 'all of recorded history' },
  { r: 1.66e12, a: 'a day', b: 'the age of the Earth' }
];
