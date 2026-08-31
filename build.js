/* Bundles ScaleSee into one file.
   node build.js            -> dist/scalesee.html   (standalone, double-clickable)
   node build.js <out.html> -> body-only fragment (for publishing as an Artifact) */
const fs = require('fs'), path = require('path');
const root = __dirname;
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

const html = read('index.html');
const css = read('css/styles.css');
const js = ['util', 'data', 'icons', 'art', 'renderers', 'facts', 'app'].map(f => read('js/' + f + '.js')).join('\n\n');
const fonts = '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
  + '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
  + '<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter+Tight:wght@400;450;500;600&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">';
const title = 'ScaleSee';

let body = html.split('<body>')[1].split('</body>')[0].replace(/[ \t]*<script src="[^"]*"><\/script>\n?/g, '');
const bundle = `<style>\n${css}\n</style>\n${body}\n<script>\n${js}\n</script>\n`;

const out = process.argv[2];
if (out) {
  fs.writeFileSync(out, `<title>${title}</title>\n${fonts}\n${bundle}`);
  console.log('fragment ->', out);
} else {
  fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
  const full = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n`
    + `<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>${title} — how big is big, actually?</title>\n`
    + `${fonts}\n</head>\n<body>\n${bundle}</body>\n</html>\n`;
  fs.writeFileSync(path.join(root, 'dist/scalesee.html'), full);
  console.log('dist/scalesee.html', (full.length / 1024).toFixed(0) + ' KB');
}
