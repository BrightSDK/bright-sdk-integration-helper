# bright-sdk-integration-helper

**GitHub**: https://github.com/BrightSDK/bright-sdk-integration-helper  
**Package name**: `bright-sdk-integration-helper`  
**Current version**: 1.0.4  
**License**: ISC

---

## What it is

`bright-sdk-integration-helper` is a browser-side JavaScript library that wraps the low-level BrightSDK API (`window.brd_api`) into a clean high-level object (`window.BrightSDK`). It handles:

- Initializing BrightSDK with configuration settings.
- Managing user consent (show dialog, enable, disable).
- Persisting consent status in `localStorage`.
- Integrating with external consent dialogs (e.g., `ConsentModule`).
- Starting Tizen background services when running on Tizen OS.
- Exposing a Promise-based API for async/await usage.

The library ships as a minified single file (`brd_api.helper.min.js`) which is injected into app projects by the `bright-sdk-integration` CLI tool.

---

## Distribution

### How it is published

Running `npm run build` in this repository:
1. Runs the Jest test suite.
2. Reads `src/brd_api.helper.js`.
3. Minifies it using Terser → writes `dist/brd_api.helper.min.js`.
4. Calls `@bright-sdk/tool-release-manager` (from `release.config.js`) which organizes the output into versioned directories under `releases/`:

```
releases/
  latest/          ← always points to current version
    brd_api.helper.min.js
    manifest.json
  v1/              ← major alias
  v1.0/            ← major.minor alias
  v1.0.4/          ← exact version
```

Each `manifest.json` records the package name, build timestamp, version, and file sizes.

### How it is consumed

The `bright-sdk-integration` tool always fetches `latest` from the raw GitHub URL and copies it into your app's JS directory:

```
https://raw.githubusercontent.com/BrightSDK/bright-sdk-integration-helper/refs/heads/main/releases/latest/brd_api.helper.min.js
```

To pin a specific version in your app, manually copy from a versioned path (e.g., `releases/v1.0.4/brd_api.helper.min.js`).

---

## Integration into an app

In your `index.html`, include the helper **after** `brd_api.js`:

```html
<script src="js/brd_api.js"></script>
<script src="js/brd_api.helper.min.js"></script>
```

Both files are placed by the `bright-sdk-integration` CLI tool during SDK update.

---

## API Reference

The helper exposes a global `window.BrightSDK` object.

### `BrightSDK.init(settings)` → Promise

Initialize the BrightSDK. Must be called first.

```js
BrightSDK.init({
    debug: true,
    verbose: false,
    simple_opt_out: false,
    skip_consent: false,
    tizen_service_name: 'Service',
    lang: 'en',
    on_status_change: (consent) => { /* true | false | null */ },
    external_consent_options: [
        'consent-dialog-element-id',
        {
            onAccept: () => {},
            onDecline: () => {},
            onShow: () => {},
            onClose: () => {},
        }
    ],
}).then(() => {
    console.log('BrightSDK ready');
});
```

**Settings fields:**

| Field | Type | Default | Description |
|---|---|---|---|
| `debug` | boolean | `false` | Enable debug console logging |
| `verbose` | boolean | `false` | Enable error console logging (also enabled by `debug`) |
| `simple_opt_out` | boolean | `false` | Allow opt-out via keyboard key `5` instead of dialog |
| `skip_consent` | boolean | `false` | Skip automatic consent dialog on first launch |
| `tizen_service_name` | string | `'Service'` | Name of the Tizen background service to start |
| `lang` | string | — | Language code passed to the external consent dialog |
| `on_status_change` | function | — | Callback fired whenever consent status changes (`true`/`false`/`null`) |
| `external_consent_options` | array | — | `[elementId, optionsObject]` — use `ConsentModule` instead of built-in consent UI |

**Behavior on init:**
- Waits for `window.brd_api` to become available (retries every 1 second if not yet loaded).
- If `external_consent_options` is provided, creates the dialog via `ConsentModule.create()` and sets `skip_consent: true` (dialog manages its own display).
- On success: marks as inited, resolves the promise, auto-shows consent if first visit (no stored status), shows SDK notification for 10 seconds.
- On failure: rejects the promise with the error message.

---

### `BrightSDK.enable(skipConsent)` → Promise

Opt the user in to BrightSDK.

- `skipConsent = true`: Directly calls `brd_api.external_opt_in()` without showing a dialog.
- `skipConsent = false` (default): Shows the consent dialog first.

```js
await BrightSDK.enable(true); // programmatic opt-in, no dialog
```

---

### `BrightSDK.disable()` → Promise

Opt the user out of BrightSDK. Calls `brd_api.opt_out()`. Updates localStorage status to `'disabled'`.

```js
await BrightSDK.disable();
```

---

### `BrightSDK.showConsent()` → Promise

Show the consent dialog.

- If an external dialog (`ConsentModule`) was created: calls `dialog.show(currentStatus)`.
- If `simple_opt_out` is set: dispatches keyboard event `keyCode: 53` (key `5`) to trigger SDK's own opt-out flow.
- Otherwise: calls `brd_api.show_consent()`.

```js
await BrightSDK.showConsent();
```

---

### `BrightSDK.getStatus()` → string | null

Returns the current consent status from `localStorage`:
- `'enabled'` — consent granted
- `'disabled'` — consent denied
- `null` — not yet set

```js
const s = BrightSDK.getStatus(); // 'enabled' | 'disabled' | null
```

---

### `BrightSDK.getStatusObject()` → Promise

Returns the raw status object from `brd_api.get_status()`, which includes the `consent` property.

