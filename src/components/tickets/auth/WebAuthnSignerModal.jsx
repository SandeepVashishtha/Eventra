/**
 * WebAuthnSignerModal.jsx
 *
 * Modal component for WebAuthn-based ticket signature verification during check-in.
 * This component requests a cryptographic signature from the user's device-bound
 * credential to verify ticket ownership and prevent fraud.
 *
 * Props:
 *   isOpen        {boolean}  - Whether the modal is open
 *   onClose       {function} - Callback to close the modal
 *   ticketId       {string}   - The ticket ID to verify
 *   challenge     {string}   - Server-generated challenge for signature
 *   onSuccess     {function} - Callback when signature verification succeeds
 *   onError       {function} - Callback when signature verification fails
 *   userEmail     {string}   - User email associated with the ticket
 *   className     {string}   - Additional CSS classes for the modal
 */

import { useState, useCallback, useEffect } from "react";
import { 
  Fingerprint, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  X 
} from "lucide-react";

/**
 * Decode Base64 URL-safe string to Uint8Array
 * @param {string} base64Url - URL-safe Base64 string
 * @returns {Uint8Array} - Decoded Uint8Array
 */
function base64UrlToArrayBuffer(base64Url) {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (base64.length % 4)) % 4;
  const paddedBase64 = base64 + "=".repeat(padLength);
  
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
  
  const base64 = window.btoa(binaryString);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

/**
 * Generate a random challenge for the WebAuthn assertion
 * @returns {string} - Base64 URL-safe encoded challenge
 */
function generateClientChallenge() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return arrayBufferToBase64Url(array);
}

