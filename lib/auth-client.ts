import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";
import { API_URL } from "@/app/utils/constants";

export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    twoFactorClient(),
  ],
  fetchOptions: {
    credentials: 'include',
  },
});

// Export all available methods from Better Auth client
export const { 
  signIn, 
  signUp, 
  signOut, 
  useSession, 
  resetPassword, 
  forgetPassword, 
  getSession, 
  listSessions,
  sendVerificationEmail,
  updateUser,
  changePassword,
  revokeSession,
  revokeSessions,
  changeEmail,
} = authClient;

// Export 2FA methods
export const { twoFactor } = authClient;

