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
  createdAt: number;
  published: boolean;
  publishedAt?: number;
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

  public async set(id: string, data: Omit<SiteData, "id">): Promise<void> {
    console.log(`[SitesStorage] Saving site: ${id} (Server: ${this.isServer()})`);
    try {
      if (this.isServer()) {
        await adminDb.collection(this.collectionName).doc(id).set({
          ...data,
          id,
          updatedAt: Date.now()
        });
      } else {
        await setDoc(doc(db, this.collectionName, id), {
          ...data,
          id,
          updatedAt: Date.now()
        });
      }
    } catch (error) {
      console.error("[SitesStorage] Error saving site:", error);
      throw error;
    }
  }

  public async get(id: string): Promise<SiteData | undefined> {
    console.log(`[SitesStorage] Retrieving site: ${id} (Server: ${this.isServer()})`);
    try {
      if (this.isServer()) {
        const docSnap = await adminDb.collection(this.collectionName).doc(id).get();
        if (docSnap.exists) {
          return docSnap.data() as SiteData;
        }
      } else {
        const docSnap = await getDoc(doc(db, this.collectionName, id));
        if (docSnap.exists()) {
          return docSnap.data() as SiteData;
        }
      }
      return undefined;
    } catch (error) {
      console.error("[SitesStorage] Error getting site:", error);
      return undefined;
    }
  }

  public async getAll(): Promise<SiteData[]> {
    try {
      if (this.isServer()) {
        const snapshot = await adminDb.collection(this.collectionName).get();
        return snapshot.docs.map(doc => doc.data() as SiteData);
      } else {
        const querySnapshot = await getDocs(collection(db, this.collectionName));
        return querySnapshot.docs.map(doc => doc.data() as SiteData);
      }
    } catch (error) {
      console.error("[SitesStorage] Error getting all sites:", error);
      return [];
    }
  }

  public async update(id: string, html: string): Promise<boolean> {
    console.log(`[SitesStorage] Updating site: ${id} (Server: ${this.isServer()})`);
    try {
      if (this.isServer()) {
        await adminDb.collection(this.collectionName).doc(id).update({ 
          html,
          updatedAt: Date.now()
        });
      } else {
        const siteRef = doc(db, this.collectionName, id);
        await updateDoc(siteRef, { 
          html,
          updatedAt: Date.now()
        });
      }
      return true;
    } catch (error) {
      console.error("[SitesStorage] Error updating site:", error);
      return false;
    }
  }

  public async publish(id: string): Promise<boolean> {
    console.log(`[SitesStorage] Publishing site: ${id} (Server: ${this.isServer()})`);
    try {
      if (this.isServer()) {
        await adminDb.collection(this.collectionName).doc(id).update({ 
          published: true, 
          publishedAt: Date.now() 
        });
      } else {
        const siteRef = doc(db, this.collectionName, id);
        await updateDoc(siteRef, { 
          published: true, 
          publishedAt: Date.now() 
        });
      }
      return true;
    } catch (error) {
      console.error("[SitesStorage] Error publishing site:", error);
      return false;
    }
  }
}

export const sitesStorage = SitesStorage.getInstance();
