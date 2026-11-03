/* Scuola facile — i tipi di esercizio di una verifica stampabile.
   Ognuno riceve i dati dell'esercizio e restituisce il corpo da stampare.
   Le soluzioni non stanno qui: vanno sul foglio a parte. */

const attr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const riga = (largo = '28mm') => `<span class="riga-vuota" style="min-width:${attr(largo)}"></span>`;

const TIPI = {
  /* Parole in griglia: da cerchiare, sottolineare, guardare. */
  parole: e => `<div class="parole${e.colonne === 5 ? ' cinque' : ''}">${
    e.parole.map(p => `<span>${p}</span>`).join('')}</div>`,

  /* Una parola per riga e una casella per colonna, da spuntare. */
  tabella: e => `<table><tr><th style="width:30%">${e.prima || 'Parola'}</th>${
    e.colonne.map(c => `<th>${c}</th>`).join('')}</tr>${
    e.righe.map(r => `<tr><td><b>${r}</b></td>${
      e.colonne.map(() => '<td></td>').join('')}</tr>`).join('')}</table>`,

  /* Una parola e lo spazio per scrivere accanto: sillabe, traduzioni, definizioni. */
  righe: e => `<table>${e.righe.map(r =>
    `<tr><td style="width:32%"><b>${r}</b></td><td></td></tr>`).join('')}</table>`,

  /* Parole con un buco in mezzo: ba___o. */
  completa: e => `<div class="parole">${e.buchi.map(([a, b]) =>
    `<span>${a}${riga(e.largo || '12mm')}${b}</span>`).join('')}</div>`,

  /* Frasi con uno o più spazi da riempire, e un aiuto fra parentesi. */
  frasi: e => e.frasi.map(f => {
    const pezzi = f.pezzi || f;
    const corpo = pezzi.join(` ${riga(e.largo)} `);
    return `<p class="frase">${corpo}${f.nota ? ` <span class="nota">(${f.nota})</span>` : ''}</p>`;
  }).join(''),

  /* Gruppi di parole da riordinare, con una o due righe per rispondere. */
  gruppi: e => e.gruppi.map(g =>
    `<p class="gruppo">${g.join(' · ')}</p>` +
    '<span class="riga-lunga"></span>'.repeat(e.righe || 1)).join(''),

  /* Un testo da leggere e una tabella da riempire. */
  testo: e => `<p class="frase" style="font-size:18px">${e.x}</p>` +
    (e.colonne ? `<table><tr>${e.colonne.map(c => `<th>${c}</th>`).join('')}</tr><tr>${
      e.colonne.map(() => `<td style="height:${attr(e.altezza || '22mm')}"></td>`).join('')}</tr></table>` : ''),

  /* Solo righe vuote. */
  libero: e => '<span class="riga-lunga"></span>'.repeat(e.righe || 3),

  /* Una lista di cose da spuntare: il controllo finale di una ricerca. */
  spunta: e => `<ul class="check">${e.x.map(v => `<li><span>${v}</span></li>`).join('')}</ul>`,
};

export const TIPI_ESERCIZIO = Object.keys(TIPI);

export function corpoEsercizio(e) {
  const f = TIPI[e.tipo];
  if (!f) {
    console.warn('Scuola facile: esercizio sconosciuto', e.tipo);
    return '';
  }
  return f(e);
}

export function renderVerifica(v) {
  /* Una scheda di ricerca si stampa come una verifica, ma non si dà un voto:
     niente punti, niente griglia, niente foglio delle soluzioni. */
  const conPunti = !v.senzaPunti;
  const esercizi = v.esercizi || [];
  const punti = esercizi.map(e => e.punti || 0);
  const totale = punti.reduce((a, b) => a + b, 0);

  const testa = `<div class="prova-testa">
      <div><h1>${v.titolo}</h1>${v.sotto ? `<div class="sotto">${v.sotto}</div>` : ''}</div>
      <div class="campi">Nome ____________________<br>Data ____________________</div>
    </div>` +
    (v.promemoria ? `<p class="promemoria">${v.promemoria}</p>` : '');

  const corpo = esercizi.map((e, i) => `<div class="esercizio">
      <h2><span><span class="numero">${i + 1}</span>${e.consegna}</span>
          ${conPunti ? `<span class="quanti">${e.punti} punti</span>` : ''}</h2>
      ${e.regola ? `<p class="regola">${e.regola}</p>` : ''}
      ${corpoEsercizio(e)}
    </div>`).join('');

  const griglia = `<table class="punteggi">
      <tr><th>Esercizio</th>${esercizi.map((_, i) => `<th>${i + 1}</th>`).join('')}<th>Totale</th></tr>
      <tr><td>Punti</td>${punti.map(p => `<td>/${p}</td>`).join('')}<td>/${totale}</td></tr>
    </table>`;

  const voto = (v.voto || []).length
    ? `<h2>Voto indicativo</h2><p>${v.voto.map(([da, a, n]) =>
        `${da}–${a}: <b>${n}</b>`).join(' · ')}</p>`
    : '';

  const soluzioni = `<div class="soluzioni">
      <h1>Soluzioni <span class="nota">(per l’adulto)</span></h1>
      ${esercizi.map((e, i) =>
        `<h2>${i + 1}. ${e.titoloSoluzione || e.consegna.replace(/<[^>]*>/g, '')}</h2>
         <p>${e.soluzione}</p>` +
        (e.trabocchetto ? `<p class="nota">Trabocchetto: ${e.trabocchetto}</p>` : '')).join('')}
      ${voto}
    </div>`;

  if (!conPunti) return `<div class="prova">${testa}${corpo}</div>`;
  return `<div class="prova">${testa}${corpo}${griglia}${soluzioni}</div>`;
}
