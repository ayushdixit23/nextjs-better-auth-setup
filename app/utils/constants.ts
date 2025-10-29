export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
export const DEFAULT_REDIRECT_PATH = "/";

export const DEFAULT_RESTRICTED_REDIRECT_PATH = "/login";

export const RESTRICTED_PATHS = [
    "/login",
    "/signup",
    "/reset-password",
    "/forgot-password",
    "/verify-email",
    "/2fa-verification"
];
