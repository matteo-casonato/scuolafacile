/* Scuola facile — rende i blocchi di contenuto in HTML.
   Un blocco è un oggetto con "t" (tipo). Vedi FORMATO.md.
   I testi possono contenere solo i tag inline ammessi da scripts/controlla.mjs. */

/* I marker delle frecce, usati dai disegni con marker-start / marker-end. */
const COLORI_MARKER = ['blue', 'green', 'orange', 'purple', 'red', 'ink'];
export const SVG_DEFS =
  '<defs>' +
  COLORI_MARKER.map(c =>
    `<marker id="a-${c}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" ` +
    `orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="f-${c}"/></marker>`
  ).join('') +
  '</defs>';

const attr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/* Una voce di lista o di colonna: stringa, oppure { stile, x }. */
function paragrafo(voce) {
  if (typeof voce === 'string') return `<p>${voce}</p>`;
  const cls = voce.stile ? ` class="${attr(voce.stile)}"` : '';
  return `<p${cls}>${voce.x}</p>`;
}

function colonna(c) {
  const titolo = c.titolo ? `<h4>${c.titolo}</h4>` : '';
  return `<div>${titolo}${(c.x || []).map(paragrafo).join('')}</div>`;
}

function tabella(b) {
  let h = '<div class="tblwrap"><table class="tbl">';
  if (b.intestazione) h += '<tr>' + b.intestazione.map(c => `<th>${c}</th>`).join('') + '</tr>';
  for (const riga of b.righe || []) {
    h += '<tr>' + riga.map((c, i) =>
      b.intestazioneRighe && i === 0 ? `<th>${c}</th>` : `<td>${c}</td>`
    ).join('') + '</tr>';
  }
  return h + '</table></div>';
}

/* Lo schema in una pagina: riquadri colorati intorno al titolo della materia.
   Le frecce le disegna schema.js, solo sullo schermo largo e in stampa. */
export function renderSchema(s) {
  let h = `<div class="mp"><div class="mp-c"><div class="mp-t">${s.centro}</div>` +
          `<div class="mp-s">${s.sotto || ''}</div></div>`;
  (s.riquadri || []).forEach((k, i) => {
    const corpo = k.voci
      ? '<ul>' + k.voci.map(v => `<li>${v}</li>`).join('') + '</ul>'
      : (k.blocchi ? renderBlocchi(k.blocchi) : (k.x || ''));
    h += `<div class="mp-k k${i + 1}" style="--k:var(--${k.colore})"><h4>${k.titolo}</h4>${corpo}</div>`;
  });
  h += '<div class="mp-k mp-err" style="--k:var(--red)"><h4>Errori da non fare</h4><ul>' +
       (s.errori || []).map(e => `<li>${e}</li>`).join('') +
       '</ul></div></div>';
  return h;
}

const TIPI = {
  p: b => paragrafo(b),

  h: b => `<h3${b.colore ? ` class="f-${attr(b.colore)}"` : ''}>${b.x}</h3>`,

  hl: b => `<p class="hl">${b.x}</p>`,

  sym: b => {
    const cls = 'big-sym' + (b.piccolo ? ' sm' : '') + (b.colore ? ` f-${attr(b.colore)}` : '');
    const st = b.style ? ` style="${attr(b.style)}"` : '';
    return `<div class="sym"><span class="${cls}"${st}>${b.simbolo}</span><div>${b.x}</div></div>`;
  },

  vs: b => `<div class="vs">${colonna(b.a)}${colonna(b.b)}</div>`,

  tbl: tabella,

  sol: b => `<details class="sol"><summary>${b.d}</summary><p>${b.r}</p></details>`,

  passi: b => '<ol class="steps">' + b.x.map(p => `<li><span>${p}</span></li>`).join('') + '</ol>',

  check: b => '<ul class="check">' + b.x.map(v => `<li><span>${v}</span></li>`).join('') + '</ul>',

  riquadro: b =>
    `<h3>${b.titolo || 'Nel riquadro'}</h3>` +
    `<div class="sol" style="padding:10px 12px"><p class="formula" style="margin:4px 0">${b.x}</p></div>`,

  /* Disegno scritto a mano nel file di dati. Le classi sono quelle del design system. */
  svg: b =>
    `<svg viewBox="${attr(b.viewBox)}" role="img" aria-label="${attr(b.alt || '')}"` +
    `${b.classe ? ` class="${attr(b.classe)}"` : ''}>${SVG_DEFS}${b.body}</svg>`,

  /* Riga di iconcine con didascalia. */
  icrow: b => '<div class="icrow">' + b.x.map(i =>
    `<div class="ici">${i.svg}<span class="cap">${i.cap}</span></div>`).join('') + '</div>',

  why: b => b.x.map(i => `<div class="why"><span>${i.segno}</span><div>${i.x}</div></div>`).join(''),

  /* Il gioco lo monta app/giochi/*.js: qui si lascia solo il posto. */
  gioco: b => `<div class="gioco" data-gioco="${attr(b.tipo)}" data-dati="${attr(JSON.stringify(b))}"></div>`,

  /* “Tutto in una pagina”: lo schema arriva da schema.json. */
  schema: (b, ctx) => (ctx && ctx.schema ? renderSchema(ctx.schema) : ''),
};

export function renderBlocchi(blocchi, ctx) {
  return (blocchi || []).map(b => {
    const f = TIPI[b.t];
    if (!f) {
      console.warn('Scuola facile: blocco sconosciuto', b.t);
      return '';
    }
    return f(b, ctx);
  }).join('\n');
}

export const TIPI_NOTI = Object.keys(TIPI);
