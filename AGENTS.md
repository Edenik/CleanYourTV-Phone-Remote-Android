# CleanYourTV Phone Remote for Android: briefing for AI assistants

Read this first. This repository is the Android app for the **Phone remote** add-on of
[cleanyourtv-WebOS](https://github.com/lasharor/cleanyourtv-WebOS) (an LG webOS launcher project). The TV side, the LAN protocol and
the phone page live in that repository, not here.

## What it is

A WebView around the TV's own page (`http://<tv>:8799/`) plus two things a browser cannot do: send the Wake-on-LAN packet, and open
while the TV is off (a saved copy of the page, or a small bundled page). One activity, Java 8, no libraries, no AndroidX, no Gradle.

## Where things are

| Task | Look at |
|---|---|
| The WebView, the bridge (`window.CYTV_APP`), links, retry | `android/java/com/cleanyourtv/phone/MainActivity.java` |
| The saved address, MAC and name | `Store.java` (the address goes through `Addr.java`) |
| Which addresses the app opens | `Addr.java`; `isTv()` in `MainActivity.java` |
| Wake-on-LAN packet | `Wake.java` |
| Finding the TV (SSDP) | `Discover.java` |
| "Is the TV's page there?" | `Reach.java` |
| Wait before reloading | `Backoff.java` |
| The start screens (address, search) and the TV-off screen | `web/start.html`, `web/off.html` (copied into the APK's assets by the build) |
| Manifest, icon, theme | `android/AndroidManifest.xml`, `android/res/` |
| The build | `android/build.ps1` |
| The bridge's methods and rules | `docs/bridge.md` |
| Tests | `test/mobile.test.js` (`test/lib.js` is its helper) |

## Rules

1. **Do not touch the user's phone or TV without being asked.** Nothing here needs either to build or test.
2. **No private data** in the repository, an issue or a pull request: no TV addresses, tokens, device names, MAC addresses. The
   screenshots use generic names; keep it so.
3. **The bridge is a trust boundary.** Whatever the WebView loads gets `window.CYTV_APP`. Keep the rules in `docs/bridge.md`: only the
   TV's own parsed address and the two bundled pages load in the WebView, only the bundled start page calls `setAddr`, a found TV is
   only filled in (the person taps Continue), `cytv://` links accept private IPv4 addresses only. Never loosen these to make a feature work.
4. **Keep it small.** No third-party libraries, no AndroidX, no Gradle, no network calls to anything but the TV. Permissions stay
   `INTERNET` and `VIBRATE`.
5. **The bundled pages are ES5** (they run in Android's WebView, old ones included): no arrow functions, `let`/`const` or template
   strings. Messages are toasts, not text written into the page.
6. **A change needs a check in `test/mobile.test.js`** when it can be tested without a phone. Say plainly what was run on a phone and what was not.
7. **The TV's page is another repository.** A change that needs the page to change (a new bridge method, a new link) is a pull request
   there too; say which one. The bridge names (`getAddr`, `wake`, `buzz`, `cytvPair`, ...) are shared with it.
8. **The APK is not committed.** `dist/` is ignored; the package is attached to a GitHub release, and the QR code in the README points at
   `releases/latest/download/tv-remote.apk`. A release states the SHA-256 of its file. Do not release, tag or force-push: the maintainer does.
9. **Documentation must match the code.** Change `README.md` and `docs/bridge.md` when behaviour changes.
10. **Licence:** MIT. Do not copy code from GPL projects.

## Commands

```sh
npm test                                                          # test/mobile.test.js (Node 8 or newer, no dependencies)
CYTV_REPO=../CleanYourTV npm test                                 # also the checks that read the TV's page
powershell -ExecutionPolicy Bypass -File android/build.ps1        # dist/tv-remote.apk (Windows, Android SDK, JDK, Python)
```

## Things to know

- The TV page's port is 8799; the app's address parser defaults to it. The TV-side add-on and its docs are the source of truth for the port.
- The TV's reply to SSDP must say `webos-second-screen` in `ST:` or `USN:` to count as a TV.
- A build is not byte-for-byte reproducible (zip times, local signing key): compare by SHA-256 of a release, not by rebuilding.
- `deviceName()`, discovery and the wake packet have not been run on a physical phone in every version; see the README's Limits.
