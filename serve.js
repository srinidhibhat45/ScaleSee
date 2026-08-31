/* Tiny zero-dependency static server, for when you want ScaleSee on a real
   http:// origin instead of file://.  node serve.js [port]  */
const http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname, port = Number(process.argv[2]) || 8000;
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  const file = path.join(root, url === '/' ? 'index.html' : url);
  if (!file.startsWith(root)) { res.writeHead(403).end('nope'); return; }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('not found'); return; }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(buf);
  });
}).listen(port, () => console.log('ScaleSee → http://localhost:' + port));
