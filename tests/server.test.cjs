const assert = require('node:assert/strict');
const { createStaticServer } = require('../scripts/serve.cjs');
(async () => {
  const server = createStaticServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const home = await fetch(base + '/');
    assert.equal(home.status, 200);
    assert.match(home.headers.get('content-type'), /text\/html/);
    const homeHTML = await home.text();
    assert.match(homeHTML, /Practice Studio/);
    assert.match(homeHTML, /href="\.\/lab\/">GraphQL game — additional query practice/);
    assert.ok(!homeHTML.includes('__LAB_URL__'));
    const lab = await fetch(base + '/lab/');
    assert.equal(lab.status, 200);
    assert.match(await lab.text(), /GraphQL Lab/);
    const script = await fetch(base + '/lab/app.js');
    assert.equal(script.status, 200);
    assert.match(script.headers.get('content-type'), /javascript/);
    assert.equal((await fetch(base + '/lab', { redirect:'manual' })).status, 301);
    assert.equal((await fetch(base + '/src/exam/app.js')).status, 404);
    assert.equal((await fetch(base + '/missing')).status, 404);
    assert.equal((await fetch(base + '/%2e%2e%2fpackage.json')).status, 403);
    assert.equal((await fetch(base + '/', { method:'POST' })).status, 405);
    const head = await fetch(base + '/', { method:'HEAD' });
    assert.equal(head.status, 200); assert.equal(await head.text(), '');
    console.log('PASS: hosted exam, lab assets, MIME types, redirects, HEAD, missing files, methods, and source/traversal isolation.');
  } finally { await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
