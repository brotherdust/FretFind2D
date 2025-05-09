/**
 * jQuery Browser Plugin
 * Adds back deprecated $.browser functionality for plugins that still use it
 */
(function($) {
    // Browser detection code from jQuery 1.8.3
    var ua = navigator.userAgent.toLowerCase();
    var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
        /(webkit)[ \/]([\w.]+)/.exec(ua) ||
        /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
        /(msie) ([\w.]+)/.exec(ua) ||
        ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
        [];
    
    // Add browser object if it doesn't exist
    if (!$.browser) {
        $.browser = {};
    }
    
    if (match[1]) {
        $.browser[match[1]] = true;
        $.browser.version = match[2] || "0";
    }
    
    // Add msie detection for IE 11+
    if (navigator.userAgent.match(/Trident\/7\./)) {
        $.browser.msie = true;
        $.browser.version = "11.0";
    }
})(jQuery);
