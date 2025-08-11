(function(){
    var on_status_change;
    var consent;
    window.brd_api = window.brd_api || {
        init: (settings, callbacks={})=>{
            on_status_change = settings.on_status_change;
            console.warn('BrightSDK Mock: init');
            if (callbacks.on_success)
                callbacks.on_success();
        },
        opt_out: callbacks=>{
            console.warn('BrightSDK Mock: opt_out');
            consent = false;
            on_status_change();
            callbacks.on_success();
        },
        external_opt_in: callbacks=>{
            console.warn('BrightSDK Mock: external_opt_in');
            consent = true;
            on_status_change();
            callbacks.on_success();
        },
        consent_shown: ()=>{
            console.warn('BrightSDK Mock: consent_shown');
        },
        show_consent: callbacks=>{
            consent = confirm('Enable Bright SDK?');
            on_status_change();
            if (!consent)
                console.warn('BrightSDK Mock: opt_out from consent screen');
            callbacks.on_success();
        },
        get_status: ()=>({consent}),
    };
})();
