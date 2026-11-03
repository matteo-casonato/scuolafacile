/* Scuola facile — il ripasso digitale: una pagina alla volta.
   Si apre con ripasso.html?v=<materia>/<cartella della verifica>. */

import { renderBlocchi } from './blocchi.js';
import { montaGiochi } from './giochi/giochi.js';

const $ = sel => document.querySelector(sel);

function avviso(testo) {
  $('#deck').innerHTML = `<div class="avviso"><p>${testo}</p>
    <p><a href="index.html">Torna all’elenco</a></p></div>`;
  document.querySelector('nav').hidden = true;
}

async function leggi(base, file, obbligatorio) {
  const r = await fetch(`${base}/${file}`, { cache: 'no-cache' });
  if (!r.ok) {
    if (obbligatorio) throw new Error(`manca ${file}`);
    return null;
  }
  return r.json();
}

async function avvia() {
  const v = new URLSearchParams(location.search).get('v');
  if (!v || !/^[a-z]+\/[a-z0-9-]+$/.test(v)) {
    return avviso('Non so quale ripasso aprire.');
  }
  const base = `materie/${v}`;

  let ripasso, schema;
  try {
    ripasso = await leggi(base, 'ripasso.json', true);
    if ((ripasso.pagine || []).some(p => (p.blocchi || []).some(b => b.t === 'schema'))) {
      schema = await leggi(base, 'schema.json', false);
    }
  } catch (e) {
    return avviso('Questo ripasso non è ancora disponibile offline. Riprova quando c’è rete.');
  }

  const colori = {};
  for (const s of ripasso.sezioni || []) colori[s.nome] = s.colore;

  const pagine = ripasso.pagine || [];
  if (!pagine.length) return avviso('Questo ripasso è vuoto.');

  document.title = ripasso.titolo || 'Scuola facile';

  /* --- costruzione delle pagine --- */
  $('#deck').innerHTML = pagine.map((p, i) => {
    const col = colori[p.sezione] || 'ink';
    return `<section class="slide c-${col}" data-sec="${p.sezione}" data-col="${col}" ` +
           `aria-label="${p.titolo}"${i ? ' hidden' : ''}>` +
           `<div class="inner"><h2>${p.titolo}</h2>${renderBlocchi(p.blocchi, { schema })}</div></section>`;
  }).join('\n');

  const slides = Array.from(document.querySelectorAll('.slide'));
  const n = slides.length;
  const secEl = $('#sec'), countEl = $('#count'), prog = $('#progress');
  const prev = $('#prev'), next = $('#next');

  /* La chiave cambia da sola quando cambia il numero di pagine. */
  const KEY = `sf:${v}:p${n}`;
  let cur = 0, stato = { i: 0, got: {} };
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && typeof s === 'object') stato = { i: s.i || 0, got: s.got || {} };
  } catch (e) { /* localStorage non disponibile: si va avanti senza memoria */ }
  const salva = () => {
    try { localStorage.setItem(KEY, JSON.stringify({ i: cur, got: stato.got })); } catch (e) {}
  };

  const segs = slides.map(sl => {
    const sp = document.createElement('span');
    sp.style.setProperty('--seg', `var(--${sl.dataset.col})`);
    prog.appendChild(sp);
    return sp;
  });

  /* “Ho capito” su tutte le pagine tranne la prima. */
  slides.forEach((sl, i) => {
    if (i === 0) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'got';
    b.innerHTML = '<span class="box" aria-hidden="true"></span><span>Ho capito</span>';
    b.addEventListener('click', () => {
      stato.got[i] = !stato.got[i];
      if (!stato.got[i]) delete stato.got[i];
      dipingiGot();
      salva();
    });
    sl.querySelector('.inner').appendChild(b);
  });

  function dipingiGot() {
    slides.forEach((sl, i) => {
      const b = sl.querySelector('.got'), on = !!stato.got[i];
      if (b) {
        b.setAttribute('aria-pressed', on);
        b.querySelector('.box').textContent = on ? '✓' : '';
      }
      segs[i].classList.toggle('done', on);
    });
  }

  function vai(i, dir) {
    if (i < 0 || i >= n) return;
    slides[cur].hidden = true;
    cur = i;
    const sl = slides[cur];
    sl.hidden = false;
    sl.scrollTop = 0;
    sl.classList.remove('in-next', 'in-prev');
    if (dir) { void sl.offsetWidth; sl.classList.add(dir > 0 ? 'in-next' : 'in-prev'); }
    document.body.className = 'c-' + sl.dataset.col;
    secEl.textContent = sl.dataset.sec;
    countEl.textContent = `Pagina ${cur + 1} di ${n}`;
    segs.forEach((s, k) => s.classList.toggle('now', k === cur));
    prev.disabled = cur === 0;
    next.textContent = cur === n - 1 ? 'Ricomincia' : 'Avanti';
    salva();
  }

  prev.addEventListener('click', () => vai(cur - 1, -1));
  next.addEventListener('click', () => (cur === n - 1 ? vai(0, -1) : vai(cur + 1, 1)));
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') vai(cur + 1, 1);
    if (e.key === 'ArrowLeft') vai(cur - 1, -1);
  });

  let sx = 0, sy = 0;
  const deck = $('#deck');
  deck.addEventListener('touchstart', e => {
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  deck.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      vai(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    }
  }, { passive: true });

  /* --- stampa: tutte le pagine, risposte aperte --- */
  $('#print').addEventListener('click', () => window.print());
  let aperte = [];
  addEventListener('beforeprint', () => {
    aperte = Array.from(document.querySelectorAll('details:not([open])'));
    aperte.forEach(d => { d.open = true; });
  });
  addEventListener('afterprint', () => {
    aperte.forEach(d => { d.open = false; });
    aperte = [];
  });

  montaGiochi(deck);
  dipingiGot();
  const start = Math.min(Math.max(stato.i | 0, 0), n - 1);
  slides[0].hidden = true;
  cur = start;
  slides[start].hidden = false;
  vai(start, 0);
}

avvia();
