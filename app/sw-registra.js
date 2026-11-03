/* Registra il service worker, così l’app funziona offline dopo la prima apertura. */
if ('serviceWorker' in navigator) {
  addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('sw', e));
  });
}
