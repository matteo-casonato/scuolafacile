/* Scuola facile — le verifiche di prova da stampare.
   verifica.html?v=<materia>/<cartella>          → l'elenco delle prove
   verifica.html?v=<materia>/<cartella>&n=<file> → la prova, pronta da stampare */

import { renderVerifica } from './esercizi.js';

const $ = s => document.querySelector(s);

function avviso(testo, tornaA) {
  $('#dentro').innerHTML = `<div class="mx-auto mt-6 max-w-xl rounded-xl border-2 border-red bg-card p-4">
    <p>${testo}</p><p><a href="${tornaA}">Torna indietro</a></p></div>`;
}

async function leggi(url) {
  const r = await fetch(url, { cache: 'no-cache' });
  if (!r.ok) throw new Error(url);
  return r.json();
}

function elenco(prove, v, materia) {
  if (!prove.length) {
    return '<p class="mx-auto max-w-3xl px-4 pt-6 text-muted">' +
           'Per questo argomento non ci sono ancora prove da stampare.</p>';
  }
  return `<div class="mx-auto grid max-w-3xl gap-3 px-4 pt-5 pb-14">
    <p class="text-muted">Ogni prova si stampa su A4. Le soluzioni stanno su un foglio
    a parte, da staccare.</p>
    ${prove.map(p => `<a href="verifica.html?v=${v}&n=${encodeURIComponent(p.file)}"
      class="c-${materia.colore} block rounded-2xl border-2 border-[color:var(--c)] bg-card p-4 text-ink no-underline">
      <span class="block text-xl font-bold text-[color:var(--c)]">${p.titolo}</span>
      ${p.sotto ? `<span class="mt-1 block text-sm text-muted">${p.sotto}</span>` : ''}
      <span class="mt-2 block text-sm text-muted">${p.esercizi} esercizi · ${p.punti} punti</span>
    </a>`).join('')}
  </div>`;
}

async function avvia() {
  const q = new URLSearchParams(location.search);
  const v = q.get('v');
  const n = q.get('n');
  if (!v || !/^[a-z]+\/[a-z0-9-]+$/.test(v)) return avviso('Non so quali verifiche aprire.', 'index.html');

  const [materiaId] = v.split('/');
  $('#indietro').href = `materia.html?m=${materiaId}`;

  let indice;
  try {
    indice = await leggi('indice.json');
  } catch (e) {
    return avviso('Queste verifiche non sono disponibili offline.', `materia.html?m=${materiaId}`);
  }
  const materia = (indice.materie || []).find(m => m.id === materiaId) || { colore: 'ink', nome: materiaId };
  document.body.classList.remove('c-ink');
  document.body.classList.add(`c-${materia.colore}`);

  const [, cartella] = v.split('/');
  const argomento = (indice.argomenti || []).find(a => a.materia === materiaId && a.cartella === cartella);
  const prove = (argomento && argomento.prove) || [];

  if (!n) {
    document.title = `Verifiche di ${materia.nome.toLowerCase()} · Scuola facile`;
    $('#nome').textContent = `Verifiche di ${materia.nome.toLowerCase()}`;
    $('#dentro').innerHTML = elenco(prove, v, materia);
    return;
  }

  if (!/^[a-z0-9-]+\.json$/.test(n) || !prove.some(p => p.file === n)) {
    return avviso('Questa prova non esiste.', `verifica.html?v=${v}`);
  }

  let prova;
  try {
    prova = await leggi(`materie/${v}/verifiche/${n}`);
  } catch (e) {
    return avviso('Questa prova non è disponibile offline.', `verifica.html?v=${v}`);
  }

  document.title = `${prova.titolo} · Scuola facile`;
  $('#nome').textContent = prova.titolo;
  $('#indietro').href = `verifica.html?v=${v}`;
  $('#dentro').innerHTML = renderVerifica(prova);
  const b = $('#stampa');
  b.hidden = false;
  b.addEventListener('click', () => window.print());
}

avvia();
