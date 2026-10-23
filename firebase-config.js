
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAddyIUCz89MR_24BRPA0L5pDyElyczGu4",
  authDomain: "rodrigo-website-3a6f2.firebaseapp.com",
  databaseURL: "https://rodrigo-website-3a6f2-default-rtdb.firebaseio.com",
  projectId: "rodrigo-website-3a6f2",
  storageBucket: "rodrigo-website-3a6f2.firebasestorage.app",
  messagingSenderId: "260906900255",
  appId: "1:260906900255:web:eb648450c5270f95532e2a",
  measurementId: "G-C459SKJKMK"
};

const FIREBASE_CONFIG_STORAGE_KEY = "rodrigo_firebase_config";
const FIREBASE_FILES_PATH = "rodrigo_files";

// Retrieve active Firebase configuration (prioritize localStorage saved in admin panel, then default)
function getActiveFirebaseConfig() {
  const saved = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.apiKey && (parsed.databaseURL || parsed.projectId)) {
        return parsed;
      }
    } catch (e) {
      console.warn("Error reading stored Firebase config:", e);
    }
  }
  return DEFAULT_FIREBASE_CONFIG;
}

// Check if Firebase is properly configured
function isFirebaseConfigured() {
  const config = getActiveFirebaseConfig();
  return Boolean(config && config.apiKey && (config.databaseURL || config.projectId));
}

// Global Firebase Instance holder
let firebaseApp = null;
let firebaseDb = null;
let isFirebaseOnline = false;

// Initialize Firebase
function initFirebaseApp() {
  if (typeof firebase === "undefined") {
    console.warn("Firebase SDK is not loaded.");
    return null;
  }

  const config = getActiveFirebaseConfig();
  if (!config.apiKey || (!config.databaseURL && !config.projectId)) {
    return null;
  }

  try {
    if (!firebase.apps.length) {
      // Fix databaseURL automatically if project ID provided without explicit databaseURL
      const fullConfig = { ...config };
      if (!fullConfig.databaseURL && fullConfig.projectId) {
        fullConfig.databaseURL = `https://${fullConfig.projectId}-default-rtdb.firebaseio.com`;
      }
      firebaseApp = firebase.initializeApp(fullConfig);
    } else {
      firebaseApp = firebase.app();
    }
    firebaseDb = firebase.database();
    isFirebaseOnline = true;
    console.log("⚡ Firebase connected successfully!");
    return firebaseDb;
  } catch (err) {
    console.error("Firebase init failed:", err);
    isFirebaseOnline = false;
    return null;
  }
}


const CloudDB = {
  isReady() {
    if (!firebaseDb && isFirebaseConfigured()) {
      initFirebaseApp();
    }
    return Boolean(firebaseDb !== null);
  },


  subscribeFiles(onDataChange, onError) {
    if (!this.isReady()) {
      initFirebaseApp();
    }

    if (this.isReady()) {
      const ref = firebaseDb.ref(FIREBASE_FILES_PATH);
      ref.on(
        "value",
        (snapshot) => {
          const val = snapshot.val();
          let filesList = [];
          if (val) {
            if (Array.isArray(val)) {
              filesList = val.filter((f) => f && typeof f === "object" && f.name);
            } else if (typeof val === "object") {
              filesList = Object.values(val).filter((f) => f && typeof f === "object" && f.name);
            }
          }
          // Sort consistently by file ID
          filesList.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
          if (onDataChange) onDataChange(filesList);
        },
        (error) => {
          console.error("Firebase fetch error:", error);
          if (onError) onError(error);
        }
      );

      // Return unsubscribe function
      return () => ref.off("value");
    }
    return null;
  },

  // Save full files array to Firebase with keyed objects f_{id}
  async saveAllFiles(filesArray) {
    if (!this.isReady()) {
      initFirebaseApp();
    }
    if (!this.isReady()) {
      throw new Error("قاعدة بيانات Firebase غير متصلة.");
    }
    const validFiles = (filesArray || []).filter((f) => f && typeof f === "object" && f.name);
    const filesMap = {};
    validFiles.forEach((f) => {
      filesMap[`f_${f.id}`] = f;
    });
    await firebaseDb.ref(FIREBASE_FILES_PATH).set(filesMap);
    return true;
  },

  // Update a single file
  async saveFile(file) {
    if (!file || !file.id) return false;
    if (!this.isReady()) {
      initFirebaseApp();
    }
    if (!this.isReady()) {
      throw new Error("Firebase غير متصل");
    }
    await firebaseDb.ref(`${FIREBASE_FILES_PATH}/f_${file.id}`).set(file);
    return true;
  },

  // Delete a single file
  async deleteFile(fileId) {
    if (!fileId) return false;
    if (!this.isReady()) {
      initFirebaseApp();
    }
    if (!this.isReady()) {
      throw new Error("Firebase غير متصل");
    }
    await firebaseDb.ref(`${FIREBASE_FILES_PATH}/f_${fileId}`).remove();
    return true;
  },

  // Increment download count atomically on the exact file
  async incrementDownload(fileId) {
    if (!fileId && fileId !== 0) return false;
    if (!this.isReady()) {
      initFirebaseApp();
    }
    if (this.isReady()) {
      try {
        const fileRef = firebaseDb.ref(`${FIREBASE_FILES_PATH}/f_${fileId}/downloads`);
        await fileRef.transaction((currentCount) => (currentCount || 0) + 1);
        return true;
      } catch (e) {
        console.warn("Failed to increment cloud downloads:", e);
      }
    }
    return false;
  },


  async testConnection(config) {
    if (typeof firebase === "undefined") {
      throw new Error("Firebase SDK غير محمل في المتصفح");
    }


    const tempAppName = "testApp_" + Date.now();
    const tempConfig = { ...config };
    if (!tempConfig.databaseURL && tempConfig.projectId) {
      tempConfig.databaseURL = `https://${tempConfig.projectId}-default-rtdb.firebaseio.com`;
    }

    const testApp = firebase.initializeApp(tempConfig, tempAppName);
    const testDb = testApp.database();
    
    // Quick ping test
    await testDb.ref(".info/connected").once("value");
    // Delete temp app
    await testApp.delete();
    return true;
  }
};

// Initialize immediately on load
if (typeof window !== "undefined") {
  initFirebaseApp();
  window.addEventListener("DOMContentLoaded", () => {
    initFirebaseApp();
  });
}
