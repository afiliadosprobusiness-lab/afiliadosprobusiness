import * as admin from 'firebase-admin';

let isInitialized = false;

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
      isInitialized = true;
      console.log("[FirebaseAdmin] Initialized with Service Account Key");
    } else if (process.env.NODE_ENV === 'production') {
      // En producción (Vercel/Google Cloud), intentamos usar las credenciales predeterminadas del entorno
      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fastpage2-db56b",
      });
      isInitialized = true;
      console.log("[FirebaseAdmin] Initialized with Default Application Credentials");
    } else {
      console.warn("[FirebaseAdmin] No service account key found and not in production. Admin SDK will not be initialized.");
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
