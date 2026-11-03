# test/

`mobile.test.js` is one script: `node test/mobile.test.js` (or `npm test`). It prints `ok   …` or `FAIL …` per check and exits 1 on a
failure. `lib.js` has the three helpers it needs (`ok`, `run`, `root`).

- No dependencies. Keep it working on Node 8 and newer (no `fs.rmSync`, no optional chaining).
- It reads the app's source and the bundled pages and compiles `Addr.java` and `Backoff.java` with `javac` when one is installed. It does
  not build or run the app.
- The checks that read the TV's own page (`helper/addons-bundled/phoneremote/page.js` in cleanyourtv-WebOS) run only when `CYTV_REPO`
  points at a checkout of that repository.
- The README checks (the SSDP rule, the release link) keep the documentation honest: change the text and the check together.
