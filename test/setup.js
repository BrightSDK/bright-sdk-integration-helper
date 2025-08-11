global.localStorage = {
    store: {},
    getItem(key) { return this.store[key] || null; },
    setItem(key, value) { this.store[key] = value; },
    removeItem(key) { delete this.store[key]; },
};

global.tizen = {
    application: {
        getCurrentApplication: () => ({
            appInfo: { packageId: 'test.pkg' }
        }),
        launchAppControl: (appControl, serviceId, success, error) => success()
    },
    ApplicationControlData: function (key, value) {
        this.key = key;
        this.value = value;
    },
    ApplicationControl: function (operation, uri, mime, category, data) {
        this.operation = operation;
        this.uri = uri;
        this.mime = mime;
        this.category = category;
        this.data = data;
    }
};

global.ConsentModule = {
    create: jest.fn(() => ({
        show: jest.fn(),
        showNotification: jest.fn()
    }))
};

// Mock global.confirm for the mock's show_consent method
global.confirm = jest.fn(() => true);

// Ensure window object is available
global.window = global;