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
});