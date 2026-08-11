/**
 * registrationReconciliation.js
 *
 * Coordinates replacing a locally-fabricated offline registration placeholder
 * with the authoritative server record once the offline queue replays.
 *
 * The offline path (src/Pages/Events/EventRegistration.js) registers with a
 * temporary client-generated id because the server was unreachable. When the
 * queued REGISTER_EVENT action replays, the replay response carries the real
 * server-issued registrationId + qrToken. The replay loops
 * (src/hooks/useOfflineSync.js, src/utils/offlineQueue.js) dispatch
 * REGISTRATION_SYNCED_EVENT, and MyEventsContext listens and patches the
 * matching local entry so the ticket reflects the authoritative record.
 */

export const REGISTRATION_SYNCED_EVENT = "eventra-offline-registration-synced";

export const dispatchRegistrationSynced = (eventId, registrationId, qrToken) => {
  if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") {
    return;
  }
  window.dispatchEvent(
    new CustomEvent(REGISTRATION_SYNCED_EVENT, {
      detail: { eventId, registrationId, qrToken: qrToken || "" },
    })
  );
};

/**
 * Extracts the server-issued registration details from a replay response body
 * and dispatches the reconciliation event when present. No-op when the body
 * has no registrationId (e.g. older backend without the fields).
 */
export const reconcileReplayResponse = (actionType, eventId, responseData) => {
  if (actionType !== "REGISTER_EVENT") return;
  const data = responseData || {};
  if (!data.registrationId) return;
  dispatchRegistrationSynced(eventId, data.registrationId, data.qrToken || "");
};