```js
const obj = await BrightSDK.getStatusObject();
console.log(obj.consent); // true | false | null
```

---

### `BrightSDK.isEnabled()` → boolean

Shorthand for `getStatus() === 'enabled'`.

---

### `BrightSDK.isInited()` → boolean

Returns `true` after a successful `init()` call.

---

### `BrightSDK.createDialog(settings)`

Manually create the external consent dialog. Called automatically by `init()` when `external_consent_options` is provided. Requires `window.ConsentModule` to be loaded.

```js
BrightSDK.createDialog({
    lang: 'de',
    external_consent_options: [
        'my-dialog-id',
        { onAccept: () => {}, onDecline: () => {}, onShow: () => {}, onClose: () => {} }
    ]
});
```

Wires up `onAccept` → `BrightSDK.enable(true)`, `onDecline` → `BrightSDK.disable()`. Reports consent shown via `reportConsentShown()`.

If `simpleOptOut` is set in the dialog options, also registers a `keydown` listener for key `53` (key `5`) to re-open the dialog when it is closed.

---

### `BrightSDK.reportConsentShown()` → Promise

Calls `brd_api.consent_shown()` for analytics tracking. Called automatically when using external consent dialogs.

---

### `BrightSDK.showNotification(ms)`

Shows a notification banner (managed by the external consent dialog) for `ms` milliseconds. Called automatically with 10000ms after successful `init()`.

---

### `BrightSDK.getBrightApi(requireInit, intervalMs)` → Promise

Low-level: waits for `window.brd_api` to be available. Retries every `intervalMs` ms (default: 1000).

- `requireInit` (default: `true`) — also waits for `inited` flag
- Set `requireInit = false` during `init()` to avoid circular wait

---

## Consent Status Persistence

Status is stored in `localStorage` under the key `bright_sdk.status`:

| Value | Meaning |
|---|---|
| `'enabled'` | User opted in |
| `'disabled'` | User opted out |
| *(absent)* | First visit, no decision yet |

On page load, the stored status is read immediately. If no status is found and `skip_consent` is false, the consent dialog is shown after `init()` resolves.

---

## External Consent Dialog (`ConsentModule`)

When `external_consent_options` is provided, the helper delegates all consent UI to `ConsentModule` (a separate package). The helper:

1. Creates the dialog once via `ConsentModule.create(elementId, options)`.
2. Wraps `onAccept`/`onDecline`/`onShow`/`onClose` to hook into BrightSDK actions.
3. Shows a notification via `dialog.showNotification(ms)`.

The `ConsentModule` must be loaded before `BrightSDK.init()` is called.

---

## Tizen Platform

On Tizen OS, `brd_api.js` includes Tizen-specific code to start the background service. The helper itself is platform-agnostic but is used identically on both WebOS and Tizen. The `tizen_service_name` setting (default: `'Service'`) controls which Tizen service is launched.

---

## Mock (`brd_api.mock.js`)

For local development and testing, use the included mock:

```html
<!-- Load mock BEFORE the helper -->
<script src="brd_api.mock.js"></script>
<script src="brd_api.helper.min.js"></script>
```

The mock implements all `window.brd_api` methods:

| Method | Mock behavior |
|---|---|
| `init(settings, callbacks)` | Calls `on_success()` immediately |
| `show_consent(callbacks)` | Opens `confirm('Enable Bright SDK?')` dialog |
| `external_opt_in(callbacks)` | Sets `consent = true`, fires `on_status_change`, calls `on_success` |
| `opt_out(callbacks)` | Sets `consent = false`, fires `on_status_change`, calls `on_success` |
| `get_status()` | Returns `{ consent }` |
| `consent_shown()` | Logs a console warning |

All methods emit `console.warn('BrightSDK Mock: <method>')` so they are visible during testing.

---

## Build

```bash
npm install
npm run build   # runs tests + minifies + publishes to releases/
```

The build uses `release.config.js`:

```js
module.exports = {
  artifactsPattern: 'dist/*.min.js'
  // outputDir: 'releases' (default)
  // versionDirectories: ['major', 'minor', 'patch', 'latest'] (default)
  // generateManifest: true (default)
};
```

### Installing the local release-manager during development

```bash
bash install_local.sh
# equivalent to: npm install ../release-manager
```

---

## Testing

```bash
npm test               # run all Jest tests
jest --watch           # watch mode
jest --coverage        # with coverage report
```

Tests are in `test/brd_api.helper.test.js`. The test environment:
- Uses `jest-environment-jsdom` for a browser-like DOM.
- Loads `brd_api.mock.js` first, then `brd_api.helper.js`.
- Mocks `localStorage`, `window.tizen`, `window.confirm`, and `window.ConsentModule`.

---

## Dependencies

### Runtime
None — vanilla JavaScript with no runtime dependencies.

### Development
| Package | Purpose |
|---|---|
| `jest` | Test runner |
| `jest-environment-jsdom` | Browser-like DOM for tests |
| `jsdom` | DOM simulation |
| `terser` | JS minification |
| `@bright-sdk/tool-release-manager` | Versioned release artifact management |

---

## Versioning

Versions follow semver. The `releases/` directory always contains:

- `releases/latest/` — current stable build (used by `bright-sdk-integration` tool)
- `releases/v{major}/` — latest build for that major version
- `releases/v{major}.{minor}/` — latest build for that major.minor version
- `releases/v{major}.{minor}.{patch}/` — exact version

Each directory contains `brd_api.helper.min.js` and `manifest.json` (size, timestamp, version).
