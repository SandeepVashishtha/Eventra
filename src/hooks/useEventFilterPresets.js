import { useCallback, useEffect, useState } from "react";
import {
  createFilterPreset,
  EVENT_FILTER_PRESETS_STORAGE_KEY,
  readFilterPresets,
  removeFilterPreset,
  renameFilterPreset,
  updateFilterPreset,
  writeFilterPresets,
} from "../utils/eventFilterPresets.js";

const createPresetId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `preset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const useEventFilterPresets = ({
  storageKey = EVENT_FILTER_PRESETS_STORAGE_KEY,
  storage = globalThis.localStorage,
} = {}) => {
  const [presets, setPresets] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setPresets(readFilterPresets(storage, storageKey));
  }, [storage, storageKey]);

  const persist = useCallback(
    (nextPresets) => {
      const persisted = writeFilterPresets(nextPresets, storage, storageKey);
      setPresets(persisted);
      return persisted;
    },
    [storage, storageKey]
  );

  const savePreset = useCallback(
    (name, filters) => {
      const result = createFilterPreset(presets, name, filters, createPresetId);
      setError(result.error || "");
      if (!result.error) {
        persist(result.presets);
      }
      return result;
    },
    [persist, presets]
  );

  const renamePreset = useCallback(
    (presetId, name) => {
      const result = renameFilterPreset(presets, presetId, name);
      setError(result.error || "");
      if (!result.error) {
        persist(result.presets);
      }
      return result;
    },
    [persist, presets]
  );

  const updatePreset = useCallback(
    (presetId, filters) => {
      const nextPresets = updateFilterPreset(presets, presetId, filters);
      setError("");
      persist(nextPresets);
      return nextPresets;
    },
    [persist, presets]
  );

  const deletePreset = useCallback(
    (presetId) => {
      const nextPresets = removeFilterPreset(presets, presetId);
      setError("");
      persist(nextPresets);
      return nextPresets;
    },
    [persist, presets]
  );

  return {
    presets,
    presetError: error,
    clearPresetError: () => setError(""),
    savePreset,
    renamePreset,
    updatePreset,
    deletePreset,
  };
};

export default useEventFilterPresets;
