# Il formato dei contenuti

I contenuti di Scuola facile sono **dati, non codice**: per aggiungere una
verifica si creano i file JSON di una cartella in `materie/`, senza scrivere
HTML né JavaScript. Questo file descrive quei formati.

Dopo ogni modifica:

```bash
npm run controlla
```

## Il ripasso

`ripasso.json` è: un titolo, l’elenco delle sezioni con il loro colore, e le pagine.
Ogni pagina è una sezione, un titolo e una lista di **blocchi**.

```
{ "t": "p",      "x": "…", "stile": "lead" | "muted" | "formula" | "task" }
{ "t": "h",      "x": "…", "colore": "red" }            sottotitolo
{ "t": "hl",     "x": "…" }                             frase evidenziata in giallo
{ "t": "sym",    "simbolo": "∈", "x": "…", "piccolo": true }
{ "t": "vs",     "a": { "titolo": "…", "x": ["…"] }, "b": { … } }
{ "t": "tbl",    "intestazione": ["…"], "righe": [["…"]] }
{ "t": "sol",    "d": "domanda", "r": "risposta" }       si apre al tocco
{ "t": "passi",  "x": ["…", "…", "…"] }                  i 3 passi numerati
{ "t": "check",  "x": ["…"] }                            lista con caselle
{ "t": "riquadro", "x": "…" }                            “Nel riquadro” del quaderno
{ "t": "fig",    "disegno": "venn", … }                  disegno parametrico, vedi sotto
{ "t": "svg",    "viewBox": "…", "alt": "…", "body": "…" }  disegno su misura
{ "t": "gioco",  "tipo": "scelta" | "ascolta" | "note", … }
```

Dentro i testi resta **un sottoinsieme di HTML inline**: `<b> <i> <u> <br>` e
`<span class="muted">`, `<span class="f-red">` e gli altri colori. Non uso
Markdown: serve a tenere i testi già approvati **identici carattere per
carattere**, compresi `H₂O`, `cm³`, `∉`, le virgolette “ ” e l’apostrofo ’.
`scripts/controlla.mjs` rifiuta qualsiasi altro tag.

Il colore della pagina non si scrive mai: arriva dalla sua sezione.
La chiave di salvataggio è `sf:<materia>/<slug>:p<numero di pagine>`: cambia da
sola quando aggiungo o toglio una pagina, senza doversi ricordare di una versione.

### Esempio vero: tre pagine di matematica

Testo copiato dal deck attuale, non riscritto.

```json
{
  "titolo": "Matematica facile",
  "sezioni": [
    { "nome": "Si parte",         "colore": "ink"    },
    { "nome": "Insiemi",          "colore": "blue"   },
    { "nome": "Grafici",          "colore": "green"  },
    { "nome": "Geometria",        "colore": "orange" },
    { "nome": "Assiomi",          "colore": "purple" },
    { "nome": "Piano cartesiano", "colore": "blue"   },
    { "nome": "Ripasso",          "colore": "red"    }
  ],
  "pagine": [
    {
      "sezione": "Si parte",
      "titolo": "Matematica facile",
      "blocchi": [
        { "t": "p", "stile": "lead",
          "x": "Ripasso: insiemi, grafici, geometria e piano cartesiano." },
        { "t": "h", "x": "Per ogni esercizio fai così" },
        { "t": "passi", "x": [
          "<b>Leggi</b> la consegna due volte.",
          "<b>Sottolinea</b> le parole importanti: “un solo”, “non”, “distinti”…",
          "<b>Disegna</b>, se puoi. Anche un disegno piccolo aiuta."
        ] }
      ]
    },
    {
      "sezione": "Insiemi",
      "titolo": "3 modi per rappresentare un insieme",
      "blocchi": [
        { "t": "h", "x": "1. Per elencazione" },
        { "t": "p", "stile": "formula", "x": "A = {do, re, mi, fa, sol, la, si}" },
        { "t": "h", "x": "2. Per caratteristica" },
        { "t": "p", "stile": "formula",
          "x": "A = {x <span class=\"f-red\">|</span> x è una nota musicale}" },
        { "t": "p", "x": "La sbarretta | si legge “<b class=\"f-red\">tale che</b>”." },
        { "t": "h", "x": "3. Con il diagramma di Eulero-Venn" },
        { "t": "p", "x": "Una linea chiusa con dentro gli elementi, ognuno con un puntino." },
        { "t": "fig", "disegno": "venn",
          "alt": "Diagramma delle note, sa è fuori",
          "viewBox": "0 0 330 165",
          "insiemi": [
            { "nome": "A", "colore": "blue", "cx": 140, "cy": 90, "rx": 120, "ry": 62,
              "elementi": [
                ["do", 60, 75], ["re", 120, 60], ["mi", 185, 70], ["fa", 80, 120],
                ["sol", 140, 130], ["la", 200, 112], ["si", 120, 98]
              ] }
          ],
          "fuori": [["sa", 285, 92]],
          "etichette": [{ "x": 298, "y": 125, "testo": "fuori", "colore": "red", "piccolo": true }]
        },
        { "t": "hl", "x": "Chi sta fuori dalla linea non appartiene all’insieme: sa ∉ A." }
      ]
    },
    {
      "sezione": "Insiemi",
      "titolo": "Dalla caratteristica all’elenco",
      "blocchi": [
        { "t": "p", "x": "La regola si scrive dopo la sbarretta <b>|</b>, che si legge “tale che”." },
        { "t": "h", "x": "Esempio 1" },
        { "t": "p", "stile": "formula", "x": "A = {x | x è una vocale}" },
        { "t": "p", "x": "Si legge: “gli x <b>tali che</b> x è una vocale”." },
        { "t": "p", "stile": "formula", "x": "A = {a, e, i, o, u}" },
        { "t": "h", "x": "Esempio 2" },
        { "t": "p", "stile": "formula", "x": "B = {x | x è un colore<br>del semaforo}" },
        { "t": "p", "x": "Si legge: “gli x <b>tali che</b> x è un colore del semaforo”." },
        { "t": "p", "stile": "formula", "x": "B = {rosso, giallo, verde}" },
        { "t": "h", "x": "Esempio 3" },
        { "t": "p", "stile": "formula", "x": "C = {x | x è un numero dispari<br>minore di 10}" },
        { "t": "p", "x": "Si legge: “gli x <b>tali che</b> x è un numero dispari minore di 10”." },
        { "t": "p", "stile": "formula", "x": "C = {1, 3, 5, 7, 9}" },
        { "t": "p", "stile": "muted",
          "x": "A volte trovi scritto x ∈ ℕ: vuol dire solo “x è un numero naturale”, cioè un numero senza virgola: 0, 1, 2, 3…" },
        { "t": "p", "stile": "muted",
          "x": "Per esempio, C si può scrivere anche così:<br>C = {x ∈ ℕ | x è dispari e minore di 10}" }
      ]
    }
  ]
}
```

