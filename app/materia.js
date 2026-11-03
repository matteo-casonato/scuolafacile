/* Scuola facile — l’archivio degli argomenti di una materia.
   Si apre con materia.html?m=<materia>. Ogni argomento apre il suo ripasso. */

import { icona } from './icone.js';
import { progresso, barra } from './progressi.js';

/* Il titolo è testo, non un pulsante: i pulsanti sono quelli sotto,
   uno per cosa che si può fare con questo argomento. */
function scheda(a) {
  const v = `${a.materia}/${a.cartella}`;
  const p = progresso(a.materia, a.cartella);
  const avanzamento = p && p.fatte
    ? `<span class="mt-2 block text-sm text-muted">${
        p.fatte === 1 ? '1 pagina' : `${p.fatte} pagine`} su ${p.pagine} già ripassate</span>`
    : '';

  const prove = (a.ha && a.ha.verifiche) || 0;
  const azioni = [
    `<a class="azione principale" href="ripasso.html?v=${v}">Ripassa</a>`,
    `<a class="azione secondaria" href="ripasso.html?v=${v}&amp;stampa=1">Stampa</a>`,
  ];
  if (prove) {
    azioni.push(`<a class="azione secondaria" href="verifica.html?v=${v}">${
      prove === 1 ? 'Verifica' : 'Verifiche'}</a>`);
  }

  return `<div class="rounded-2xl border-2 border-[color:var(--c)] bg-card p-4">
    <h2 class="m-0 text-xl leading-tight font-bold text-[color:var(--c)]">${a.titolo}</h2>
    ${barra(p)}${avanzamento}
    <div class="azioni" style="--quanti:${azioni.length}">${azioni.join('')}</div>
  </div>`;
}

async function avvia() {
  const el = document.getElementById('argomenti');
  const id = new URLSearchParams(location.search).get('m');

  let dati;
  try {
    dati = await (await fetch('indice.json', { cache: 'no-cache' })).json();
  } catch (e) {
    el.innerHTML = '<p class="text-muted">Non riesco a leggere l’elenco degli argomenti.</p>';
    return;
  }

  const materia = (dati.materie || []).find(m => m.id === id);
  if (!materia) {
    document.getElementById('nome').textContent = 'Materia sconosciuta';
    el.innerHTML = '<p class="text-muted">Questa materia non c’è. <a href="index.html">Torna indietro</a>.</p>';
    return;
  }

  document.title = `${materia.nome} · Scuola facile`;
  document.body.classList.remove('c-ink');
  document.body.classList.add(`c-${materia.colore}`);
  document.getElementById('nome').textContent = materia.nome;
  document.getElementById('icona').innerHTML = icona(materia.id);

  const argomenti = (dati.argomenti || []).filter(a => a.materia === id);
  document.getElementById('intro').textContent = argomenti.length
    ? 'Scegli l’argomento da ripassare.'
    : '';
  el.innerHTML = argomenti.length
    ? argomenti.map(scheda).join('')
    : '<p class="text-muted">Per questa materia non c’è ancora niente.</p>';
}

avvia();
