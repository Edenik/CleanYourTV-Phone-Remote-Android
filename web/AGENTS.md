# web/: the bundled pages

`start.html` (the address and search screens) and `off.html` (the TV-off screen) are single files with inline CSS and script, copied into
the APK's assets by `android/build.ps1`. They run inside the app's WebView and talk to the app through `window.CYTV_APP`
(see `../docs/bridge.md`).

- ES5 only: no arrow functions, `let`/`const`, template strings. Nothing from another machine (no `<link>`, `<img src=http…>`, `@import`).
- Messages are toasts (`#toast`, outside `#wrap`) that go away by themselves; no line of text for errors.
- The three setup screens (this page, `off.html`, and the TV's own pairing screen) share one set of rules: the same card, step circles,
  message bar, step label and glow. `test/mobile.test.js` compares them; change all three together (the TV's page is in the other repository).
- A found TV is only filled into the field. The tap on Continue opens it.
- Only this page may call `setAddr`.
