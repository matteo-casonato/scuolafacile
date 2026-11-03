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

## Com’è fatto

```
index.html        home: materie e verifiche
ripasso.html      il ripasso digitale
app/              CSS e JavaScript condivisi
  app.css         token, componenti, tema scuro
  print.css       la stampa
  deck.js         navigazione, “Ho capito”, progressi
  blocchi.js      rende i blocchi di contenuto
materie/<materia>/<cartella>/
  meta.json       dati della verifica
  ripasso.json    le pagine del ripasso
  schema.json     lo schema in una pagina
  verifiche/      le prove da stampare
indice.json       elenco delle materie e delle verifiche
scripts/          controlli, screenshot, PDF, server locale
```

**I contenuti sono dati, non codice.** Aggiungere una verifica vuol dire
aggiungere una cartella in `materie/` e una riga in `indice.json`: non serve
scrivere HTML né JavaScript. Il formato dei blocchi è descritto in
[FORMATO.md](FORMATO.md).

## Lavorare al progetto

```bash
npm install
npm run serve      # http://localhost:8080
```

| comando | che cosa fa |
|---|---|
| `npm run serve` | server locale per provare l’app |
| `npm run controlla` | controlla i file di dati: tag ammessi, colori, punti, tipografia |
| `npm run indice` | rigenera `indice.json` leggendo le cartelle di `materie/` |
| `npm run foto -- <materia>/<cartella>` | screenshot a 390 px, tema chiaro e scuro |
| `npm run pdf -- <materia>/<cartella>` | il PDF del ripasso, una pagina per foglio |

## Licenze

- Il font **Atkinson Hyperlegible** (Braille Institute) è in `assets/font/`,
  con licenza SIL Open Font License 1.1.
- I glifi musicali vengono da **Noto Music**: licenza in
  `assets/font/NOTO-MUSIC-LICENSE.txt`.
- I testi dei ripassi sono scritti con parole proprie: non sono copiati dai
  libri di testo.
