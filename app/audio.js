/* Scuola facile — la voce del telefono (Web Speech API), condivisa fra le pagine
   delle lingue e il gioco “ascolta e scegli”.

   Nel testo i pulsanti si scrivono come <button class="say" data-say="…">;
   montaAudio() li collega. La velocità resta scelta per tutta la sessione. */

/* Negli script di controllo non c'è un browser: qui resta null e non parla nessuno. */
const sintesi = typeof window !== 'undefined' ? window.speechSynthesis : null;
let velocita = 0.85;
const voci = new Map();

export const vocePresente = lingua => {
  if (!sintesi) return false;
  const tutte = sintesi.getVoices() || [];
  if (!tutte.length) return null;           /* non ancora caricate: non si sa */
  const radice = lingua.split('-')[0];
  const v = tutte.find(x => new RegExp(`^${radice}(-|_|$)`, 'i').test(x.lang)) || null;
  voci.set(lingua, v);
  return !!v;
};

export function parla(testo, lingua = 'it-IT') {
  if (!sintesi || !testo) return;
  sintesi.cancel();
  const u = new SpeechSynthesisUtterance(testo);
  u.lang = lingua;
  u.rate = velocita;
  if (!voci.has(lingua)) vocePresente(lingua);
  const v = voci.get(lingua);
  if (v) u.voice = v;
  sintesi.speak(u);
}

export const cambiaVelocita = v => { velocita = v; };
export const velocitaOra = () => velocita;

/* Il pezzo di HTML con i due pulsanti Normale / Lenta. */
export const controlloVelocita = () =>
  `<div class="velocita">
     <span>Velocità:</span>
     <button type="button" data-v="0.85" aria-pressed="${velocita === 0.85}">Normale</button>
     <button type="button" data-v="0.55" aria-pressed="${velocita === 0.55}">Lenta</button>
   </div>`;

export const avvisoVoce = lingua =>
  `<p class="hl senza-voce" data-voce="${lingua}">Il telefono non ha questa voce. ` +
  `Vai in Impostazioni → Sintesi vocale e scarica la lingua.</p>`;

/* Collega i pulsanti dentro un pezzo di pagina. Si può richiamare più volte. */
export function montaAudio(radice) {
  radice.querySelectorAll('[data-say]').forEach(b => {
    if (b.dataset.collegato) return;
    b.dataset.collegato = '1';
    b.addEventListener('click', () => parla(b.dataset.say, b.dataset.lingua || 'it-IT'));
  });

  radice.querySelectorAll('[data-v]').forEach(b => {
    if (b.dataset.collegato) return;
    b.dataset.collegato = '1';
    b.addEventListener('click', () => {
      cambiaVelocita(parseFloat(b.dataset.v));
      /* i pulsanti di tutta la pagina devono mostrare la stessa scelta */
      document.querySelectorAll('[data-v]').forEach(x => {
        x.setAttribute('aria-pressed', String(parseFloat(x.dataset.v) === velocitaOra()));
      });
    });
  });

  const avvisi = radice.querySelectorAll('[data-voce]');
  if (!avvisi.length) return;
  const guarda = () => avvisi.forEach(a => {
    const c = vocePresente(a.dataset.voce);
    a.classList.toggle('serve', c === false);
  });
  guarda();
  if (sintesi) sintesi.addEventListener('voiceschanged', guarda, { once: false });
}
