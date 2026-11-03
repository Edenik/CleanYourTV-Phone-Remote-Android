// What test/mobile.test.js needs: ok() for one line per check, run() for the async body, root for the repository folder.
// Run it with `node test/mobile.test.js` (or `npm test`); it exits with 1 when a check failed.
'use strict';
const path = require('path');

const root = path.join(__dirname, '..');

let failed = 0;
function ok(cond, name) {
  console.log((cond ? 'ok   ' : 'FAIL ') + name);
  if (!cond) failed++;
}
function run(body) {
  body()
    .catch(e => {
      console.log('FAIL the test stopped: ' + ((e && e.stack) || e));
      failed++;
    })
    .then(() => process.exit(failed ? 1 : 0));
}

module.exports = { root, ok, run };
