self.addEventListener('install', (e) => {
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  // Uygulama kurulum şartını sağlamak için boş bir dinleyici (Sistemi asla yormaz ve bozmaz)
});