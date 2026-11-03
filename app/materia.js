/* Scuola facile — l’archivio degli argomenti di una materia.
   Si apre con materia.html?m=<materia>. Ogni argomento apre il suo ripasso. */

import { icona } from './icone.js';
import { progresso, barra } from './progressi.js';

const CHIP = 'rounded-full border border-grid px-2.5 py-0.5 text-sm text-muted';

function chips(ha = {}) {
  const c = [];
  if (ha.ripasso) c.push('ripasso');
  if (ha.schema) c.push('schema in una pagina');
  if (ha.verifiche) c.push(ha.verifiche === 1 ? '1 prova da stampare' : `${ha.verifiche} prove da stampare`);
  if (!c.length) return '';
  return `<div class="mt-3 flex flex-wrap gap-1.5">${
    c.map(x => `<span class="${CHIP}">${x}</span>`).join('')}</div>`;
}

function scheda(a) {
  const p = progresso(a.materia, a.cartella);
  const avanzamento = p && p.fatte
    ? `<span class="mt-2 block text-sm text-muted">${
        p.fatte === 1 ? '1 pagina' : `${p.fatte} pagine`} su ${p.pagine} già ripassate</span>`
    : '';
  return `<a href="ripasso.html?v=${a.materia}/${a.cartella}"
    class="block rounded-2xl border-2 border-[color:var(--c)] bg-card p-4 text-ink no-underline">
    <span class="block text-xl leading-tight font-bold text-[color:var(--c)]">${a.titolo}</span>
    ${barra(p)}${avanzamento}${chips(a.ha)}
  </a>`;
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
