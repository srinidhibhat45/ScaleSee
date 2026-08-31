# ScaleSee 👁

*how big is big, actually?*

Pick two quantities of the same kind — any two — and see them drawn side by side, to scale.
A million dollars is one brick of cash at your feet; a billion is a block taller than you are.
One cent of land is a red square in the corner of an acre. Everything is dynamic: `103 million`
vs `0.9 billion`, `5 cents` vs `1.5 acres`, `5.9 ft` vs the Burj Khalifa.

## Run it

Open `index.html` in a browser. That's it — no build step, no dependencies, no server needed.

If you'd rather serve it over http:// (zero dependencies, Node only):

```bash
node serve.js
```

For a single file you can email or drop on a host:

```bash
node build.js
```

...which writes `dist/scalesee.html` with everything inlined.

## What's in it

Ten categories, each with its own way of drawing:

| Category | How it's drawn |
|---|---|
| 💰 Money | real cash volume, stacked into an isometric block, with a human for scale |
| 🏙️ Height | silhouettes on a shared ground line, with landmark reference lines behind |
| 🛣️ Distance | two roads, cars driving them at the same real-world speed |
| 🟩 Land | the smaller plot nested in the corner of the bigger one, tiled to show the count |
| ⚖️ Weight | a balance that tips by the log of the ratio |
| 🌡️ Temperature | two thermometers on a shared axis, coloured by temperature |
| ⏳ Time | bars that fill at the same real rate, ticked in days/months/years |
| 💾 Data | one square per unit, same square size on both sides |
| 🏎️ Speed | a race down the same 400 m lap |
| 🧊 Volume | poured into a cube, next to a person |
| ⚡ Energy | a magnitude ladder — every rung is ten times the one below |

**true scale vs log scale** — true scale is honest and sometimes leaves the smaller thing two
pixels tall (which *is* the answer). Log scale squashes the gap so you can still see both.

**light and dark** — the header has three states: follow your system, or pin one. The
drawings repaint too, because their palette lives in JS rather than CSS.

Every comparison is a URL, so `copy this comparison` gives you a link straight back to
it, and `save the picture` writes the current drawing out as a 2000×1120 PNG.

## On a phone

The drawing is the point, so on a narrow screen it goes edge to edge — out past the
card, past the page padding — and pans sideways inside its own scroller, with a fade
on the right edge and a line under it saying so. Everything else reflows rather than
shrinks: the header drops its tagline to a second row, the value/unit/currency row
stays on one line, and the comparison table tightens instead of scrolling, so the
numbers are still readable side by side. Anything you touch is at least 40px under a
coarse pointer, and the keyboard hint gets out of the way.

The chrome above the drawing is kept short, because everything spent there is scrolling
the reader has to do before they see the picture. The categories and the `try` suggestions
each run as one strip that scrolls sideways to the screen edges, fading whichever end
still has something behind it; the strip is three times wider than a phone, so the chosen
category is scrolled back into view whenever it changes — and again once the webfont
lands and every chip gets wider. Between the two sides, the swap button sits on a hairline
that separates them, rather than in the tall empty column it needs on a wide screen.

## Keyboard

| | |
|---|---|
| <kbd>S</kbd> | swap the two sides |
| <kbd>R</kbd> | surprise me |
| <kbd>T</kbd> | true scale / log scale |
| <kbd>D</kbd> | light / dark |
| <kbd>C</kbd> | copy the link |
| <kbd>P</kbd> | save the picture |
| <kbd>[</kbd> <kbd>]</kbd> | previous / next category |
| <kbd>↑</kbd> <kbd>↓</kbd> | inside a number box, ×10 / ÷10 |
| <kbd>?</kbd> | the shortcut sheet |

## Accessibility

Audited against WCAG 2.1 AA, and the palette was solved rather than guessed —
`--muted`, `--faint`, the two comparison colours and every text tone inside the SVG
were walked toward black (or white) until they cleared 4.5:1 against the surface they
actually land on, in both themes. That is also how the accent pair was picked: the
raspberry and the petrol blue are the darkest points on their hues that still carry
white pill text at 4.5:1. Form controls and the ladder bars clear 3:1 for
non-text contrast (1.4.11).

Beyond colour: every control has a name, the number boxes have real `<label>`s, the
category and scale toggles report state with `aria-pressed`, the drawing is a
`role="img"` with a generated `aria-label` describing the comparison (and is
keyboard-scrollable, since it pans sideways on narrow screens), the verdict and the
stage note are live regions, the comparison table has a caption and row/column scopes,
there is a skip link and a `<main>` landmark, focus is a solid 2px ring rather than a
tint, and hit targets are at least 32px. SMIL animation is already gated on
`prefers-reduced-motion`.

The hazy background landmarks in the height scene are deliberately below 3:1 — they
are decorative, and every one of them is also named and measured on a dashed rule, so
nothing is only available as a faint shape.

## Files

```
index.html          markup
css/styles.css      the whole look
js/util.js          number formatting, the shared scaler
js/data.js          categories, units, landmarks, presets   ← edit this to add things
js/icons.js         the line glyphs for the category bar
js/art.js           the drawing kit: silhouettes, solids, the isometric box
js/renderers.js     one renderer per category
js/facts.js         the "put another way" cards
js/app.js           state, URL, wiring
```

## The look

