/* Scuola facile — service worker: dopo la prima apertura l'app funziona offline.
   Cambia VERSIONE a ogni pubblicazione per far scaricare i file nuovi. */

const VERSIONE = 'sf-1';
const GUSCIO = `${VERSIONE}-guscio`;
const CONTENUTI = `${VERSIONE}-contenuti`;

const FILE = [
  './',
  'index.html',
  'ripasso.html',
  'indice.json',
  'manifest.webmanifest',
  'app/app.css',
  'app/print.css',
  'app/home.js',
  'app/deck.js',
  'app/blocchi.js',
  'app/sw-registra.js',
  'app/giochi/giochi.js',
  'assets/font/atkinson-400-latin.woff2',
  'assets/font/atkinson-400-latin-ext.woff2',
  'assets/font/atkinson-700-latin.woff2',
  'assets/font/atkinson-700-latin-ext.woff2',
  'assets/icone/icon-192.png',
  'assets/icone/icon-512.png',
  'assets/icone/icon-maskable-512.png',
  'assets/icone/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(GUSCIO)
      .then(c => c.addAll(FILE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(n => !n.startsWith(VERSIONE)).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  /* I contenuti di una verifica: prima la rete, poi la copia salvata.
     Così una correzione arriva subito, ma offline il ripasso si apre lo stesso. */
  if (url.pathname.includes('/materie/') || url.pathname.endsWith('indice.json')) {
    e.respondWith(
      fetch(req)
        .then(r => {
          const copia = r.clone();
          caches.open(CONTENUTI).then(c => c.put(req, copia));
          return r;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  /* Il resto: prima la copia salvata. */
  e.respondWith(
    caches.match(req).then(r => r || fetch(req).then(resp => {
      const copia = resp.clone();
      caches.open(GUSCIO).then(c => c.put(req, copia));
      return resp;
    }))
  );
});
