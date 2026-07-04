import { useEffect, useState } from "react";
import { loadFromStorage, saveToStorage } from "../utils/storageUtils";

export const usePersistentState = (key, defaultValue) => {
  const [state, setState] = useState(() =>
    loadFromStorage(key, defaultValue)
  );

  useEffect(() => {
    saveToStorage(key, state);
  }, [key, state]);

  return [state, setState];
};