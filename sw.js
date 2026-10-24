const CACHE='shooting-safety-v5';
const ASSETS=[
  './',
  './index.html',
  './pages/end-page.html',
  './manifest.webmanifest',
  './styles/main.css',
  './styles/map-selector.css',
  './styles/bathroom-layout.css',
  './styles/outdoor-layout.css',
  './styles/mode-1.css',
  './scripts/app.js',
  './scripts/map-selector.js',
  './scripts/classroom.js',
  './pages/information.html',
  './pages/map-selector.html',
  './pages/bathroom-layout.html',
  './pages/classroom-layout.html',
  './pages/outdoor-layout.html',
  './pages/mode-1.html',
  './pages/second.html',
  './assets/images/map.png'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('shooting-safety-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method==='GET')event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)))});
