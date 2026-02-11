import * as admin from 'firebase-admin';

let isInitialized = false;
let initWarningShown = false;

function parseServiceAccount(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    try {
      const decoded = Buffer.from(raw, "base64").toString("utf8");
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

      if (!serviceAccount) {
        if (!initWarningShown) {
          console.warn("[FirebaseAdmin] FIREBASE_SERVICE_ACCOUNT_KEY inválida. Admin SDK deshabilitado.");
          initWarningShown = true;
        }
      } else {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
        isInitialized = true;
        console.log("[FirebaseAdmin] Initialized with Service Account Key");
      }
    } else {
      // Do not initialize Admin SDK without explicit credentials.
      // This avoids runtime failures like "Could not load the default credentials".
      console.warn("[FirebaseAdmin] No FIREBASE_SERVICE_ACCOUNT_KEY found. Admin SDK disabled.");
    }
  } catch (error) {
    console.error("[FirebaseAdmin] Initialization error:", error);
  }
} else {
  isInitialized = true;
}

// Exportamos los servicios solo si la inicialización fue exitosa
export const adminDb = isInitialized ? admin.firestore() : null;
export const adminAuth = isInitialized ? admin.auth() : null;
