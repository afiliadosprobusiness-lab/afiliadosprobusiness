import { db } from "./firebase";
import { adminDb } from "./firebaseAdmin";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where,
  Timestamp 
} from "firebase/firestore";

type SiteData = {
  id: string;
  html: string;
  url: string;
  userId?: string;
  name?: string;
  type?: "Clonador" | "Constructor" | "Plantilla";
  createdAt: number;
  updatedAt?: number;
  published: boolean;
  publishedAt?: number;
  status?: "draft" | "published" | "archived";
  bundle?: any;
};

class SitesStorage {
  private static instance: SitesStorage;
  private collectionName = "cloned_sites";

  private constructor() {
    console.log("[SitesStorage] Initialized with Firebase Admin (Server Side)");
  }

  public static getInstance(): SitesStorage {
    if (!SitesStorage.instance) {
      SitesStorage.instance = new SitesStorage();
    }
    return SitesStorage.instance;
  }

  private isServer() {
    return typeof window === 'undefined';
  }

  private shouldFallbackToClient(error: any): boolean {
    const msg = String(error?.message || "").toLowerCase();
    const code = String(error?.code || "").toLowerCase();

    return (
      msg.includes("default credentials") ||
      msg.includes("could not load the default credentials") ||
      msg.includes("insufficient permission") ||
      msg.includes("permission-denied") ||
      msg.includes("invalid_grant") ||
      code.includes("permission-denied")
    );
  }

  public async set(id: string, data: Omit<SiteData, "id">): Promise<void> {
    console.log(`[SitesStorage] Saving site: ${id} (Server: ${this.isServer()})`);
    try {
      if (this.isServer() && adminDb) {
        try {
          await adminDb.collection(this.collectionName).doc(id).set({
            ...data,
            id,
            updatedAt: Date.now()
          });
          return;
        } catch (error) {
          if (!this.shouldFallbackToClient(error)) {
            throw error;
          }
          console.warn("[SitesStorage] Admin write failed, falling back to client SDK.");
        }
      }

      // Fallback to client SDK if adminDb is not available or admin auth failed.
      await setDoc(doc(db, this.collectionName, id), {
        ...data,
        id,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error("[SitesStorage] Error saving site:", error);
      throw new Error("No se pudo guardar el proyecto. Verifica permisos de Firestore.");
    }
  }

  public async get(id: string): Promise<SiteData | undefined> {
    console.log(`[SitesStorage] Retrieving site: ${id} (Server: ${this.isServer()})`);
    try {
      if (this.isServer() && adminDb) {
        try {
          const docSnap = await adminDb.collection(this.collectionName).doc(id).get();
          if (docSnap.exists) {
            return docSnap.data() as SiteData;
          }
          return undefined;
        } catch (error) {
          if (!this.shouldFallbackToClient(error)) {
            throw error;
          }
          console.warn("[SitesStorage] Admin read failed, falling back to client SDK.");
        }
      }

      const docSnap = await getDoc(doc(db, this.collectionName, id));
      if (docSnap.exists()) {
        return docSnap.data() as SiteData;
      }
      return undefined;
    } catch (error: any) {
      console.error("[SitesStorage] Error getting site:", error);
      if (error.code === 'permission-denied') {
        throw new Error("No tienes permisos para acceder a este sitio.");
      }
      throw new Error("No se pudo recuperar el sitio solicitado.");
    }
  }

  public async getAll(): Promise<SiteData[]> {
    try {
      if (this.isServer() && adminDb) {
        try {
          const snapshot = await adminDb.collection(this.collectionName).get();
          return snapshot.docs.map(doc => doc.data() as SiteData);
        } catch (error) {
          if (!this.shouldFallbackToClient(error)) {
            throw error;
          }
          console.warn("[SitesStorage] Admin list failed, falling back to client SDK.");
        }
      }

      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => doc.data() as SiteData);
    } catch (error: any) {
      console.error("[SitesStorage] Error getting all sites:", error);
      // Keep the cloner UI usable even if listing fails.
      return [];
    }
  }

  public async update(id: string, html: string): Promise<boolean> {
    console.log(`[SitesStorage] Updating site: ${id} (Server: ${this.isServer()})`);
    try {
      if (this.isServer() && adminDb) {
        try {
          await adminDb.collection(this.collectionName).doc(id).update({ 
            html,
            updatedAt: Date.now()
          });
          return true;
        } catch (error) {
          if (!this.shouldFallbackToClient(error)) {
            throw error;
          }
          console.warn("[SitesStorage] Admin update failed, falling back to client SDK.");
        }
      }

      const siteRef = doc(db, this.collectionName, id);
      await updateDoc(siteRef, { 
        html,
        updatedAt: Date.now()
      });
      return true;
    } catch (error: any) {
      console.error("[SitesStorage] Error updating site:", error);
      if (error.code === 'not-found') return false;
      throw new Error("No se pudo actualizar el proyecto.");
    }
  }

  public async publish(id: string): Promise<boolean> {
    console.log(`[SitesStorage] Publishing site: ${id} (Server: ${this.isServer()})`);
    try {
      if (this.isServer() && adminDb) {
        try {
          await adminDb.collection(this.collectionName).doc(id).update({ 
            published: true, 
            publishedAt: Date.now() 
          });
          return true;
        } catch (error) {
          if (!this.shouldFallbackToClient(error)) {
            throw error;
          }
          console.warn("[SitesStorage] Admin publish failed, falling back to client SDK.");
        }
      } else {
        // no-op; handled by shared fallback block below
      }

      const siteRef = doc(db, this.collectionName, id);
      await updateDoc(siteRef, { 
        published: true, 
        publishedAt: Date.now() 
      });
      return true;
    } catch (error) {
      console.error("[SitesStorage] Error publishing site:", error);
      return false;
    }
  }
}

export const sitesStorage = SitesStorage.getInstance();
