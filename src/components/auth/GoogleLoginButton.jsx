import { GoogleLogin } from "@react-oauth/google";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

/**
 * GoogleLoginButton
 *
 * Renders the Google One-Tap / Sign-In button provided by @react-oauth/google
 * and wires it to Eventra's authentication flow.
 *
 * How it works
 * ------------
 * 1. The user clicks "Sign in with Google" — Google returns a short-lived
 *    ID token (credential) to `onSuccess`.
 * 2. We hand the credential directly to `signInWithGoogle` (AuthContext),
 *    which POSTs it to `POST /api/auth/google` for server-side verification.
 * 3. The backend validates the token against Google's JWKS endpoint
 *    (aud, iss, exp, email_verified) and, on success, returns an
 *    Eventra-signed JWT + user profile.
 * 4. AuthContext persists the Eventra JWT and updates global auth state.
 * 5. We redirect the user to /dashboard.
 *
 * We intentionally do NOT decode the Google credential on the client side.
 * Client-side JWT decoding cannot verify the cryptographic signature and
 * must never be used as an authentication mechanism.
 */
const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const redirectPath =
    typeof from === "string"
      ? from
      : from?.pathname
        ? `${from.pathname}${from.search || ""}${from.hash || ""}`
        : "/dashboard";

  // signInWithGoogle handles the full backend exchange — no local decoding here
  const { signInWithGoogle, authRequest } = useAuth();

  /**
   * Called by @react-oauth/google when the user successfully authenticates.
   *
   * @param {{ credential: string }} credentialResponse - Object containing
   *   the raw Google ID token. We forward it to the backend unchanged.
   */
  const handleSuccess = async (credentialResponse) => {
    try {
      // Delegate entirely to AuthContext — single source of truth for the
      // backend exchange, session persistence, and role normalisation.
      await signInWithGoogle(credentialResponse.credential);

      // Navigate only after the session is fully established
      navigate(redirectPath, { replace: true });
    } catch (error) {
      // Show a user-friendly toast; the underlying error is already logged
      // by signInWithGoogle via the apiUtils interceptor.
      toast.error(
        error?.message ||
          "Google Sign-In failed. Please try again or use email/password."
      );
    }
  };

  /**
   * Called by @react-oauth/google when the sign-in flow fails (user closes
   * the popup, network error, etc.).  No credential is available, so we
   * just surface a toast.
   */
  const handleError = () => {
    toast.error("Google Sign-In was cancelled or failed. Please try again.");
  };

  if (authRequest.loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/50 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
        Signing In...
      </div>
    );
  }

  return <GoogleLogin onSuccess={handleSuccess} onError={handleError} />;
};

export default GoogleLoginButton;
