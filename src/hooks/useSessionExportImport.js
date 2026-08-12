import { useCallback, useMemo, useState } from "react";
import {
  downloadSessionBackup,
  parseSessionBackupJson,
  resolveImportedSessions,
} from "../utils/sessionExportImport.js";

export const useSessionExportImport = ({
  sessions = [],
  onImportSessions,
} = {}) => {
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const exportSessions = useCallback(
    (selectedSessions = sessions) => {
      setStatusMessage("");
      setImportError("");

      const exportable = Array.isArray(selectedSessions)
        ? selectedSessions
        : [selectedSessions].filter(Boolean);

      if (exportable.length === 0) {
        setImportError("No recovery sessions are available to export.");
        return null;
      }

      try {
        const result = downloadSessionBackup({ sessions: exportable });
        setStatusMessage(
          `Exported ${result.count} session${result.count === 1 ? "" : "s"} to ${result.filename}.`,
        );
        return result;
      } catch (error) {
        setImportError(error.message || "Unable to export recovery sessions.");
        return null;
      }
    },
    [sessions],
  );

  const parseImportText = useCallback((rawJson) => {
    setStatusMessage("");
    const result = parseSessionBackupJson(rawJson);
    if (!result.ok) {
      setImportPreview(null);
      setImportError(result.error);
      return result;
    }

    setImportError("");
    setImportPreview(result.backup);
    return result;
  }, []);

  const importSessions = useCallback(
    ({ selectedSessionIds = [], strategy = "skip" } = {}) => {
      if (!importPreview) {
        setImportError("No valid backup has been selected.");
        return null;
      }

      const selected =
        selectedSessionIds.length > 0
          ? importPreview.sessions.filter((session) =>
              selectedSessionIds.includes(session.sessionId),
            )
          : importPreview.sessions;

      const result = resolveImportedSessions({
        existingSessions: sessions,
        importedSessions: selected,
        strategy,
      });

      onImportSessions?.(result.sessions);
      setStatusMessage(
        `Imported ${result.restored.length} session${result.restored.length === 1 ? "" : "s"}.`,
      );
      setImportPreview(null);
      setImportError("");
      return result;
    },
    [importPreview, onImportSessions, sessions],
  );

  const clearImportPreview = useCallback(() => {
    setImportPreview(null);
    setImportError("");
  }, []);

  return useMemo(
    () => ({
      exportSessions,
      parseImportText,
      importSessions,
      clearImportPreview,
      importPreview,
      importError,
      statusMessage,
    }),
    [
      clearImportPreview,
      exportSessions,
      importError,
      importPreview,
      importSessions,
      parseImportText,
      statusMessage,
    ],
  );
};

export default useSessionExportImport;
