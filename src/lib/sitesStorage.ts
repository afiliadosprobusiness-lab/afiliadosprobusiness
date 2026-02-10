import { db } from "./firebase";
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
    console.log("[SitesStorage] Initialized with Firestore");
  }

  public static getInstance(): SitesStorage {
    if (!SitesStorage.instance) {
      SitesStorage.instance = new SitesStorage();
    }
    return SitesStorage.instance;
  }

  public async set(id: string, data: Omit<SiteData, "id">): Promise<void> {
    console.log(`[SitesStorage] Saving site to Firestore: ${id}`);
    try {
      await setDoc(doc(db, this.collectionName, id), {
        ...data,
        id,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error("[SitesStorage] Error saving site:", error);
      throw error;
    }
  }

  public async get(id: string): Promise<SiteData | undefined> {
    console.log(`[SitesStorage] Retrieving site from Firestore: ${id}`);
    try {
      const docSnap = await getDoc(doc(db, this.collectionName, id));
      if (docSnap.exists()) {
        return docSnap.data() as SiteData;
      }
      return undefined;
    } catch (error) {
      console.error("[SitesStorage] Error getting site:", error);
      return undefined;
    }
  }

  public async getAll(): Promise<SiteData[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => doc.data() as SiteData);
    } catch (error) {
      console.error("[SitesStorage] Error getting all sites:", error);
      return [];
    }
  }

  public async update(id: string, html: string): Promise<boolean> {
    console.log(`[SitesStorage] Updating site in Firestore: ${id}`);
    try {
      const siteRef = doc(db, this.collectionName, id);
      await updateDoc(siteRef, { 
        html,
        updatedAt: Date.now()
      });
      return true;
    } catch (error) {
      console.error("[SitesStorage] Error updating site:", error);
      return false;
    }
  }

  public async publish(id: string): Promise<boolean> {
    console.log(`[SitesStorage] Publishing site in Firestore: ${id}`);
    try {
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
