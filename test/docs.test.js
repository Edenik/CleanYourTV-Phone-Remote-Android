// The documentation and the files it points at: every relative link and image in the Markdown files exists, every screenshot is used,
// the QR code and the release link in the README agree, and the repository has the files a visitor expects.
// Run with `node test/docs.test.js` (or `npm test`); it exits with 1 when a check failed.
const fs = require('fs'),
  path = require('path');
const { ok, root, run } = require('./lib');

const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const exists = f => fs.existsSync(path.join(root, f));

// the Markdown files of the repository (no node_modules, no build folders)
function walk(dir, out) {
  fs.readdirSync(path.join(root, dir)).forEach(n => {
    const rel = dir ? dir + '/' + n : n;
    if (/^(\.git|node_modules|dist|build|build-keystore)$/.test(n)) return;
    if (fs.statSync(path.join(root, rel)).isDirectory()) walk(rel, out);
    else out.push(rel);
  });
  return out;
}

run(async () => {
  const files = walk('', []);
  const md = files.filter(f => /\.md$/.test(f));
  ok(md.indexOf('README.md') >= 0 && md.indexOf('AGENTS.md') >= 0, 'README.md and AGENTS.md exist');

  // ---- every relative link and image points at a file that is there ----
  const used = {};
  md.forEach(f => {
    const text = read(f);
    const targets = [];
    text.replace(/\]\(([^)\s]+)\)/g, (_, t) => targets.push(t));
    text.replace(/<img[^>]*\ssrc="([^"]+)"/g, (_, t) => targets.push(t));
    const missing = [];
    targets.forEach(t => {
      if (/^(https?:|mailto:|#)/.test(t)) return;
      const clean = decodeURIComponent(t.split('#')[0]);
      if (!clean) return;
      const abs = path.posix.normalize(path.posix.join(path.posix.dirname(f), clean));
      used[abs] = true;
      if (!exists(abs)) missing.push(t);
    });
    ok(missing.length === 0, f + ': every relative link and image exists' + (missing.length ? ' (MISSING ' + missing.join(', ') + ')' : ''));
  });

  // ---- a screenshot nobody shows is clutter ----
  const shots = files.filter(f => /^docs\/screenshots\//.test(f));
  const unused = shots.filter(f => !used[f]);
  ok(shots.length > 0 && unused.length === 0, 'every screenshot is used by a document' + (unused.length ? ' (UNUSED ' + unused.join(', ') + ')' : ''));

  // ---- the install QR code ----
  const readme = read('README.md');
  const png = fs.readFileSync(path.join(root, 'docs/install-qr.png'));
  ok(png.slice(1, 4).toString() === 'PNG', 'docs/install-qr.png is a PNG');
  const m = /\[open the link\]\((https:\/\/github\.com\/[^)]+\/releases\/latest\/download\/tv-remote\.apk)\)/.exec(readme);
  ok(!!m, 'the README links the latest release package next to the QR code');
  ok(/Edenik\/CleanYourTV-Phone-Remote-Android\//.test(m ? m[1] : ''), 'and that link is this repository');

  // ---- the files a visitor expects, and the rules that keep the repository small ----
  ['LICENSE', 'README.md', 'AGENTS.md', 'CLAUDE.md', '.gitignore', 'package.json', 'docs/bridge.md'].forEach(f => ok(exists(f), f + ' exists'));
  ok(/^MIT License/.test(read('LICENSE')), 'the licence is MIT');
  ok(files.every(f => !/\.(apk|keystore|jks|class|dex)$/.test(f)), 'no package, key or build output is committed');
  const ignore = read('.gitignore');
  ok(/^dist\/$/m.test(ignore) && /build-keystore/.test(ignore), '.gitignore keeps the package and the signing key out');
  ok(read('CLAUDE.md').trim() === '@AGENTS.md', 'CLAUDE.md only points at AGENTS.md');
  const pkg = JSON.parse(read('package.json'));
  ok(pkg.license === 'MIT' && /test\//.test(pkg.scripts.test), 'package.json says MIT and runs the tests');
  ok(!(pkg.dependencies && Object.keys(pkg.dependencies).length) && !(pkg.devDependencies && Object.keys(pkg.devDependencies).length), 'the tests need no dependencies');

  // ---- no private data: only the documentation addresses, never a real home network (the test fixtures are left out) ----
  const text = files.filter(f => /\.(md|html|java|xml|ps1|js|json)$/.test(f) && !/^test\//.test(f)).map(f => [f, read(f)]);
  const SAFE = /^(192\.168\.1\.50|192\.168\.1\.1|255\.255\.255\.255|239\.255\.255\.250|0\.0\.0\.0|127\.0\.0\.1)$/;
  const badIp = [];
  text.forEach(([f, t]) =>
    t.replace(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g, (_, ip) => {
      if (!SAFE.test(ip)) badIp.push(f + ' ' + ip);
    })
  );
  ok(badIp.length === 0, 'no unexpected IP address outside the tests' + (badIp.length ? ' (' + badIp.join(', ') + ')' : ''));
  ok(!text.some(([, t]) => /([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}/.test(t)), 'no MAC address in the repository');
  ok(!text.some(([, t]) => /claude\.ai\/artifact/.test(t)), 'no link to a private artifact');
});
