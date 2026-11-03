# android/: the app

Java 8 source level, built with the SDK's own tools by `build.ps1` (no Gradle). Package `com.cleanyourtv.phone`, one activity.

- `java/com/cleanyourtv/phone/MainActivity.java`: the WebView and the `Bridge` class exposed as `window.CYTV_APP`. Every bridge method
  needs `@JavascriptInterface`; `test/mobile.test.js` checks that the pages call only methods that exist and are exposed.
- `Addr.java` is the only place an address is parsed: a literal private or link-local IPv4 address with an optional port. `Store.java`
  and `isTv()` go through it. Compare addresses parsed, never as a text prefix.
- `res/` holds a vector icon (`drawable/icon.xml`, the same colours as `assets/icon.svg`) and the theme; `values-v31` is the splash.
- `AndroidManifest.xml`: `INTERNET` and `VIBRATE` only, cleartext HTTP on purpose, the `cytv://add` link.
- `build.ps1` pins build-tools `34.0.0` and platform `android-34`, copies `../web/*.html` into the assets, signs with a local debug key
  in `build-keystore/` (ignored) and writes `../dist/tv-remote.apk`.

After a change: `npm test` from the repository root, then rebuild and say that the app was or was not run on a phone.
