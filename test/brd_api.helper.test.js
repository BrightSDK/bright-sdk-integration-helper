// LICENSE_CODE ZON

// Load the mock first to provide brd_api
require("../src/brd_api.mock.js");

// Then load BrightSDK module
require("../src/brd_api.helper.js");

describe("BrightSDK", () => {
    let BrightSDK;

    beforeAll(() => {
        BrightSDK = global.window.BrightSDK;
    });

    beforeEach(() => {
        // Clear localStorage
        global.localStorage.store = {};

        // Set up DOM element for dialog
        document.body.innerHTML = "<div id='consent-dialog'></div>";

        // Reset confirm mock
        jest.clearAllMocks();
    });    test("initializes successfully", async () => {
        await BrightSDK.init({ debug: true });
        expect(BrightSDK.isInited()).toBe(true);
    });

    test("enables consent", async () => {
        await BrightSDK.init({ debug: true });
        await BrightSDK.enable(true);
        expect(BrightSDK.getStatus()).toBe("enabled");
    });

    test("disables consent", async () => {
        await BrightSDK.init({ debug: true });
        await BrightSDK.disable();
        expect(BrightSDK.getStatus()).toBe("disabled");
    });

    test("shows consent dialog", async () => {
        global.confirm.mockReturnValue(true);
        await BrightSDK.init({ debug: true });
        await BrightSDK.showConsent();
        expect(global.confirm).toHaveBeenCalledWith('Enable Bright SDK?');
    });

    test("gets status object", async () => {
        await BrightSDK.init({ debug: true });
        const statusObject = await BrightSDK.getStatusObject();
        expect(statusObject).toHaveProperty('consent');
    });

    test("reports consent shown", async () => {
        await BrightSDK.init({ debug: true });
        // This should not throw an error
        await expect(BrightSDK.reportConsentShown()).resolves.toBeUndefined();
    });

    test("creates dialog with external consent options", async () => {
        const settings = {
            debug: true,
            lang: 'fr',
            external_consent_options: [
                'consent-dialog',
                {
                    onAccept: jest.fn(),
                    onDecline: jest.fn(),
                    onShow: jest.fn(),
                    onClose: jest.fn()
                }
            ]
        };

        await BrightSDK.init(settings);
        expect(global.ConsentModule.create).toHaveBeenCalled();
        const optionsArg = global.ConsentModule.create.mock.calls[0][1];
        expect(optionsArg.language).toBe('fr');
    });

    test("handles simple opt out", async () => {
        const settings = {
            debug: true,
            simple_opt_out: true
        };

        await BrightSDK.init(settings);
        await BrightSDK.showConsent();
        // Should resolve without calling confirm since simple_opt_out is true
        expect(global.confirm).not.toHaveBeenCalled();
    });

    test('waitForStatusChange resolves', async () => {
        // Should resolve even when there is no pending status change promise
        await expect(BrightSDK.waitForStatusChange()).resolves.toBeFalsy();
    });

    test('getBrightApi retries until brd_api becomes available', async () => {
        // Temporarily remove global brd_api to force retry logic
        const original_brd_api = global.window.brd_api;
        delete global.window.brd_api;

        // Start getBrightApi with small intervalMs and requireInit=false so it
        // retries only because brd_api is missing.
        const p = BrightSDK.getBrightApi(false, 1);

        // After a short delay restore brd_api so the retry can succeed
        await new Promise(resolve => setTimeout(resolve, 10));
        global.window.brd_api = original_brd_api;

        const result = await p;
        expect(result).toHaveProperty('get_status');
    });

    test('registers and unregisters simple opt out keyboard handler', async () => {
        // Reset module to get a fresh dialog state so createDialog runs
        jest.resetModules();
        // Reload mock and helper to recreate module-level state
        require('../src/brd_api.mock.js');
        require('../src/brd_api.helper.js');
        BrightSDK = global.window.BrightSDK;

        // Spy on add/remove event listener calls
        const addSpy = jest.spyOn(document, 'addEventListener');
        const removeSpy = jest.spyOn(document, 'removeEventListener');

        const settings = {
            debug: true,
            lang: 'en',
            external_consent_options: [
                'consent-dialog',
                {
                    simpleOptOut: true,
                    onAccept: jest.fn(),
                    onDecline: jest.fn(),
                    onShow: jest.fn(),
                    onClose: jest.fn()
                }
            ]
        };

        await BrightSDK.init(settings);
        expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function), {capture: true});

        const optionsArg = global.ConsentModule.create.mock.calls[global.ConsentModule.create.mock.calls.length-1][1];
        // Simulate showing the dialog which should unregister the keyboard handler
        optionsArg.onShow();
        expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function), {capture: true});

        addSpy.mockRestore();
        removeSpy.mockRestore();
    });
});