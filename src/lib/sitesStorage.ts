type SiteData = {
  html: string;
  url: string;
  createdAt: number;
};

class SitesStorage {
  private static instance: SitesStorage;
  private store: Map<string, SiteData>;

  private constructor() {
    this.store = new Map();
    console.log("[SitesStorage] Initialized new Map instance");
  }

  public static getInstance(): SitesStorage {
    if (!SitesStorage.instance) {
      // Use global to persist across hot-reloads in development
      const globalForSites = global as any;
      if (!globalForSites.sitesStorageInstance) {
        globalForSites.sitesStorageInstance = new SitesStorage();
      }
      SitesStorage.instance = globalForSites.sitesStorageInstance;
    }
    return SitesStorage.instance;
  }

  public set(id: string, data: SiteData): void {
    console.log(`[SitesStorage] Saving site: ${id}`);
    this.store.set(id, data);
  }

  public get(id: string): SiteData | undefined {
    const data = this.store.get(id);
    console.log(`[SitesStorage] Retrieving site: ${id} - ${data ? "Found" : "Not Found"}`);
    return data;
  }

  public update(id: string, html: string): boolean {
    const existing = this.store.get(id);
    if (existing) {
      console.log(`[SitesStorage] Updating site: ${id}`);
      this.store.set(id, { ...existing, html });
      return true;
    }
    return false;
  }
}

export const sitesStorage = SitesStorage.getInstance();
