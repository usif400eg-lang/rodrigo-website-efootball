/* ═══════════════════════════════════════════════
   RODRIGO Files — IndexedDB Storage Engine
   Handles local file storage for direct downloads
   ═══════════════════════════════════════════════ */

const DB_CONFIG = {
  name: "RodrigoDownloadsDB",
  version: 1,
  store: "uploaded_files"
};

function openDownloadsDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(DB_CONFIG.store)) {
        db.createObjectStore(DB_CONFIG.store, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Save uploaded binary file Blob
async function saveDownloadBlob(fileId, fileBlob, fileName, fileSize) {
  try {
    const db = await openDownloadsDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_CONFIG.store, "readwrite");
      const store = tx.objectStore(DB_CONFIG.store);
      store.put({
        id: fileId,
        blob: fileBlob,
        name: fileName,
        size: fileSize,
        updatedAt: Date.now()
      });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error("IndexedDB Save Error:", err);
    throw err;
  }
}

// Retrieve uploaded binary file Blob
async function getDownloadBlob(fileId) {
  try {
    const db = await openDownloadsDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_CONFIG.store, "readonly");
      const store = tx.objectStore(DB_CONFIG.store);
      const request = store.get(fileId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB Get Error:", err);
    return null;
  }
}

// Delete uploaded binary file Blob
async function deleteDownloadBlob(fileId) {
  try {
    const db = await openDownloadsDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_CONFIG.store, "readwrite");
      const store = tx.objectStore(DB_CONFIG.store);
      store.delete(fileId);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("IndexedDB Delete Error:", err);
    return false;
  }
}

// Helper: Format bytes to human readable string
function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// Helper: Trigger browser download for a Blob
function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "rodrigo-config.zip";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1500);
}