## I disegni

È il punto più delicato: oggi i disegni sono **funzioni Python** (`venn_notes()`,
`cart9()`, `staff()`), quindi vivono nel codice, non nei dati. Faccio così:

1. **Disegni parametrici** in `app/figure.js`, guidati solo dai dati, per quelli
   che tornano sempre: `venn` (insiemi, con elementi dentro e fuori), `cart`
   (piano cartesiano con punti e tratteggi), `retta` (retta, semiretta,
   segmento), `staff` (pentagramma con note e glifi Noto Music), `barre`,
   `torta`, `ideogramma`, `mappa` (riquadri e frecce).
2. **Blocco `svg`** per un disegno che capita una volta sola: il disegno sta nel
   file di dati come SVG, con le classi del design system (`s-blue`, `t-orange`,
   `f-red`). Sempre dati, nessun codice nuovo.

Così una verifica nuova non richiede codice: i disegni ricorrenti sono già
pronti, quelli nuovi sono SVG dentro il JSON. Codice nuovo solo quando un tipo
di disegno si ripresenta abbastanza da meritare un parametro in più.

**Per ora esiste solo il punto 2.** I 21 disegni di matematica stanno nei dati
come blocchi `svg`. I disegni parametrici arriveranno quando si vedrà quali si
ripetono davvero fra una materia e l’altra.

## Lo schema in una pagina

Copia diretta di `summ.render()`:

```json
{
  "centro": "Matematica",
  "sotto": "insiemi · grafici · geometria · piano cartesiano",
  "riquadri": [
    { "titolo": "Insiemi", "colore": "blue", "voci": [
      "Insieme = maiuscola (A), elemento = minuscola (a)",
      "<b>∈</b> appartiene · <b>∉</b> non appartiene",
      "Uguali · finito · infinito · <b>vuoto ∅</b>"
    ] },
    { "titolo": "Geometria", "colore": "orange", "disegni": ["punto", "retta", "piano"],
      "voci": ["…"] }
  ],
  "errori": [
    "Il piano ha due DIMENSIONI, non “lati”",
    "3 punti allineati: infiniti piani · non allineati: uno"
  ]
}
```

Sei riquadri, il settimo è sempre “Errori da non fare” in rosso e senza freccia.
In stampa un solo A4 orizzontale con le frecce; sul telefono i riquadri in
colonna, senza frecce. `voci` accetta anche un blocco `tbl` o `fig`, come fa
oggi musica con la tabella delle durate.

## Le verifiche

