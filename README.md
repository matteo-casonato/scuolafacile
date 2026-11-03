# Scuola facile

Piccola webapp per ripassare prima delle verifiche della scuola media.
Per ogni verifica offre tre cose:

1. **Ripasso digitale**: pagine da sfogliare sul telefono, un concetto per pagina.
2. **Ripasso stampabile**: le stesse pagine in A4, più uno **schema in una pagina**.
3. **Verifiche di prova** da stampare, con le soluzioni su un foglio separato.

Sito statico in JavaScript vanilla: niente framework, niente backend.
Si installa sul telefono (PWA) e funziona offline dopo la prima apertura.

## Come si usa

Apri la home, scegli la materia e la verifica. Nel ripasso si va avanti e
indietro con i pulsanti, con lo swipe o con le frecce della tastiera; il
pulsante **Ho capito** in fondo a ogni pagina colora la barra in alto, e il
telefono si ricorda dov’eri arrivato. **Stampa** manda in stampa tutte le
pagine, una per foglio.

## Come si naviga

**Home** → si sceglie la **materia** → si apre l’**archivio degli argomenti** di
quella materia. Ogni argomento ha tre pulsanti: **Ripassa** (le pagine da
sfogliare), **Stampa** (le stesse pagine in A4) e **Verifiche** (le prove da
stampare, con le soluzioni su un foglio a parte).

Il titolo di un argomento è l’argomento stesso, per esempio “Insiemi, grafici,
geometria e piano cartesiano”: non ci sono date.

## Com’è fatto

```
index.html        home: le materie
materia.html      archivio degli argomenti di una materia
ripasso.html      il ripasso digitale
verifica.html     le prove da stampare e le loro soluzioni
app/
  stile.css       sorgente del CSS (Tailwind v4 + classi semantiche)
  build.css       il CSS pubblicato: si genera, non si modifica a mano
  home.js         la home
  materia.js      l’archivio degli argomenti
  deck.js         navigazione, “Ho capito”, progressi
  blocchi.js      rende i blocchi di contenuto
  esercizi.js     rende gli esercizi di una prova
  audio.js        la voce del telefono, per le lingue
  icone.js        un disegno per materia
materie/<materia>/<cartella>/
  meta.json       materia e titolo dell’argomento
  ripasso.json    le pagine del ripasso
  schema.json     lo schema in una pagina
  verifiche/      le prove da stampare
indice.json       materie, colori e argomenti pubblicati
scripts/          controlli, screenshot, PDF, server locale
```

**I contenuti sono dati, non codice.** Aggiungere un argomento vuol dire
aggiungere una cartella in `materie/` e lanciare `npm run indice`: non serve
scrivere HTML né JavaScript. Il formato dei blocchi è descritto in
[FORMATO.md](FORMATO.md).

### Il CSS

Il CSS si scrive in `app/stile.css` (Tailwind v4) e si compila in
`app/build.css`, che è il file pubblicato e va committato. Le pagine dell’app
usano le utility di Tailwind; il deck, i blocchi dei contenuti e la stampa
usano classi semantiche (`.hl`, `.sym`, `.vs`, `.slide`…) così i file JSON dei
contenuti restano leggibili.

```bash
npm run css          # una volta
npm run css:watch    # mentre si lavora
```

## Lavorare al progetto

```bash
npm install
npm run serve      # http://localhost:8080
```

| comando | che cosa fa |
|---|---|
| `npm run serve` | server locale per provare l’app |
| `npm run css` | compila `app/stile.css` in `app/build.css` |
| `npm run controlla` | controlla i file di dati: tag ammessi, colori, punti, tipografia |
| `npm run indice` | rigenera `indice.json` leggendo le cartelle di `materie/` |
| `npm run foto -- <materia>/<cartella>` | screenshot a 390 px, tema chiaro e scuro |
| `npm run pdf -- <materia>/<cartella>` | il PDF del ripasso, una pagina per foglio |
| `node scripts/fedelta.mjs <ripasso.json> <originale.html>` | controlla che migrando non sia cambiato un testo |

> Prima di pubblicare: ricompila il CSS e **alza `VERSIONE` in `sw.js`**,
> altrimenti chi ha già l’app installata continua a vedere la versione vecchia.

## Licenze

- Il font **Atkinson Hyperlegible** (Braille Institute) è in `assets/font/`,
  con licenza SIL Open Font License 1.1.
- I glifi musicali vengono da **Noto Music**: licenza in
  `assets/font/NOTO-MUSIC-LICENSE.txt`.
- I testi dei ripassi sono scritti con parole proprie: non sono copiati dai
  libri di testo.
- L’icona dell’app è stata fornita da chi gestisce il progetto.
