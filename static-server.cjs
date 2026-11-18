// Development preview of the same static files that can go to Firebase Hosting.
// This server intentionally has no video-rendering endpoints.
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const port = Number(process.env.PORT || 8772);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.ttf':'font/ttf','.wasm':'application/wasm','.txt':'text/plain; charset=utf-8','.apk':'application/vnd.android.package-archive','.exe':'application/octet-stream'};
http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); res.end(); return; }
  if (!['GET', 'HEAD'].includes(req.method) || /\/(api|exportaciones|node_modules)(\/|$)/.test(pathname)) { res.writeHead(404); res.end(); return; }
  const file = path.resolve(root, '.' + pathname, pathname.endsWith('/') ? 'index.html' : '');
  if (!file.startsWith(root + path.sep) || !types[path.extname(file)] || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, {'Content-Type':types[path.extname(file)],'Cache-Control':'no-store','Content-Length':fs.statSync(file).size});
  if (req.method === 'HEAD') res.end(); else fs.createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`Exportación en el navegador: http://127.0.0.1:${port}/`));
