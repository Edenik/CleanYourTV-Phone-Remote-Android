# The bridge between the TV's page and the app

The app loads the TV's own phone remote page (`http://<tv>:8799/`) in a WebView and exposes one object to it, `window.CYTV_APP`
(`MainActivity.Bridge`). The page checks for the object, so the same page works in a browser without it.

The TV side is the **Phone remote** add-on of [CleanYourTV for LG webOS](https://github.com/lasharor/cleanyourtv-WebOS); its LAN
protocol (pairing, the WebSocket, the messages) is written down there as the phone remote API. This app does not speak that protocol
itself: the page does.

| Method | Called by | What it does |
|---|---|---|
| `getAddr()` / `setAddr(a)` | start page (`setAddr` only from the bundled start page) | the TV's address, a literal private IPv4 address with a port |
| `getMac()` / `setMac(m)` | TV page | the TV's network card address, for the wake packet |
| `wake()` | TV page | sends the Wake-on-LAN packet; returns whether it was sent |
| `up()` | off page | is the TV's page reachable (one TCP connection, 600 ms) |
| `open()` / `start()` | off page | try the TV's page again / go back to the start screen |
| `discover()` | start page | SSDP search; the result comes back as `cytvFound` / `cytvNotFound` |
| `deviceName()` | TV page | the phone's name (Android setting, else maker and model) for the pairing form |
| `name()` / `setName(n)` | off page, TV page | the TV's name, kept for the off screen |
| `pair(code)` | start page | six digits: given to the TV page (`cytvPair`) when it is up, otherwise kept until it is |
| `buzz()` | TV page | a short vibration on a key press |
| `forget(how)` / `bye()` | TV page, start page | log out of the TV: forget its address, read how it went |

Rules that keep it safe (a bridge is exposed to whatever the WebView loads):

- The WebView only loads the TV's own address (compared as a parsed address, never as a text prefix) and the two bundled pages in
  `web/`. Anything else opens in the browser.
- Only the bundled start page may call `setAddr`.
- A TV found by SSDP is used only when its reply says `webos-second-screen` in `ST:` or `USN:`, and the address is only filled in:
  the person taps **Continue**.
- A `cytv://add?host=<address>&code=<code>` link (the TV's own QR code is a plain web address, so such a link has to come from somewhere else) is ignored unless the address is a private IPv4 address; for a TV
  other than the saved one the app asks first.
