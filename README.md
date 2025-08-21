# BrightSDK Integration Helper

A JavaScript utility library that simplifies the integration of BrightSDK into web applications and Web-based apps.
This helper provides a unified API for managing consent, handling different platforms, and providing mock implementations for testing.

## Features

- **Cross-platform support**: Works on web browsers and Tizen OS
- **Consent management**: Simplified consent dialog handling with customizable options
- **Mock implementation**: Built-in mock for testing and development
- **Promise-based API**: Modern async/await compatible interface
- **Flexible configuration**: Support for various integration patterns

## Installation

```bash
npm install
```

## Usage

### Basic Integration

```javascript
// Include the helper in your HTML
<script src="path/to/brd_api.helper.js"></script>

// Initialize BrightSDK
BrightSDK.init({
    debug: true,
    // your configuration options
}).then(() => {
    console.log('BrightSDK initialized successfully');
});
```

### Configuration Options

```javascript
const settings = {
    debug: true,                    // Enable debug logging
    verbose: false,                 // Enable verbose error logging
    simple_opt_out: false,         // Enable simple opt-out with key '5'
    skip_consent: false,           // Skip initial consent dialog
    tizen_service_name: 'Service', // Tizen service name
    on_status_change: (consent) => {
        console.log('Consent status changed:', consent);
    },
    external_consent_options: [
        'consent-dialog-id',
        {
            onAccept: () => console.log('User accepted'),
            onDecline: () => console.log('User declined'),
            onShow: () => console.log('Dialog shown'),
            onClose: () => console.log('Dialog closed')
        }
    ]
};

BrightSDK.init(settings);
```

### API Methods

#### `BrightSDK.init(settings)`
Initialize the BrightSDK with the provided settings.

**Parameters:**
- `settings` (Object): Configuration object

**Returns:** Promise that resolves when initialization is complete

#### `BrightSDK.enable(skipConsent)`
Enable consent for the BrightSDK.

**Parameters:**
- `skipConsent` (boolean): If true, skips the consent dialog

**Returns:** Promise that resolves when enabled

#### `BrightSDK.disable()`
Disable consent and opt out of the BrightSDK.

**Returns:** Promise that resolves when disabled

#### `BrightSDK.showConsent()`
Display the consent dialog to the user.

**Returns:** Promise that resolves when dialog is handled

#### `BrightSDK.getStatus()`
Get the current consent status.

**Returns:** String - 'enabled', 'disabled', or null

#### `BrightSDK.getStatusObject()`
Get the detailed status object from the underlying API.

**Returns:** Promise that resolves with status object

#### `BrightSDK.isEnabled()`
Check if consent is currently enabled.

**Returns:** Boolean

#### `BrightSDK.isInited()`
Check if the SDK has been initialized.

**Returns:** Boolean

#### `BrightSDK.createDialog(settings)`
Create a custom consent dialog using the ConsentModule.

**Parameters:**
- `settings` (Object): Settings object containing external_consent_options

#### `BrightSDK.reportConsentShown()`
Report that a consent dialog was shown (for analytics).

**Returns:** Promise

#### `BrightSDK.showNotification(ms)`
Show a notification for the specified duration.

**Parameters:**
- `ms` (number): Duration in milliseconds

## Mock Implementation

For testing and development, use the included mock:

```javascript
// Include the mock before the helper
<script src="path/to/brd_api.mock.js"></script>
<script src="path/to/brd_api.helper.js"></script>
```

The mock provides:
- Console warnings for all API calls
- Simulated consent flow with browser `confirm()` dialog
- Automatic status change callbacks
- All API methods with proper callback handling

## Tizen Integration

For Tizen apps, the helper automatically detects the platform and:
- Starts the required Tizen service
- Handles Tizen-specific application controls
- Manages package ID resolution

### Tizen Service Configuration

```javascript
BrightSDK.init({
    tizen_service_name: 'YourServiceName', // Default: 'Service'
    // other options...
});
```

## Testing

The project includes comprehensive Jest tests:

```bash
npm test
```

### Test Structure

- `test/setup.js` - Test environment configuration
- `test/brd_api.helper.test.js` - Main test suite
- Mock implementations for all dependencies

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
jest --watch

# Run with coverage
jest --coverage
```

## Build

Build the minified version:

```bash
npm run build
```

This will:
1. Run the test suite
2. Create a minified version using Terser

## Browser Compatibility

- Modern browsers with ES6 Promise support
- Tizen OS 3.0+
- Node.js environments (for testing)

## Dependencies

### Runtime
- None (vanilla JavaScript)

### Development
- Jest (testing framework)
- Terser (minification)
- jsdom (DOM simulation for tests)

## Error Handling

The helper includes robust error handling:

```javascript
BrightSDK.init(settings)
    .then(() => {
        console.log('Success');
    })
    .catch((error) => {
        console.error('Initialization failed:', error);
    });
```

## Debugging

Enable debug mode for detailed logging:

```javascript
BrightSDK.init({
    debug: true,
    verbose: true, // Also enable error logging
    // other settings...
});
```

## Platform Detection

The helper automatically detects:
- Tizen OS (via `window.tizen`)
- Web browsers
- Test environments

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

ISC License

## API Reference

### Event Callbacks

All callbacks receive appropriate parameters:

```javascript
{
    on_status_change: (consent) => {
        // consent: boolean or null
    },
    onAccept: () => {
        // User accepted consent
    },
    onDecline: () => {
        // User declined consent
    },
    onShow: () => {
        // Dialog was shown
    },
    onClose: () => {
        // Dialog was closed
    }
}
```

### Status Values

- `null` - Unknown/not initialized
- `'enabled'` - Consent granted
- `'disabled'` - Consent denied/opted out

## Troubleshooting

### Common Issues

1. **"BRD API not available"** - Ensure the underlying BrightSDK is loaded
2. **Infinite retry loop** - Check that `window.brd_api` is properly set up
3. **Tizen service not starting** - Verify service name and package configuration

### Debug Steps

1. Enable debug mode
2. Check browser console for detailed logs
3. Verify all required scripts are loaded
4. Test with the mock implementation first
