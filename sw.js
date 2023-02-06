const staticCacheName = "s-app-v3";
const dynamicCacheName = "d-app-v3";

const assetUrls = [];

self.addEventListener("install", async (event) => {
   const cache = await caches.open(staticCacheName);
   await cache.addAll(assetUrls);
});

self.addEventListener("activate", async (event) => {
   const cacheNames = await caches.keys();
   await Promise.all(
      cacheNames
         .filter((name) => name !== staticCacheName)
         .filter((name) => name !== dynamicCacheName)
         .map((name) => caches.delete(name))
   );
});
