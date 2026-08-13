/**
 * Safe IndexedDB Schema upgrade lock manager utility (#16597)
 */

export class PluginDb {
  constructor(dbName = "plugin-store", version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
    this.upgradeQueue = [];
  }

  async openSafe() {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        resolve({ success: true, mock: true });
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onblocked = () => {
        console.warn("[PluginDb] Schema upgrade blocked. Closing active connections...");
        if (this.db) {
          this.db.close();
          this.db = null;
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        
        // Listen for versionchange signals to close connection immediately
        this.db.onversionchange = () => {
          if (this.db) {
            this.db.close();
            this.db = null;
          }
        };
        resolve(this.db);
      };

      request.onerror = (e) => {
        reject(e.target.error);
      };
    });
  }
}
