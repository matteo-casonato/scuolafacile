/* Scuola facile — la home: si sceglie la materia. */

import { icona } from './icone.js';

const CARD = 'block rounded-2xl border-2 border-[color:var(--c)] bg-card p-4 no-underline ' +
             'text-ink min-h-[7rem] flex flex-col';

function conteggio(n) {
  if (!n) return 'ancora niente';
  return n === 1 ? '1 argomento' : `${n} argomenti`;
}

function scheda(m, n) {
  const dentro =
    `<span class="tinta mb-2 grid h-11 w-11 place-items-center rounded-xl text-[color:var(--c)]">
       ${icona(m.id)}
     </span>
     <span class="text-lg leading-tight font-bold text-[color:var(--c)]">${m.nome}</span>
     <span class="mt-auto pt-1 text-sm text-muted">${conteggio(n)}</span>`;

  if (!n) {
    return `<div class="c-${m.colore} ${CARD} opacity-45">${dentro}</div>`;
  }
  return `<a class="c-${m.colore} ${CARD}" href="materia.html?m=${m.id}">${dentro}</a>`;
}

async function avvia() {
  const el = document.getElementById('materie');
  let dati;
  try {
    dati = await (await fetch('indice.json', { cache: 'no-cache' })).json();
  } catch (e) {
    el.innerHTML = '<p class="text-muted">Non riesco a leggere l’elenco delle materie.</p>';
    return;
  }
  const quanti = new Map();
  for (const a of dati.argomenti || []) {
    quanti.set(a.materia, (quanti.get(a.materia) || 0) + 1);
  }
  el.innerHTML = (dati.materie || []).map(m => scheda(m, quanti.get(m.id) || 0)).join('');
}

avvia();
