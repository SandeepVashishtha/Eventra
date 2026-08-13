import { useEffect, useState } from "react";
import { PluginDb } from "../utils/storage/pluginDb";

export default function usePluginManager() {
  const [dbInstance, setDbInstance] = useState(null);

  useEffect(() => {
    const pluginDb = new PluginDb();
    pluginDb.openSafe()
      .then((instance) => setDbInstance(instance))
      .catch((err) => console.error("IndexedDB blocked lock error:", err));
  }, []);

  return {
    dbInstance
  };
}
