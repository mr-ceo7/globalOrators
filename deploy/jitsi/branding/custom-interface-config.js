/**
 * Global Orators Custom Interface Configuration for Jitsi Meet
 * Strips all 8x8 watermarks, feedback popups, and upsell banners.
 * Sets clean editorial theme, solid contrast, and debate-oriented controls.
 */

var interfaceConfig = {
    APP_NAME: 'Global Orators Debate Chamber',
    NATIVE_APP_NAME: 'Global Orators',
    PROVIDER_NAME: 'Global Orators Academy',

    // Completely disable all 8x8 / Jitsi watermarks and promotional links
    SHOW_JITSI_WATERMARK: false,
    SHOW_WATERMARK_FOR_GUESTS: false,
    SHOW_BRAND_WATERMARK: false,
    BRAND_WATERMARK_LINK: 'https://globalorators.com',
    JITSI_WATERMARK_LINK: 'https://globalorators.com',
    DEFAULT_LOGO_URL: '',
    DEFAULT_WELCOME_PAGE_LOGO_URL: '',
    SHOW_POWERED_BY: false,
    SHOW_PROMOTIONAL_CLOSE_PAGE: false,
    SHOW_CHROME_EXTENSION_BANNER: false,
    ENABLE_FEEDBACK_ANIMATION: false,
    DISABLE_PRESENCE_STATUS: false,
    DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,

    // Default Language: English
    DEFAULT_LANGUAGE: 'en',

    // Focused Toolbar for Parliamentary Debate & Speech Coaching
    TOOLBAR_BUTTONS: [
        'microphone',
        'camera',
        'closedcaptions',
        'desktop',        // Screen sharing for debate motions/briefs
        'fullscreen',
        'fodeviceselection',
        'hangup',
        'profile',
        'chat',
        'raisehand',      // Ideal for Points of Information (POIs)
        'videoquality',
        'filmstrip',
        'tileview',
        'select-background',
        'settings'
    ],

    SETTINGS_SECTIONS: [
        'devices',
        'language',
        'profile'
    ],

    // Mobile web experience
    DISABLE_DEEP_LINKING: true,
    MOBILE_APP_PROMO: false,

    // Brand theme accent colors
    MAIN_TOOLBAR_BUTTONS_THRESHOLD: 6,
    DISABLE_FOCUS_INDICATOR: false,
    INDICATOR_START_RATIO: 0.14
};