```json
{
  "titolo": "Verifica di grammatica",
  "sotto": "Dittonghi, trittonghi, iato · digrammi e trigrammi · omografi · ordine alfabetico",
  "livello": "normale",
  "promemoria": "<b>Prima di iniziare:</b> leggi ogni consegna <b>due volte</b> e sottolinea le parole importanti. Fai un esercizio alla volta.",
  "esercizi": [
    { "tipo": "parole", "punti": 8, "colonne": 4,
      "consegna": "Cerchia il dittongo in ogni parola.",
      "regola": "Il dittongo è l’unione di due vocali che si pronunciano con una sola emissione di voce.",
      "parole": ["fiore", "piede", "buono", "guerra", "causa", "poi", "lei", "quadro"],
      "soluzione": "f<b>io</b>re · p<b>ie</b>de · b<b>uo</b>no · g<b>ue</b>rra (u si pronuncia) · c<b>au</b>sa · p<b>oi</b> · l<b>ei</b> · q<b>ua</b>dro" },
    { "tipo": "tabella", "punti": 10,
      "consegna": "Dittongo, trittongo o iato? Metti una X nella colonna giusta.",
      "regola": "Trittongo = tre vocali in una sola sillaba. Iato = due vocali vicine che si dividono in due sillabe.",
      "colonne": ["Dittongo", "Trittongo", "Iato"],
      "righe": ["miei", "paura", "fiume", "suoi", "maestro"],
      "soluzione": "<b>Dittongo:</b> fiume · <b>Trittongo:</b> miei, suoi · <b>Iato:</b> paura, maestro" }
  ],
  "voto": [[55, 60, "10"], [49, 54, "9"], [43, 48, "8"], [37, 42, "7"], [31, 36, "6"]]
}
```

Tipi di esercizio: `parole` (griglia), `tabella` (parole per colonne da spuntare),
`righe` (parola → riga vuota), `completa` (buchi da riempire), `frasi`,
`gruppi` (ordine alfabetico), `libero` (righe vuote). Numero dell’esercizio,
griglia dei punti e totale li calcola lo script: nei dati non si ripetono.
Le soluzioni stanno nello stesso file e finiscono su una pagina separata da
staccare, con i trabocchetti spiegati e il voto a fasce.

## I giochi

Un gioco è un blocco come gli altri: `{ "t": "gioco", "tipo": … }`. Si monta
solo quando la pagina viene aperta davvero, e in stampa sparisce.

Tutti e tre fanno 10 domande (`totale`), danno la risposta subito, mostrano i
pallini verdi e rossi mentre si va avanti e finiscono con le stelle. Con
`record` si dà un nome alla chiave del punteggio migliore, che resta sul
telefono; senza, il record non si salva.

### Scelta multipla

```json
{ "t": "gioco", "tipo": "scelta", "record": "musica-durate", "totale": 10,
  "consegna": "Quanto dura questa figura?",
  "elenco": [
    { "d": "semibreve", "r": "4 tempi" },
    { "d": "minima", "r": "2 tempi" },
    { "d": "Quante righe ha il pentagramma?", "r": "5",
      "consegna": "Rispondi.", "sbagliate": ["4", "6", "7"] }
  ] }
```

Le domande si pescano a caso dall’`elenco`, mescolato, così non si ripetono
subito. Le due risposte sbagliate vengono da `sbagliate`; se manca, si prendono
dalle risposte delle altre domande. `consegna` vale per tutto il mazzo e si può
riscrivere dentro una singola domanda, quando il mazzo mette insieme domande di
tipo diverso. Servono almeno 3 domande.

### Ascolta e scegli

```json
{ "t": "gioco", "tipo": "ascolta", "lingua": "de-DE", "record": "tedesco-verbi",
  "totale": 10,
  "voci": [
    { "testo": "ich wohne", "it": "io abito" },
    { "testo": "du wohnst", "it": "tu abiti" },
    { "testo": "er wohnt", "it": "lui abita" }
  ] }
```

Usa la voce del telefono (Web Speech API). Sopra il gioco ci sono i due pulsanti
**Normale** e **Lenta**; se il telefono non ha quella lingua installata, compare
un avviso giallo che spiega dove scaricarla. `it` è la traduzione, mostrata
insieme alla risposta. Servono almeno 3 frasi.

### Che nota è?

```json
{ "t": "gioco", "tipo": "note", "chiave": "sol", "da": -2, "a": 9,
  "record": "musica-note", "totale": 10 }
```

Disegna una nota sul pentagramma con i glifi di Noto Music. `chiave` è `"sol"`
oppure `"basso"`. `da` e `a` sono i gradi: **0 è la riga più in basso**, 1 il
primo spazio, 2 la seconda riga, e così via; i numeri negativi e quelli sopra 8
escono dal pentagramma e prendono i tagli addizionali. I sette pulsanti restano
sempre nello stesso ordine, da Do a Si: cercarli ogni volta stanca.
