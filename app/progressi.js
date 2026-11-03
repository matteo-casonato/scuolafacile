/* Scuola facile — quanto è stato ripassato, letto dalla memoria del telefono.
   La chiave la scrive deck.js: sf:<materia>/<cartella>:p<numero di pagine>. */

export function progresso(materia, cartella) {
  try {
    const pre = `sf:${materia}/${cartella}:p`;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(pre)) continue;
      const pagine = parseInt(k.slice(pre.length), 10);
      const s = JSON.parse(localStorage.getItem(k)) || {};
      return { pagine, fatte: Object.keys(s.got || {}).length };
    }
  } catch (e) { /* senza memoria si mostra la scheda senza barra */ }
  return null;
}

export function barra(p) {
  if (!p || !p.pagine) return '';
  let h = '<div class="mt-2 flex gap-[3px]" aria-hidden="true">';
  for (let i = 0; i < p.pagine; i++) {
    h += `<i class="h-1.5 flex-1 rounded-full ${i < p.fatte ? 'bg-[color:var(--c)]' : 'bg-grid'}"></i>`;
  }
  return h + '</div>';
}
