const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'dist');
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.png':'image/png', '.svg':'image/svg+xml', '.ico':'image/x-icon' };
function createStaticServer(directory = root) {
  const base = path.resolve(directory);
  return http.createServer((req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow:'GET, HEAD' }); res.end('Method not allowed'); return; }
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400); res.end('Bad request'); return; }
    const filename = path.resolve(base, '.' + pathname.replaceAll('\\', '/'));
    if (filename !== base && !filename.startsWith(base + path.sep)) { res.writeHead(403); res.end('Forbidden'); return; }
    let target = filename;
    try {
      if (fs.statSync(target).isDirectory()) {
        if (!pathname.endsWith('/')) { res.writeHead(301, { Location:pathname + '/' }); res.end(); return; }
        target = path.join(target, 'index.html');
      }
      const real = fs.realpathSync(target);
      if (real !== base && !real.startsWith(base + path.sep)) { res.writeHead(403); res.end('Forbidden'); return; }
      const file = fs.readFileSync(real);
      res.writeHead(200, { 'Content-Type':types[path.extname(real)] || 'application/octet-stream', 'Content-Length':file.length, 'Cache-Control':'no-cache', 'X-Content-Type-Options':'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : file);
    } catch { res.writeHead(404, { 'Content-Type':'text/plain; charset=utf-8' }); res.end('Not found'); }
  });
}
if (require.main === module) {
  if (!fs.existsSync(path.join(root, 'index.html'))) { console.error('No build found. Run npm run build first.'); process.exit(1); }
  const port = Number(process.env.PORT || 3000), host = process.env.HOST || '127.0.0.1';
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid PORT');
  const server = createStaticServer();
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  server.listen(port, host, () => console.log(`Local: http://${host}:${server.address().port}`));
}
module.exports = { createStaticServer };
