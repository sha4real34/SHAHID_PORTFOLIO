export const APP_CONFIG = {
    NAME: "Shahid Portfolio",
    DESC: "Mohammad Shahid Sajjad Pinjari - Full Stack Developer Portfolio",
    PREFIX: "shahid_v1_",
} as const;

export const STORAGE_KEYS = {
    LANGUAGE: `${APP_CONFIG.PREFIX}-language`,
} as const;

export const LOCALE_CONFIG = {
    DEFAULT: "en",
    SUPPORTED: ["en", "tr"] as const,
} as const;