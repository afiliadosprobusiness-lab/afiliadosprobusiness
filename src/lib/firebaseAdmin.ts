import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: "fastpage2-db56b",
      // En entorno de desarrollo o Vercel, Firebase Admin puede usar las
      // credenciales predeterminadas de Google o variables de entorno.
    });
    console.log("[FirebaseAdmin] Initialized");
  } catch (error) {
    console.error("[FirebaseAdmin] Initialization error", error);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
