/**
 * Typed environment variable access.
 *
 * 12-Factor App — Factor III: Config
 * All config must come from the environment, never hardcoded.
 */

function optionalEnv(key: string, fallback = ""): string {
    return import.meta.env[key] ?? process.env?.[key] ?? fallback;
}

export const env = {
    /** Canonical public URL */
    SITE_URL: optionalEnv("SITE_URL", "https://harshit.systems"),

    /** Appwrite project endpoint */
    APPWRITE_ENDPOINT: optionalEnv("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1"),

    /** Appwrite project ID */
    APPWRITE_PROJECT_ID: optionalEnv("APPWRITE_PROJECT_ID"),

    /** Whether analytics collection is enabled */
    ANALYTICS_ENABLED: optionalEnv("ANALYTICS_ENABLED", "false") === "true",
} as const;
