/* Scuola facile — la home: materie, verifiche, data e stato del ripasso. */

const MESI = ['gennaio','febbraio','marzo','aprile','maggio','giugno',
              'luglio','agosto','settembre','ottobre','novembre','dicembre'];
const GIORNI = ['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'];

function quando(data) {
  if (!data) return 'data da confermare';
  const d = new Date(data + 'T12:00:00');
  if (isNaN(d)) return data;
  const testo = `${GIORNI[d.getDay()]} ${d.getDate()} ${MESI[d.getMonth()]}`;
  const oggi = new Date(); oggi.setHours(0, 0, 0, 0);
  const giorni = Math.round((d - oggi) / 86400000);
  if (giorni === 0) return `verifica oggi, ${testo}`;
  if (giorni === 1) return `verifica domani, ${testo}`;
  if (giorni > 1) return `verifica ${testo}, fra ${giorni} giorni`;
  return `verifica di ${testo}`;
}

/* Lo stato arriva dalla stessa chiave che usa il deck: sf:<materia>/<cartella>:p<pagine>. */
function stato(materia, cartella) {
  try {
    const pre = `sf:${materia}/${cartella}:p`;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k.startsWith(pre)) continue;
      const pagine = parseInt(k.slice(pre.length), 10);
      const s = JSON.parse(localStorage.getItem(k)) || {};
      return { pagine, fatte: Object.keys(s.got || {}).length };
    }
  } catch (e) { /* senza memoria si mostra la scheda senza barra */ }
  return null;
}

function barra(st) {
  if (!st || !st.pagine) return '';
  let h = '<div class="barra" aria-hidden="true">';
  for (let i = 0; i < st.pagine; i++) h += `<i${i < st.fatte ? ' class="done"' : ''}></i>`;
  return h + '</div>';
}

function scheda(v) {
  const st = stato(v.materia, v.cartella);
  const link = `ripasso.html?v=${v.materia}/${v.cartella}`;
  const altro = [];
  if (v.ha && v.ha.schema) altro.push('schema in una pagina');
  if (v.ha && v.ha.verifiche) altro.push(`${v.ha.verifiche} prove da stampare`);
  return `<a class="scheda" href="${link}">
    <b>${v.titolo}</b>
    <span class="quando">${quando(v.data)}</span>
    ${barra(st)}
    ${altro.length ? `<span class="altro">${altro.join(' · ')}</span>` : ''}
  </a>`;
}

async function avvia() {
  const el = document.getElementById('elenco');
  let dati;
  try {
    dati = await (await fetch('indice.json', { cache: 'no-cache' })).json();
  } catch (e) {
    el.innerHTML = '<p class="vuoto">Non riesco a leggere l’elenco delle verifiche.</p>';
    return;
  }
  const perMateria = new Map();
  for (const v of dati.verifiche || []) {
    if (!perMateria.has(v.materia)) perMateria.set(v.materia, []);
    perMateria.get(v.materia).push(v);
  }
  el.innerHTML = (dati.materie || []).map(m => {
    const vs = (perMateria.get(m.id) || [])
      .sort((a, b) => (b.data || '').localeCompare(a.data || ''));
    if (!vs.length) return '';
    return `<section class="materia c-${m.colore}">
      <h2>${m.nome}</h2>
      <div class="schede">${vs.map(scheda).join('')}</div>
    </section>`;
  }).join('') || '<p class="vuoto">Non c’è ancora nessuna verifica.</p>';
}

avvia();