Everything in the pictures is drawn flat and then given a shallow extrusion — a top
face, a side face, one light source from the upper left, and a soft contact shadow.
Not flat, not a rendered 3-D scene; somewhere in between. Nothing is outlined, so
form comes from tone alone: `ART.faces(colour)` hands back the three tones a solid
needs, `ART.box` and `ART.prism` build solids out of them, and a single shared
`#ss-sheen` gradient laid over any shape does the lighting. `ART.scene` puts down
sky, ground, and a floor grid that bunches toward the horizon; distant landmarks get
pushed toward the backdrop with `ART.haze` so they read as far away.

The chrome is hairlines and type: `Space Grotesk` for the verdict, `Inter Tight` for the interface, `DM Mono` for anything numeric —
and the mono does real work, not decoration. Every measured value on the page is set
in it, so numbers line up in columns and you can compare them by eye.

The wordmark is the one place a serif is allowed: `Fraunces`, set as a single word,
next to a mark that is just the product — a big circle and a small one sharing a
baseline, drawn in the two comparison colours.

Those colours are a violet and a forest green: not neighbours, and not a warm/cool
pair you have seen on every other site. Violet keeps a strong blue channel where the
green has none, so the two stay apart under colour-vision deficiency too. They live in
CSS (`--a`, `--b`) and the drawings read them back at render time, which is how they
can differ between light and dark.

Both themes are one drawing in two palettes. `THEMES` at the top of `js/art.js` holds
every colour the pictures use that is not one of the two comparison colours — sky,
ground, rails, ropes, asphalt, grass, and the four text tones — and `ART.setTheme()`
swaps the lot. `ART.DEFS()` is a function rather than a constant for the same reason:
the sky gradient changes.

## The landmarks are drawn to their real elevations

Each one is authored as setback heights and widths divided by the building's own
height, so the silhouette is right whatever size it gets drawn at:

| | measured from |
|---|---|
| Burj Khalifa | 828 m; top floor 585.4 m (.707), spire base 739.4 m (.893), then 242.5 m of needle |
| Eiffel Tower | 330 m; base 125 m square, decks at 57 m (.173), 115 m (.348), 276 m (.836) |
| Empire State | 443 m; 129 m across the base, roof at 381 m (.860), 62 m mooring mast |
| Great Pyramid | half-base 115.2 m over 146.6 m of height, so the faces sit at the real 51.8° |
| Statue of Liberty | 93 m; the pedestal is 47 m of it, so it is half the thing |

`stack()` in `js/art.js` takes those tables directly — `[y0, y1, halfLeft, halfRight]`
per tier — which is why the Burj steps alternately left and right on the way up, the
way the real one spirals.

## Naming things

A quantity is not its own name. Something 5.9 ft tall is not called "5.9 ft" — it is
*about a person*, and it should be **drawn** as one, at 5.9 ft. `nearRef()` in
`js/renderers.js` finds the closest reference within a factor of 1.35 and feeds two
decisions at once: which model gets drawn, and what the thing is called. Land on a
landmark exactly and you get its name; land near one and you get "about the Eiffel
Tower"; land nowhere near anything and the plate falls back to the plain measurement.

It is why 7 ft against 5 ft draws two people at their true heights rather than two
anonymous bars, and why the same line appears under the piles, the pans, the cubes and
the lanes in every other category.

## Reading the height scene

It is a measured elevation, not a vibe. In true scale the left-hand ruler is stepped
in round numbers off the taller figure, every landmark that fits gets a dashed rule
with its name and height, two of them are drawn in haze in the background, and a
dimension bracket up the side of the taller one carries the ratio. Log scale drops
the ruler, because a log axis with metre labels would be a lie.

## Adding to it

**A new unit** — drop it in that category's `units` array in `js/data.js`:

```js
{ id: 'bigha', name: 'bighas', short: 'bighas', sing: 'bigha', f: 2529.3 }
```

`f` converts to the category's base unit (metres, m², kg, seconds, bytes, litres, m/s, USD, °C).

**A new landmark** — add to that category's `refs`, with the value in base units. It
shows up in the reference ladder under the picture, on the height ruler, and as a
drawn model if you give it an `art`:

```js
{ n: 'the Chrysler Building', v: 318.9, e: '🏙️', art: 'artdeco' }
```

It'll show up as a tappable chip and as a reference line in the drawing. `art` is optional and
only used by the height renderer — pick from `human, giraffe, house, tree, shrub, statue,
clocktower, pyramid, truss` (the Eiffel Tower), `tower, artdeco` (the Empire State),
`burj, mountain, rocket, bar`.

**A whole new category** — add an entry to `CATS`, a glyph in `js/icons.js`, a row in
`NICE_UNITS` in `js/app.js`, and a matching function on `Renderers`. The
renderer gets `{cat, A, B, mode}` where `A`/`B` are `{base, label, color}`, and returns
`{svg, note}`. The canvas is a fixed 1000×560 viewBox that CSS scales.

## Notes on the numbers

Landmark figures are real but rounded (Burj Khalifa 828 m, blue whale 150 t, and so on).
Currency rates are rough and hardcoded in `CURRENCIES` at the top of `js/data.js` — change them
there if you care about being current. Cash volume assumes $100 bills at about 0.0115 m³ per
million, which is roughly right for real strapped bundles.
