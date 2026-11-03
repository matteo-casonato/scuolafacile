/* Scuola facile — monta i giochi presenti nelle pagine del ripasso.
   Ogni gioco è un modulo caricato solo se serve. */

const MODULI = {
  scelta: () => import('./scelta.js'),
  ascolta: () => import('./ascolta.js'),
  note: () => import('./note.js'),
};

export function montaGiochi(radice) {
  for (const el of radice.querySelectorAll('.gioco')) {
    const tipo = el.dataset.gioco;
    const carica = MODULI[tipo];
    if (!carica) {
      console.warn('Scuola facile: gioco sconosciuto', tipo);
      continue;
    }
    let dati = {};
    try { dati = JSON.parse(el.dataset.dati); } catch (e) {}
    carica().then(m => m.monta(el, dati)).catch(e => console.warn('gioco', tipo, e));
  }
}
