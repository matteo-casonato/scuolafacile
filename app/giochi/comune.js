/* Scuola facile — le parti che tutti i giochi hanno in comune:
   punteggio, pallini, stelle finali e record salvato sul telefono. */

export const caso = n => Math.floor(Math.random() * n);

export function mescola(a) {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = caso(i + 1);
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/* Tre opzioni: la giusta più due sbagliate, in ordine casuale. */
export function opzioni(giusta, altre, quante = 2) {
  const diverse = mescola([...new Set(altre.filter(x => x !== giusta))]).slice(0, quante);
  return mescola([giusta, ...diverse]);
}

export function leggiRecord(chiave) {
  try { return parseInt(localStorage.getItem(`sf:gioco:${chiave}`) || '0', 10) || 0; }
  catch (e) { return 0; }
}

export function salvaRecord(chiave, punti) {
  const prima = leggiRecord(chiave);
  if (punti > prima) {
    try { localStorage.setItem(`sf:gioco:${chiave}`, String(punti)); } catch (e) {}
  }
  return prima;
}

export function pallini(fatti, i, totale) {
  let h = '<div class="pallini" aria-hidden="true">';
  for (let k = 0; k < totale; k++) {
    const c = fatti[k] === true ? 'ok' : fatti[k] === false ? 'ko' : (k === i ? 'ora' : '');
    h += `<i class="${c}"></i>`;
  }
  return h + '</div>';
}

export function intestazione(i, totale, fatti) {
  return `<div class="punti"><span>Domanda ${i + 1} di ${totale}</span>${pallini(fatti, i, totale)}</div>`;
}

/* Il messaggio finale incoraggia sempre: anche con pochi punti si riprova. */
function messaggio(punti, totale) {
  const q = punti / totale;
  if (q === 1) return 'Perfetto! Le hai prese tutte.';
  if (q >= 0.8) return 'Molto bene! Ci sei quasi.';
  if (q >= 0.5) return 'Buon lavoro. Riprova e migliori ancora.';
  if (q >= 0.3) return 'Stai imparando. Rileggi le pagine e riprova.';
  return 'Non importa: rileggi le pagine e riprova, viene con l’esercizio.';
}

export function finale(punti, totale, chiave) {
  const stelle = punti >= totale * 0.9 ? 3 : punti >= totale * 0.6 ? 2 : punti >= totale * 0.3 ? 1 : 0;
  const prima = chiave ? salvaRecord(chiave, punti) : 0;
  const record = prima > punti ? `<p class="muted">Il tuo record: ${prima} su ${totale}</p>` : '';
  const nuovo = chiave && punti > prima && prima > 0 ? '<p class="muted">È il tuo nuovo record!</p>' : '';
  return `<div class="fine">
    <div class="stelle" role="img" aria-label="${stelle === 1 ? '1 stella' : `${stelle} stelle`} su 3">${
      '★'.repeat(stelle)}<span class="spenta">${'★'.repeat(3 - stelle)}</span></div>
    <p class="quanto">${punti} su ${totale}</p>
    <p>${messaggio(punti, totale)}</p>${record}${nuovo}
  </div>
  <button class="avanti" type="button" data-ancora>Gioca ancora</button>`;
}

/* Scheletro comune: gestisce il giro delle domande, il feedback e il finale.
   Il gioco deve dare: quante domande, come si costruisce una domanda,
   come si disegna, e come si dice la risposta giusta. */
export function giostra(el, cfg) {
  const totale = cfg.totale || 10;
  let domande = [], i = 0, punti = 0, fatti = [];

  function nuova() {
    domande = Array.from({ length: totale }, (_, k) => cfg.crea(k));
    i = 0; punti = 0; fatti = [];
    mostra();
  }

  function mostra() {
    const q = domande[i];
    el.innerHTML = intestazione(i, totale, fatti) + cfg.disegna(q) +
      `<div class="scelte${cfg.scelteCorte ? ' corte' : ''}">${
        q.scelte.map(o => `<button type="button" data-s="${String(o).replace(/"/g, '&quot;')}">${o}</button>`).join('')
      }</div><p class="esito"></p><button class="avanti" type="button" hidden></button>`;

    if (cfg.dopoDisegno) cfg.dopoDisegno(q, el);

    let risposto = false;
    el.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => {
      if (risposto) return;
      risposto = true;
      const giusto = b.dataset.s === String(q.giusta);
      fatti[i] = giusto;
      if (giusto) punti++;
      el.querySelectorAll('[data-s]').forEach(x => {
        if (x.dataset.s === String(q.giusta)) x.className = 'ok';
        else if (x === b) x.className = 'ko';
      });
      el.querySelector('.esito').innerHTML = giusto
        ? `<span class="si">${cfg.seGiusto ? cfg.seGiusto(q) : 'Giusto!'}</span>`
        : `<span class="no">${cfg.seSbagliato ? cfg.seSbagliato(q) : `Era: ${q.giusta}`}</span>`;
      if (cfg.dopoRisposta) cfg.dopoRisposta(q, giusto);

      const av = el.querySelector('.avanti');
      av.hidden = false;
      av.textContent = i === totale - 1 ? 'Vedi il risultato' : 'Avanti';
      av.focus();
      av.addEventListener('click', () => {
        i++;
        if (i < totale) mostra();
        else {
          el.innerHTML = finale(punti, totale, cfg.record);
          el.querySelector('[data-ancora]').addEventListener('click', nuova);
        }
      }, { once: true });
    }));
  }

  nuova();
}