export default function WebAuthnSignerModal({
  isOpen = false,
  onClose,
  ticketId,
  challenge: serverChallenge,
  onSuccess,
  onError,
  userEmail,
  className = "",
}) {
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [credentialId, setCredentialId] = useState(null);
  const [challenge, setChallenge] = useState(null);

  // Initialize with server challenge or generate a new one
  useEffect(() => {
    if (isOpen) {
      setChallenge(serverChallenge || generateClientChallenge());
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, serverChallenge]);

  /**
   * Close the modal
   */
  const handleClose = useCallback(() => {
    if (!isSigning) {
      setError(null);
      setSuccess(false);
      setCredentialId(null);
      if (onClose) onClose();
    }
  }, [isSigning, onClose]);

  /**
   * Handle overlay click to close modal
   */
  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget && !isSigning) {
        handleClose();
      }
    },
    [isSigning, handleClose]
  );

  /**
   * Handle Escape key to close modal
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isSigning) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSigning, handleClose]);

  /**
   * Check if WebAuthn is supported
   */
  const isWebAuthnSupported = useCallback(() => {
    return (
      window.PublicKeyCredential !== undefined &&
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== undefined
    );
  }, []);

  /**
   * Check WebAuthn support and availability
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
          "Platform authenticator not available. Please use a device with biometric authentication."
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
   * Request a signature from the WebAuthn credential
   */
  const requestSignature = useCallback(async () => {
    const isSupported = await checkWebAuthnSupport();
    if (!isSupported) return null;

    try {
      setIsSigning(true);
      setError(null);

      // Fetch available credentials for this user
      const credentialsResponse = await fetch(
        `/api/auth/webauthn/credentials?userEmail=${encodeURIComponent(userEmail)}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
          },
        }
      );

      if (!credentialsResponse.ok) {
        throw new Error("Failed to fetch WebAuthn credentials");
      }

      const credentialsData = await credentialsResponse.json();

      if (!credentialsData.credentials || credentialsData.credentials.length === 0) {
        throw new Error(
          "No WebAuthn credentials registered for this user. Please register a device first."
        );
      }

      // Use the first credential for now (in production, allow user to select)
      const cred = credentialsData.credentials[0];
      setCredentialId(cred.credentialId);

      // Prepare challenge
      const challengeBuffer = base64UrlToArrayBuffer(challenge);

      // Public key credential request options for assertion
      const publicKeyCredentialRequestOptions = {
        challenge: challengeBuffer,
        rpId: window.location.hostname,
        allowCredentials: credentialsData.credentials.map((c) => ({
          id: base64UrlToArrayBuffer(c.credentialId),
          type: "public-key",
        })),
        userVerification: "required",
        timeout: 60000,
      };

      // Request the signature assertion
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      if (!assertion) {
        throw new Error("No assertion returned from WebAuthn API");
      }

      // Prepare the assertion for verification
      const assertionData = {
        id: assertion.id,
        rawId: arrayBufferToBase64Url(assertion.rawId),
        type: assertion.type,
        response: {
          authenticatorData: arrayBufferToBase64Url(
            assertion.response.authenticatorData
          ),
          clientDataJSON: arrayBufferToBase64Url(
            assertion.response.clientDataJSON
          ),
          signature: arrayBufferToBase64Url(assertion.response.signature),
          userHandle: assertion.response.userHandle
            ? arrayBufferToBase64Url(assertion.response.userHandle)
            : null,
        },
      };

      setIsSigning(false);
      return { assertion, assertionData, credentialId: cred.credentialId };
    } catch (err) {
      setError(err.message || "Failed to request WebAuthn signature");
      setIsSigning(false);
      return null;
    }
  }, [challenge, userEmail, checkWebAuthnSupport]);

  /**
   * Verify the signature with the backend
   */
  const verifySignature = useCallback(
    async (assertionData, credentialId) => {
      try {
        setIsSigning(true);

        const response = await fetch("/api/tickets/verify-signature", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
          },
          body: JSON.stringify({
            ticketId: ticketId,
            challenge: challenge,
            credentialId: credentialId,
            assertionData: assertionData,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();
        setSuccess(true);
        setIsSigning(false);

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        setError(err.message || "Failed to verify WebAuthn signature");
        setIsSigning(false);
        if (onError) onError(err);
        return null;
      }
    },
    [ticketId, challenge, onSuccess, onError]
  );

  /**
   * Handle the sign button click
   */
  const handleSignClick = useCallback(async () => {
    const result = await requestSignature();
    if (result) {
      await verifySignature(result.assertionData, result.credentialId);
    }
  }, [requestSignature, verifySignature]);

  /**
   * Reset the component state
   */
  const handleRetry = useCallback(() => {
    setError(null);
    setSuccess(false);
    setCredentialId(null);
    setChallenge(serverChallenge || generateClientChallenge());
  }, [serverChallenge]);

  // Don't render if not open
  if (!isOpen) return null;

  // Success state - auto-close after 2 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        handleClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, handleClose]);

  if (success) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="status"
        aria-live="polite"
      >
        <div
          className={`bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-8 max-w-md w-full ${className}`}
          role="alert"
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-emerald-800 dark:text-emerald-200">
                Signature Verified
              </h2>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                Your ticket has been successfully verified using device-bound
                cryptographic authentication.
              </p>
              <p className="text-xs text-emerald-500 dark:text-emerald-500 mt-2">
                Welcome to the event!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="webauthn-signer-title"
      onClick={handleOverlayClick}
    >
      <div
        className={`bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl ${className}`}
        role="document"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Fingerprint className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2
                id="webauthn-signer-title"
                className="text-lg font-semibold text-slate-800 dark:text-slate-100"
              >
                Verify Ticket with WebAuthn
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Use your device authentication to verify your ticket
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSigning}
            className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4">
          {error && (
            <div
              className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-600 dark:text-red-400">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline text-sm mt-1"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
            <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
              Ticket Information
            </h3>
            <div className="space-y-2">
              {ticketId && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    Ticket ID:
                  </span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {ticketId}
                  </span>
                </div>
              )}
              {userEmail && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    Email:
                  </span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {userEmail}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  Method:
                </span>
                <span className="text-slate-800 dark:text-slate-200">
                  WebAuthn / FIDO2
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400">
            This request will use your device's biometric authentication (Face
            ID, Touch ID, Windows Hello, etc.) or platform authenticator to
            create a cryptographic signature that proves you own this ticket.
          </p>

          {/* Modal Footer */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={handleSignClick}
              disabled={isSigning}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-sm"
              aria-busy={isSigning}
              aria-label={isSigning ? "Verifying signature" : "Verify signature"}
            >
              {isSigning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5" />
                  Verify with Device
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleClose}
              disabled={isSigning}
              className="px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
