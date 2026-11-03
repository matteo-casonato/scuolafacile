/* Scuola facile — un disegno per materia, usato nella home e nelle liste.
   Tratto semplice, colore ereditato: funziona anche in tema scuro. */

const s = (vb, body) =>
  `<svg viewBox="${vb}" class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const ICONE = {
  /* i quattro segni delle operazioni */
  matematica: s('0 0 24 24',
    '<path d="M3 7h6M6 4v6"/>' +
    '<path d="M15 7h6"/>' +
    '<path d="M4.5 15.5l4 4M8.5 15.5l-4 4"/>' +
    '<path d="M15 17.5h6"/><circle cx="18" cy="14.5" r=".9" fill="currentColor"/>' +
    '<circle cx="18" cy="20.5" r=".9" fill="currentColor"/>'),
  /* beuta */
  scienze: s('0 0 24 24',
    '<path d="M10 3h4"/><path d="M11 3v6.2L5.6 18A2 2 0 0 0 7.3 21h9.4a2 2 0 0 0 1.7-3L13 9.2V3"/>' +
    '<path d="M8 15h8"/>'),
  /* nota musicale */
  musica: s('0 0 24 24',
    '<circle cx="7" cy="18" r="3"/><circle cx="18" cy="15" r="3"/><path d="M10 18V6l11-2v11"/>'),
  /* mappamondo */
  geografia: s('0 0 24 24',
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><ellipse cx="12" cy="12" rx="4" ry="9"/>'),
  /* due fumetti: si parla */
  tedesco: s('0 0 24 24',
    '<path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h7A2.5 2.5 0 0 1 15 6.5v3A2.5 2.5 0 0 1 12.5 12H8l-3.5 3v-3H5.5A2.5 2.5 0 0 1 3 9.5z"/>' +
    '<path d="M18 9h.5A2.5 2.5 0 0 1 21 11.5v3A2.5 2.5 0 0 1 18.5 17H18l-3 3v-3"/>'),
  /* libro aperto */
  italiano: s('0 0 24 24',
    '<path d="M12 6.5C10.5 5 8.5 4.3 6 4.3c-1 0-2 .1-3 .4v13.6c1-.3 2-.4 3-.4 2.5 0 4.5.7 6 2.2"/>' +
    '<path d="M12 6.5c1.5-1.5 3.5-2.2 6-2.2 1 0 2 .1 3 .4v13.6c-1-.3-2-.4-3-.4-2.5 0-4.5.7-6 2.2z"/>'),
  /* ramo d’ulivo */
  religione: s('0 0 24 24',
    '<path d="M4 20c6-1 11-5 15-12"/>' +
    '<path d="M12 12.5c1-2.4 3.2-3.4 5.5-3-.3 2.3-1.9 4-4.3 4.2"/>' +
    '<path d="M8.5 16.2c.3-2.4 2-4 4.4-4.3.3 2.3-.9 4.4-3 5.3"/>' +
    '<path d="M15.5 8.3c1.3-2 3.5-2.6 5.6-1.9-.8 2.1-2.7 3.4-5 3.2"/>'),
};

export const icona = id => ICONE[id] || s('0 0 24 24', '<circle cx="12" cy="12" r="8"/>');
