/**
 * DeviceRegistrationCard.jsx
 *
 * Component for registering a FIDO2/WebAuthn credential (passkey) for ticket authentication.
 * This binds the ticket to the user's device, enabling cryptographic signature verification
 * during check-in to prevent ticket cloning and fraud.
 *
 * Props:
 *   ticketId       {string}  - The ticket ID to associate with the credential
 *   userEmail      {string}  - The user's email for passkey registration
 *   onSuccess      {function} - Callback when registration is successful
 *   onError        {function} - Callback when registration fails
 *   isLoading      {boolean}  - Whether a registration is in progress
 *   className      {string}   - Additional CSS classes for the container
 */

import { useState, useCallback } from "react";
import { Fingerprint, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

/**
 * Decode Base64 URL-safe string to Uint8Array
 * @param {string} base64Url - URL-safe Base64 string
 * @returns {Uint8Array} - Decoded Uint8Array
 */
function base64UrlToArrayBuffer(base64Url) {
  // Convert URL-safe Base64 to standard Base64
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (base64.length % 4)) % 4;
  const paddedBase64 = base64 + "=".repeat(padLength);
  
  // Decode to binary string
  const binaryString = window.atob(paddedBase64);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes;
}

/**
 * Encode ArrayBuffer to Base64 URL-safe string
 * @param {ArrayBuffer} buffer - ArrayBuffer to encode
 * @returns {string} - URL-safe Base64 string
 */
function arrayBufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binaryString = "";
  
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  
  // Convert to standard Base64
  const base64 = window.btoa(binaryString);
  
  // Convert to URL-safe Base64
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export default function DeviceRegistrationCard({
  ticketId,
  userEmail,
  onSuccess,
  onError,
  isLoading: externalLoading = false,
  className = "",
}) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [challenge, setChallenge] = useState(null);

  const isLoading = externalLoading || isRegistering;

  /**
   * Generate a registration challenge from the backend
   */
  const generateChallenge = useCallback(async () => {
    try {
      setError(null);
      setIsRegistering(true);
      setSuccess(false);

      const response = await fetch("/api/auth/webauthn/register-challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setChallenge(data);
      return data;
    } catch (err) {
      setError(err.message || "Failed to generate registration challenge");
      if (onError) onError(err);
      return null;
    } finally {
      setIsRegistering(false);
    }
  }, [onError]);

  /**
   * Register the WebAuthn credential with the browser
   */
  const registerCredential = useCallback(async () => {
    if (!challenge) {
      const challengeData = await generateChallenge();
      if (!challengeData) return;
    }

    try {
      setIsRegistering(true);
      setError(null);

      // Prepare the challenge for WebAuthn
      const challengeBuffer = base64UrlToArrayBuffer(challenge.challenge);

      // Public key credential creation options
      const publicKeyCredentialCreationOptions = {
        challenge: challengeBuffer,
        rp: {
          name: challenge.rpName || "Eventra Platform",
          id: window.location.hostname,
        },
        user: {
          id: new Uint8Array(16), // Placeholder user ID - should be unique per user
          name: userEmail,
          displayName: userEmail,
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          requireResidentKey: true,
          userVerification: "required",
        },
        timeout: challenge.timeout || 60000,
      };

      // Use navigator.credentials.create to register the credential
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      });

      if (!credential) {
        throw new Error("No credential returned from WebAuthn API");
      }

      // Prepare the credential for verification
      const credentialData = {
        id: credential.id,
        rawId: arrayBufferToBase64Url(credential.rawId),
        type: credential.type,
        response: {
          attestationObject: arrayBufferToBase64Url(
            credential.response.attestationObject
          ),
          clientDataJSON: arrayBufferToBase64Url(
            credential.response.clientDataJSON
          ),
        },
      };

      // Send the credential to the backend for verification and storage
      const verifyResponse = await fetch("/api/auth/webauthn/verify-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
        body: JSON.stringify({
          credentialId: credential.id,
          userEmail: userEmail,
          publicKey: "", // Will be extracted from attestation on backend
          challenge: challenge.challenge,
          credentialData: credentialData,
          ticketId: ticketId,
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${verifyResponse.status}`
        );
      }

      const result = await verifyResponse.json();

      // Mark as successful
      setSuccess(true);
      setIsRegistering(false);

      if (onSuccess) {
        onSuccess(result, credential);
      }
    } catch (err) {
      setError(err.message || "Failed to register WebAuthn credential");
      setIsRegistering(false);
      if (onError) onError(err);
    }
  }, [challenge, userEmail, ticketId, onSuccess, onError]);

  /**
   * Check if WebAuthn is supported in the current browser
   */
  const isWebAuthnSupported = useCallback(() => {
    return (
      window.PublicKeyCredential !== undefined &&
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== undefined
    );
  }, []);

  /**
   * Check WebAuthn support and return appropriate state
   */
  const checkWebAuthnSupport = useCallback(async () => {
    if (!isWebAuthnSupported()) {
      setError("WebAuthn is not supported in this browser");
      return false;
    }

    try {
      const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!isAvailable) {
        setError(
          "Platform authenticator not available. Please use a device with biometric authentication (Face ID, Touch ID, Windows Hello, etc.)"
        );
        return false;
      }
      return true;
    } catch (err) {
      setError(`Failed to check WebAuthn support: ${err.message}`);
      return false;
    }
  }, [isWebAuthnSupported]);

  /**
   * Handle the registration button click
   */
  const handleRegisterClick = useCallback(async () => {
    const isSupported = await checkWebAuthnSupport();
    if (!isSupported) return;

    await registerCredential();
  }, [checkWebAuthnSupport, registerCredential]);

  /**
   * Reset the component state (useful for retrying)
   */
  const handleRetry = useCallback(() => {
    setError(null);
    setSuccess(false);
    setChallenge(null);
  }, []);

  // Success state
  if (success) {
    return (
      <div
        className={`bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">
              Device Registered Successfully
            </h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
              Your ticket is now bound to this device. You can use biometric
              authentication to verify your ticket at the event entrance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 ${className}`}
      role="region"
      aria-label="WebAuthn Device Registration"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
          <Fingerprint className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">
            Register Device for Ticket Authentication
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Bind your ticket to this device using WebAuthn (Face ID, Touch ID,
            Windows Hello, etc.) to prevent ticket cloning and enable secure
            check-in.
          </p>

          {error && (
            <div
              className="flex items-start gap-2 mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-600 dark:text-red-400">
                <p className="font-medium">{error}</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline text-xs mt-1"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-4">
            <button
              type="button"
              onClick={handleRegisterClick}
              disabled={isLoading || success}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-sm"
              aria-busy={isLoading}
              aria-label={
                isLoading
                  ? "Registering WebAuthn credential"
                  : "Register WebAuthn credential"
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4" />
                  Register Device
                </>
              )}
            </button>

            <button
              type="button"
              onClick={async () => {
                const isSupported = await checkWebAuthnSupport();
                if (!isSupported) {
                  setError(
                    "WebAuthn is not supported or available on this device"
                  );
                } else {
                  setError(null);
                }
              }}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
            >
              Check Support
            </button>
          </div>

          {ticketId && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
              Ticket ID: {ticketId}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
