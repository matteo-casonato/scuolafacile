/* Scuola facile — “Ascolta e scegli”, per le lingue.
   Usa la voce del telefono (Web Speech API).
   Dati del blocco:
   { "t":"gioco", "tipo":"ascolta", "lingua":"de-DE", "totale":10, "record":"tedesco-verbi",
     "voci":[ { "testo":"ich wohne", "it":"io abito" } ] } */

import { giostra, opzioni } from './comune.js';

export function monta(el, dati) {
  const voci = (dati.voci || []).filter(v => v && v.testo);
  if (voci.length < 3) {
    el.innerHTML = '<p class="muted">Questo gioco ha bisogno di almeno 3 frasi.</p>';
    return;
  }

  const lingua = dati.lingua || 'it-IT';
  const sintesi = window.speechSynthesis;
  let velocita = 0.85;
  let voce = null;

  function cercaVoce() {
    if (!sintesi) return;
    const tutte = sintesi.getVoices() || [];
    const radice = lingua.split('-')[0];
    voce = tutte.find(v => new RegExp(`^${radice}(-|_|$)`, 'i').test(v.lang)) || null;
    avviso.hidden = !(tutte.length && !voce);
  }

  function parla(testo) {
    if (!sintesi) return;
    sintesi.cancel();
    const u = new SpeechSynthesisUtterance(testo);
    u.lang = lingua;
    u.rate = velocita;
    if (voce) u.voice = voce;
    sintesi.speak(u);
  }

  el.innerHTML = `
    <div class="velocita">
      <span>Velocità:</span>
      <button type="button" data-v="0.85" aria-pressed="true">Normale</button>
      <button type="button" data-v="0.55" aria-pressed="false">Lenta</button>
    </div>
    <p class="hl" data-avviso hidden></p>
    <div data-giro></div>`;

  const avviso = el.querySelector('[data-avviso]');
  avviso.textContent = `Il telefono non ha la voce di questa lingua. ` +
    `Vai in Impostazioni → Sintesi vocale e scarica la lingua.`;

  el.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => {
    velocita = parseFloat(b.dataset.v);
    el.querySelectorAll('[data-v]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  }));

  if (!sintesi) {
    avviso.hidden = false;
    avviso.textContent = 'Questo telefono non sa leggere ad alta voce: il gioco non funziona.';
  } else {
    cercaVoce();
    sintesi.onvoiceschanged = cercaVoce;
  }

  const tutti = voci.map(v => v.testo);

  giostra(el.querySelector('[data-giro]'), {
    totale: Math.min(dati.totale || 10, 30),
    record: dati.record,
    crea() {
      const v = voci[Math.floor(Math.random() * voci.length)];
      return { testo: v.testo, it: v.it || '', giusta: v.testo, scelte: opzioni(v.testo, tutti) };
    },
    disegna: () => `<div class="domanda">
      <div class="tipo">Ascolta e scegli che cosa hai sentito</div>
      <button class="ascolta" type="button" data-ripeti aria-label="Riascolta">🔊</button>
      <div class="aiuto">tocca per riascoltare</div>
    </div>`,
    dopoDisegno(q, dove) {
      dove.querySelector('[data-ripeti]').addEventListener('click', () => parla(q.testo));
      setTimeout(() => parla(q.testo), 250);
    },
    dopoRisposta: q => parla(q.testo),
    seGiusto: q => `Giusto! ${q.testo}${q.it ? ` — ${q.it}` : ''}`,
    seSbagliato: q => `Era: ${q.testo}${q.it ? ` — ${q.it}` : ''}`,
  });
}
