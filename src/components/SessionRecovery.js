import { useState, useEffect, useRef } from 'react';
import { useSessionRecovery } from '../context/SessionRecoveryContext';
import { Wifi, WifiOff, RefreshCw, X, CheckCircle, AlertCircle } from 'lucide-react';
import useSessionExportImport from '../hooks/useSessionExportImport';

const SessionRecovery = () => {
  // 🔥 FIX: Added fallback empty object to prevent TypeError if context is missing in tests
  const {
    isOnline,
    isReconnecting,
    showRecoveryPrompt,
    restoreSession,
    dismissRecoveryPrompt,
    clearSession,
    sessionData,
    visibleRecoverySessions = [],
    recoverySessionSearchQuery = "",
    setRecoverySessionSearchQuery,
    hasRecoverySessions,
    isCloudSyncing,
    restoreRecoverySessionById,
    deleteRecoverySessionById,
    renameRecoverySessionById,
    importRecoverySessions,
  } = useSessionRecovery() || {};

  const [isRestoring, setIsRestoring] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [renamingSessionId, setRenamingSessionId] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [selectedExportIds, setSelectedExportIds] = useState([]);
  const [selectedImportIds, setSelectedImportIds] = useState([]);
  const [importStrategy, setImportStrategy] = useState("skip");
  const prevOnlineRef = useRef(isOnline);
  const {
    exportSessions,
    parseImportText,
    importSessions,
    clearImportPreview,
    importPreview,
    importError,
    statusMessage,
  } = useSessionExportImport({
    sessions: visibleRecoverySessions,
    onImportSessions: importRecoverySessions,
  });
  
  // 🔥 FIX: SSR Hydration guard to prevent Date.now() mismatches between server and client
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!prevOnlineRef.current && isOnline) {
      setShowOnlineToast(true);
      const timer = setTimeout(() => {
        setShowOnlineToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      // 🔥 FIX: Added missing 'await' to prevent race conditions and dispatching raw Promises
      const session = await restoreSession?.();
      if (session) {
        // 🔥 FIX: Ensure window exists before dispatching (SSR safety)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sessionRestored', { detail: session }));
        }
        dismissRecoveryPrompt?.();
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDismiss = () => {
    clearSession?.();
    dismissRecoveryPrompt?.();
  };

  const handleManagedRestore = async (sessionId) => {
    setIsRestoring(true);
    try {
      const session = await restoreRecoverySessionById?.(sessionId);
      if (session && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sessionRestored', { detail: session.draftData || session }));
        window.dispatchEvent(new CustomEvent('cloudSessionRestored', { detail: session }));
      }
      dismissRecoveryPrompt?.();
    } catch (error) {
      console.error('Failed to restore cloud session:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  const startRename = (session) => {
    setRenamingSessionId(session.sessionId);
    setRenameValue(session.name || "");
  };

  const saveRename = (sessionId) => {
    renameRecoverySessionById?.(sessionId, renameValue);
    setRenamingSessionId("");
    setRenameValue("");
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = parseImportText(await file.text());
    if (result.ok) {
      setSelectedImportIds(result.sessions.map((session) => session.sessionId));
    }
    event.target.value = "";
  };

  const toggleImportSelection = (sessionId) => {
    setSelectedImportIds((current) =>
      current.includes(sessionId)
        ? current.filter((id) => id !== sessionId)
        : [...current, sessionId],
    );
  };

  const toggleExportSelection = (sessionId) => {
    setSelectedExportIds((current) =>
      current.includes(sessionId)
        ? current.filter((id) => id !== sessionId)
        : [...current, sessionId],
    );
  };

  const handleExportSelected = () => {
    const selectedSessions = visibleRecoverySessions.filter((session) =>
      selectedExportIds.includes(session.sessionId),
    );
    exportSessions(selectedSessions);
  };

  const handleImportSelected = () => {
    importSessions({
      selectedSessionIds: selectedImportIds,
      strategy: importStrategy,
    });
    setSelectedImportIds([]);
  };

  // 🔥 FIX: Do not render dynamic UI until hydration is complete to prevent SSR crashes
  if (!isMounted) return null;

  if (!isOnline && !showRecoveryPrompt) {
    return (
      <div className="fixed bottom-4 right-4 z-[45] animate-slide-up">
        <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <WifiOff size={20} className="animate-pulse" />
          <div>
            <p className="font-semibold text-sm">You&apos;re offline</p>
            <p className="text-xs opacity-90">Changes will be saved locally</p>
          </div>
        </div>
      </div>
    );
  }

  if (isReconnecting && !showRecoveryPrompt) {
    return (
      <div className="fixed bottom-4 right-4 z-[45] animate-slide-up">
        <div className="bg-yellow-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <RefreshCw size={20} className="animate-spin" />
          <div>
            <p className="font-semibold text-sm">Reconnecting...</p>
            <p className="text-xs opacity-90">Attempting to restore connection</p>
          </div>
        </div>
      </div>
    );
  }

  if (isOnline && showOnlineToast && !showRecoveryPrompt) {
    return (
      <div className="fixed bottom-4 right-4 z-[45] animate-slide-up">
        <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <Wifi size={20} />
          <div>
            <p className="font-semibold text-sm">You&apos;re back online</p>
            <p className="text-xs opacity-90">Connection restored</p>
          </div>
        </div>
      </div>
    );
  }

  if (showRecoveryPrompt && hasRecoverySessions) {
    const mostRecent = visibleRecoverySessions[0];

    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Recovery Sessions
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                We found {visibleRecoverySessions.length} recoverable draft{visibleRecoverySessions.length === 1 ? '' : 's'} across local and cloud storage.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center mb-4">
                <input
                  type="search"
                  value={recoverySessionSearchQuery}
                  onChange={(event) => setRecoverySessionSearchQuery?.(event.target.value)}
                  placeholder="Search recovery sessions"
                  className="flex-1 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
                />
                {mostRecent && (
                  <button
                    type="button"
                    onClick={() => handleManagedRestore(mostRecent.sessionId)}
                    disabled={isRestoring || isCloudSyncing}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Continue Latest
                  </button>
                )}
              </div>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => exportSessions(visibleRecoverySessions)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Export All
                </button>
                <button
                  type="button"
                  onClick={handleExportSelected}
                  disabled={selectedExportIds.length === 0}
                  className="bg-emerald-100 dark:bg-emerald-900/50 hover:bg-emerald-200 dark:hover:bg-emerald-900 disabled:bg-gray-100 disabled:text-gray-400 text-emerald-800 dark:text-emerald-100 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Export Selected
                </button>
                <label className="cursor-pointer bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors">
                  Import Sessions
                  <input
                    type="file"
                    accept="application/json,.json"
                    onChange={handleImportFile}
                    className="sr-only"
                  />
                </label>
              </div>
              {(statusMessage || importError) && (
                <p className={`mb-3 rounded-lg px-3 py-2 text-sm ${importError ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'}`}>
                  {importError || statusMessage}
                </p>
              )}
              {importPreview && (
                <div className="mb-4 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-100">
                        Previewing {importPreview.sessions.length} imported session{importPreview.sessions.length === 1 ? '' : 's'}
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Exported {new Date(importPreview.exportedAt).toLocaleString()}
                      </p>
                    </div>
                    <select
                      value={importStrategy}
                      onChange={(event) => setImportStrategy(event.target.value)}
                      className="rounded-md border border-blue-200 bg-white px-2 py-1 text-sm text-blue-950 dark:border-blue-900 dark:bg-slate-900 dark:text-blue-100"
                    >
                      <option value="skip">Skip duplicates</option>
                      <option value="replace">Replace duplicates</option>
                      <option value="keep-both">Keep both copies</option>
                      <option value="rename">Rename imported</option>
                    </select>
                  </div>
                  <div className="mt-3 max-h-40 space-y-2 overflow-y-auto">
                    {importPreview.sessions.map((session) => (
                      <label key={session.sessionId} className="flex items-center gap-2 text-sm text-blue-950 dark:text-blue-100">
                        <input
                          type="checkbox"
                          checked={selectedImportIds.includes(session.sessionId)}
                          onChange={() => toggleImportSelection(session.sessionId)}
                        />
                        <span className="truncate">{session.name}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={handleImportSelected}
                      disabled={selectedImportIds.length === 0}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Import Selected
                    </button>
                    <button
                      type="button"
                      onClick={clearImportPreview}
                      className="bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-200 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {visibleRecoverySessions.map((session) => {
                  const updated = new Date(session.updatedAt || session.lastUpdated);
                  const label = session.type?.replace(/-/g, ' ') || 'draft';
                  const isRenaming = renamingSessionId === session.sessionId;

                  return (
                    <div key={session.sessionId} className="rounded-lg border border-gray-200 dark:border-slate-700 p-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={selectedExportIds.includes(session.sessionId)}
                            onChange={() => toggleExportSelection(session.sessionId)}
                            className="mt-1"
                            aria-label={`Select ${session.name} for export`}
                          />
                          <div className="min-w-0">
                          {isRenaming ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={renameValue}
                                onChange={(event) => setRenameValue(event.target.value)}
                                className="min-w-0 rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-sm text-gray-900 dark:text-white"
                              />
                              <button
                                type="button"
                                onClick={() => saveRename(session.sessionId)}
                                className="text-sm font-semibold text-blue-600 dark:text-blue-400"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <p className="font-semibold text-gray-900 dark:text-white truncate">{session.name}</p>
                          )}
                          <p className="capitalize text-xs text-gray-500 dark:text-gray-400">{label} • {session.source || 'local'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Updated {Number.isNaN(updated.getTime()) ? 'recently' : updated.toLocaleString()}
                          </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleManagedRestore(session.sessionId)}
                            disabled={isRestoring || isCloudSyncing}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Restore
                          </button>
                          <button
                            type="button"
                            onClick={() => exportSessions([session])}
                            className="bg-emerald-100 dark:bg-emerald-900/50 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-100 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Export
                          </button>
                          <button
                            type="button"
                            onClick={() => startRename(session)}
                            className="bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRecoverySessionById?.(session.sessionId)}
                            className="bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={dismissRecoveryPrompt}
                className="mt-4 text-sm font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showRecoveryPrompt && sessionData) {
    const isValidTimestamp =
      sessionData &&
      sessionData.timestamp &&
      typeof sessionData.timestamp === 'number' &&
      !isNaN(sessionData.timestamp);

    if (!isValidTimestamp) return null;

    // 🔥 FIX: Added Math.max(0, ...) to prevent negative minutes if user's clock is skewed
    const timeSinceSession = Math.max(0, Math.floor(
      (Date.now() - sessionData.timestamp) / 1000 / 60
    ));

    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Resume where you left off?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                We found a session from {timeSinceSession === 0 ? 'just now' : `${timeSinceSession} minute${timeSinceSession > 1 ? 's' : ''} ago`}.
                Would you like to restore your previous activity?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleRestore}
                  disabled={isRestoring}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  aria-label="Restore the previous session"
                >
                  {isRestoring ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Restoring...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Restore Session
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  aria-label="Start a fresh session"
                >
                  <X size={16} />
                  Start Fresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SessionRecovery;
