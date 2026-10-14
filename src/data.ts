export type Entity =
  | "Ground"
  | "Tower"
  | "Departure"
  | "Approach"
  | "Control"
  | "AWACS";
export type Phase = "Preparazione" | "Partenza" | "In rotta" | "Rientro";
export type Role = "pilot" | "controller" | "readback";
export type Exchange = { role: Role; text: string };
export type Scenario = {
  id: string;
  title: string;
  subtitle: string;
  entity: Entity;
  phase: Phase;
  procedure: "VFR" | "IFR" | "Tutte";
  section: string;
  pages: number[];
  kind: "Esempio" | "Modello";
  source?: "lesson";
  note: string;
  remember: string;
  exchanges: Exchange[];
};

export const entities: { id: Entity; description: string; code: string }[] = [
  { id: "Ground", description: "Avviamento e rullaggio", code: "GND" },
  { id: "Tower", description: "Pista e circuito", code: "TWR" },
  { id: "Departure", description: "Uscita e salita", code: "DEP" },
  { id: "Approach", description: "Rientro e avvicinamento", code: "APP" },
  { id: "Control", description: "Controllo in rotta", code: "CTL" },
  { id: "AWACS", description: "Controllo tattico", code: "AWACS" },
];
export const phases: Phase[] = [
  "Preparazione",
  "Partenza",
  "In rotta",
  "Rientro",
];

export const scenarios: Scenario[] = [
  {
    id: "radio-check",
    title: "Radio check",
    subtitle: "Verifica la qualità della trasmissione",
    entity: "Ground",
    phase: "Preparazione",
    procedure: "Tutte",
    section: "10.2.1",
    pages: [117, 118],
    kind: "Esempio",
    note: "Al primo contatto indica prima il destinatario, poi il tuo callsign e infine il messaggio. Il controllo radio precede la richiesta di avviamento.",
    remember:
      "La leggibilità va da 1 (illeggibile) a 5 (perfettamente leggibile).",
    exchanges: [
      { role: "pilot", text: "Al Minhad, BEAR 2-1, radio check" },
      { role: "controller", text: "BEAR 2-1, Al Minhad, read you 5 by 5" },
    ],
  },
  {
    id: "startup",
    title: "Richiesta di avviamento",
    subtitle: "Startup, meteo e autorizzazione alla partenza",
    entity: "Ground",
    phase: "Preparazione",
    procedure: "VFR",
    section: "10.2.1",
    pages: [118],
    kind: "Esempio",
    note: "Richiedi l’avviamento e il punto di uscita desiderato. Il controllore assegna la pista, il dato altimetrico, la partenza e il codice transponder.",
    remember:
      "Ripeti pista, altimeter/QNH, uscita assegnata e squawk. I valori mostrati appartengono all’esempio del manuale.",
    exchanges: [
      {
        role: "pilot",
        text: "Al Minhad, BEAR 2-1, request startup and departure via Sierra.",
      },
      {
        role: "controller",
        text: "BEAR 2-1, Al Minhad, startup approved, runway in use 08, wind 030 for 5kts, CAVOK, altimeter 2992, cleared via Sierra, squawk 4001 sequential",
      },
      {
        role: "readback",
        text: "Startup approved, runway in use 08, altimeter 2992 (or QNH 1013), departure via Sierra, squawk 4001 sequential, BEAR 2-1",
      },
    ],
  },
  {
    id: "startup-atis",
    title: "Avviamento con ATIS",
    subtitle: "Comunica l’informazione meteo ricevuta",
    entity: "Ground",
    phase: "Preparazione",
    procedure: "Tutte",
    section: "10.2.1",
    pages: [117, 118],
    kind: "Modello",
    note: "Se è presente un ATIS, ascoltalo prima della chiamata e riporta la lettera identificativa. I campi tra parentesi quadre vanno sostituiti con i dati della missione.",
    remember:
      "Information R (Romeo) identifica l’osservazione ATIS ricevuta, non un punto di navigazione.",
    exchanges: [
      {
        role: "pilot",
        text: "STATION, FLIGHT, request startup and departure via [VRP or SID], information R (Romeo).",
      },
      {
        role: "controller",
        text: "FLIGHT, STATION, cleared for startup, cleared via [VRP or SID] departure, squawk [SQUAWK] sequential",
      },
      {
        role: "readback",
        text: "Startup approved, cleared via [VRP or SID] departure, squawk [SQUAWK] sequential, FLIGHT",
      },
    ],
  },
  {
    id: "taxi-out",
    title: "Richiesta di rullaggio",
    subtitle: "Dal parcheggio al punto attesa",
    entity: "Ground",
    phase: "Preparazione",
    procedure: "VFR",
    section: "10.2.2",
    pages: [118, 119],
    kind: "Esempio",
    note: "Quando la formazione è pronta, comunica numero e tipo di velivoli, ruolo e posizione. Attendi l’autorizzazione prima di muoverti.",
    remember:
      "Il readback deve ripetere punto attesa, pista e taxiway assegnati.",
    exchanges: [
      {
        role: "pilot",
        text: "Al Minhad, BEAR 2-1, 4 F18 strike, apron south, request taxi, departure via November",
      },
      {
        role: "controller",
        text: "BEAR 2-1, Al Minhad, altimeter 2992 (or QNH 1013), taxi to holding point A runway 08 via S",
      },
      {
        role: "readback",
        text: "Altimeter 2992 (or QNH 1013), taxi to holding point A runway 08 via S, BEAR 2-1",
      },
    ],
  },
  {
    id: "ground-handoff",
    title: "Passaggio alla Tower",
    subtitle: "Cambio di frequenza prima della partenza",
    entity: "Ground",
    phase: "Partenza",
    procedure: "Tutte",
    section: "10.3.2",
    pages: [125],
    kind: "Esempio",
    note: "Il controllore Ground trasferisce la formazione alla Tower. Ripeti la frequenza assegnata prima di cambiare canale.",
    remember:
      "La frequenza 248.2 è un valore dell’esempio, da verificare nel briefing della missione.",
    exchanges: [
      { role: "controller", text: "BEAR 2-1 contact Al Minhad Tower on 248.2" },
      { role: "readback", text: "248.2, BEAR 2-1" },
    ],
  },
  {
    id: "line-up",
    title: "Allineamento in pista",
    subtitle: "Pronto alla partenza, line up and wait",
    entity: "Tower",
    phase: "Partenza",
    procedure: "Tutte",
    section: "10.2.3",
    pages: [119, 120],
    kind: "Esempio",
    note: "Al punto attesa dichiara ready for departure. Line up and wait autorizza l’allineamento e l’attesa in pista.",
    remember:
      "L’allineamento non è un’autorizzazione al decollo. Ripeti l’istruzione e la pista.",
    exchanges: [
      { role: "pilot", text: "BEAR 2-1, ready for departure" },
      { role: "controller", text: "BEAR 2-1, line up and wait runway 08" },
      { role: "readback", text: "Line up and wait runway 08, BEAR 2-1" },
    ],
  },
  {
    id: "takeoff",
    title: "Autorizzazione al decollo",
    subtitle: "Cleared for takeoff",
    entity: "Tower",
    phase: "Partenza",
    procedure: "Tutte",
    section: "10.2.3",
    pages: [120],
    kind: "Esempio",
    note: "Il termine takeoff è riservato all’autorizzazione al decollo. Nella richiesta iniziale usa ready for departure.",
    remember:
      "Il readback dell’autorizzazione e della pista è obbligatorio. Il vento è informativo e non richiede readback.",
    exchanges: [
      {
        role: "controller",
        text: "BEAR 2-1, cleared for takeoff runway 08, wind 030, 5 knots",
      },
      { role: "readback", text: "Cleared for takeoff runway 08, BEAR 2-1" },
    ],
  },
  {
    id: "vfr-departure",
    title: "Uscita VFR",
    subtitle: "Riporto al VRP e cambio di frequenza",
    entity: "Tower",
    phase: "Partenza",
    procedure: "VFR",
    section: "10.2.4",
    pages: [120],
    kind: "Esempio",
    note: "Riporta il punto di uscita autorizzato e la quota. Il manuale permette la chiamata circa 30 secondi prima del VRP.",
    remember:
      "Il riporto outbound è ancora diretto alla Tower. Cambia frequenza solo dopo il trasferimento assegnato dal controllore.",
    exchanges: [
      {
        role: "pilot",
        text: "Al Minhad, BEAR 2-1, November outbound, 3000 ft",
      },
      { role: "controller", text: "BEAR 2-1, contact Overlord, 265.0" },
      { role: "readback", text: "Push 265.0, BEAR 2-1" },
    ],
  },
  {
    id: "if-departure",
    title: "Partenza IFR",
    subtitle: "Primo contatto durante la SID",
    entity: "Departure",
    phase: "Partenza",
    procedure: "IFR",
    section: "10.2.5",
    pages: [120],
    kind: "Modello",
    note: "Dopo il passaggio dalla Tower all’Approach per la partenza, comunica quota attuale, quota autorizzata e nome della SID. I segnaposto del manuale sono tradotti in inglese.",
    remember:
      "Il manuale fornisce la chiamata iniziale senza una risposta standard. Sostituisci i campi con stazione, callsign, quote e SID della missione.",
    exchanges: [
      {
        role: "pilot",
        text: "STATION, FLIGHT, passing [CURRENT ALTITUDE] feet, climbing to [CLEARED ALTITUDE], on the [SID NAME] departure",
      },
    ],
  },
  {
    id: "cruise-request",
    title: "Richiesta di quota di crociera",
    subtitle: "Uscita dall’area aeroportuale",
    entity: "Departure",
    phase: "In rotta",
    procedure: "Tutte",
    section: "10.3.4",
    pages: [125],
    kind: "Esempio",
    note: "Al primo contatto comunica posizione, quota e livello di crociera desiderato. Il controllore può autorizzare inizialmente un livello intermedio.",
    remember:
      "Ripeti la quota effettivamente autorizzata: nell’esempio FL200, anche se hai richiesto FL320.",
    exchanges: [
      {
        role: "pilot",
        text: "Al Minhad Approach, BEAR 2-1, ECHO outbound 3000ft, requesting FL320 for cruise",
      },
      {
        role: "controller",
        text: "BEAR 2-1, Al Minhad, radar contact, climb FL200 initially",
      },
      { role: "readback", text: "Climb FL200, BEAR 2-1" },
    ],
  },
  {
    id: "enroute",
    title: "Salita al livello assegnato",
    subtitle: "Contatto con il controllo in rotta",
    entity: "Control",
    phase: "In rotta",
    procedure: "Tutte",
    section: "10.3.4",
    pages: [125],
    kind: "Esempio",
    note: "Dopo il cambio di frequenza, comunica al nuovo ente il livello verso cui stai salendo. Segui la successiva autorizzazione di salita.",
    remember:
      "Climb and maintain include sia la salita sia il mantenimento del livello assegnato.",
    exchanges: [
      { role: "pilot", text: "Emirates Control, BEAR 2-1, climbing FL200" },
      {
        role: "controller",
        text: "BEAR 2-1, Emirates Control, radar contact, climb and maintain FL320",
      },
      { role: "readback", text: "Climb and maintain FL320, BEAR 2-1" },
    ],
  },
  {
    id: "awacs-checkin",
    title: "Check-in con AWACS",
    subtitle: "Ingresso nell’area operativa",
    entity: "AWACS",
    phase: "In rotta",
    procedure: "Tutte",
    section: "10.3.4",
    pages: [126],
    kind: "Esempio",
    note: "Il riepilogo mostra un check-in as fragged con alpha check. La forma estesa a pagina 121 include numero, tipo, ruolo, posizione e quota.",
    remember:
      "Il bullseye è il riferimento condiviso per la posizione. I numeri riportati sono soltanto quelli dell’esempio.",
    exchanges: [
      {
        role: "pilot",
        text: "Overlord 1-1, BEAR 2-1, checking in as fragged, alpha check bullseye 200 for 30",
      },
      {
        role: "controller",
        text: "BEAR 2-1, Overlord 1-1, radar contact, alpha check sweet",
      },
    ],
  },
  {
    id: "checkout",
    title: "Check-out e RTB",
    subtitle: "Fine missione e ritorno alla base",
    entity: "AWACS",
    phase: "Rientro",
    procedure: "Tutte",
    section: "10.3.5",
    pages: [126],
    kind: "Esempio",
    note: "Comunica lo stato che motiva il rientro. Il manuale riporta, fra gli altri, Winchester, bingo fuel e mission complete.",
    remember:
      "Ripeti l’approvazione al rientro e la frequenza del prossimo ente.",
    exchanges: [
      { role: "pilot", text: "Overlord, BEAR 2-1, Winchester, RTB" },
      {
        role: "controller",
        text: "BEAR 2-1, RTB approved, contact Emirates CTL on 124.375",
      },
      { role: "readback", text: "RTB approved, 124.375, BEAR 2-1" },
    ],
  },
  {
    id: "descent",
    title: "Discesa per il rientro",
    subtitle: "Primo contatto con Control",
    entity: "Control",
    phase: "Rientro",
    procedure: "VFR",
    section: "10.3.6.1",
    pages: [126],
    kind: "Esempio",
    note: "Comunica tipo e numero di velivoli, distanza, punto di rientro e livello attuale. Attendi l’autorizzazione alla discesa.",
    remember: "Riporta il livello assegnato nella risposta al controllore.",
    exchanges: [
      {
        role: "pilot",
        text: "Emirates CTL, BEAR 2-1, 4 Hornet, 80NM inbound ECHO for landing, FL320",
      },
      {
        role: "controller",
        text: "BEAR 2-1, Emirates CTL, identified, descend FL100",
      },
      { role: "readback", text: "Descend FL100, BEAR 2-1" },
    ],
  },
  {
    id: "vfr-approach",
    title: "Avvicinamento VFR",
    subtitle: "Rientro al punto di riporto",
    entity: "Approach",
    phase: "Rientro",
    procedure: "VFR",
    section: "10.3.6.1",
    pages: [126],
    kind: "Esempio",
    note: "Comunica il livello in discesa e il punto di rientro. Il controllore assegna punto, quota e impostazione altimetrica.",
    remember:
      "Ripeti altimeter/QNH, punto autorizzato e quota. Non entrare nell’area aeroportuale senza l’autorizzazione prevista.",
    exchanges: [
      {
        role: "pilot",
        text: "Minhad APP, BEAR 2-1, descending FL100, ECHO inbound for landing",
      },
      {
        role: "controller",
        text: "BEAR 2-1, Minhad APP, proceed to ECHO, descend 2000ft on altimeter 29.80 (QNH 1009)",
      },
      {
        role: "readback",
        text: "Altimeter 29.80 (QNH 1009), proceed to ECHO, descent 2000ft, BEAR 2-1",
      },
    ],
  },
  {
    id: "ifr-vectors",
    title: "Vettori per l’avvicinamento IFR",
    subtitle: "Prua, discesa e approccio previsto",
    entity: "Approach",
    phase: "Rientro",
    procedure: "IFR",
    section: "10.3.6.2",
    pages: [126, 127],
    kind: "Esempio",
    note: "Il controllore assegna una prua e un livello per portarti verso l’approccio strumentale. Expect annuncia l’approccio previsto.",
    remember:
      "Expect ILS approach non è ancora l’autorizzazione a effettuare l’approccio.",
    exchanges: [
      {
        role: "pilot",
        text: "Dubai CTL, BEAR 2-1, 4 Hornet, 80NM inbound MIN TACAN, FL320",
      },
      {
        role: "controller",
        text: "BEAR 2-1, Dubai CTL, turn right heading 220, descend FL100, expect ILS approach runway 09",
      },
      { role: "readback", text: "Descend FL100, right heading 220, BEAR 2-1" },
    ],
  },
  {
    id: "ils-clearance",
    title: "Autorizzazione all’approccio ILS",
    subtitle: "Cleared for ILS approach",
    entity: "Approach",
    phase: "Rientro",
    procedure: "IFR",
    section: "10.3.6.2",
    pages: [127],
    kind: "Esempio",
    note: "Ricevi la prua finale, la quota e l’autorizzazione all’approccio. La chiamata del pilota è il readback completo dell’istruzione.",
    remember:
      "Ripeti prua, quota, impostazione altimetrica, tipo di approccio e pista.",
    exchanges: [
      {
        role: "controller",
        text: "BEAR 2-1, turn right heading 150, descend 2200ft on altimeter 29.80 (QNH 1009), cleared for ILS approach runway 09",
      },
      {
        role: "readback",
        text: "Turn right heading 150, descend 2200ft on altimeter 29.80 (QNH 1009), cleared for ILS approach runway 09, BEAR 2-1",
      },
    ],
  },
  {
    id: "circuit",
    title: "Ingresso nel circuito",
    subtitle: "Riporto initial e circuito autorizzato",
    entity: "Tower",
    phase: "Rientro",
    procedure: "VFR",
    section: "10.3.6.1",
    pages: [126],
    kind: "Esempio",
    note: "Dopo il riporto initial, attendi l’autorizzazione al circuito. Segui il lato assegnato e il successivo riporto richiesto.",
    remember:
      "La chiamata wilco conferma che eseguirai il riporto on final richiesto.",
    exchanges: [
      { role: "pilot", text: "BEAR 2-1, initial runway 09" },
      {
        role: "controller",
        text: "BEAR 2-1, cleared for left circuit runway 09, report on final",
      },
      {
        role: "readback",
        text: "Cleared for left circuit runway 09, wilco, BEAR 2-1",
      },
    ],
  },
  {
    id: "established-ils",
    title: "Stabilizzato sull’ILS",
    subtitle: "Primo contatto con la Tower in finale",
    entity: "Tower",
    phase: "Rientro",
    procedure: "IFR",
    section: "10.3.6.2",
    pages: [127],
    kind: "Esempio",
    note: "Comunica approccio, pista e distanza. Nell’esempio la Tower chiede di continuare l’avvicinamento e riportare a quattro miglia.",
    remember: "Continue approach non è un’autorizzazione all’atterraggio.",
    exchanges: [
      {
        role: "pilot",
        text: "Minhad TWR, BEAR 2-1, established ILS runway 09, 8nm on final",
      },
      {
        role: "controller",
        text: "BEAR 2-1, Minhad TWR, continue approach, report 4nm on final",
      },
      { role: "readback", text: "Wilco, BEAR 2-1" },
    ],
  },
  {
    id: "landing",
    title: "Autorizzazione all’atterraggio",
    subtitle: "Riporto in finale e cleared to land",
    entity: "Tower",
    phase: "Rientro",
    procedure: "Tutte",
    section: "10.3.7",
    pages: [127],
    kind: "Esempio",
    note: "Riporta la posizione in finale. La Tower autorizza l’atterraggio se la pista è disponibile.",
    remember: "Ripeti cleared to land e la pista assegnata prima di atterrare.",
    exchanges: [
      { role: "pilot", text: "BEAR 2-1, on final runway 09" },
      {
        role: "controller",
        text: "BEAR 2-1, wind 030 5kts, cleared to land runway 09",
      },
      { role: "readback", text: "Cleared to land runway 09, BEAR 2-1" },
    ],
  },
  {
    id: "go-around",
    title: "Riattaccata",
    subtitle: "Go around",
    entity: "Tower",
    phase: "Rientro",
    procedure: "Tutte",
    section: "10.3.7",
    pages: [127],
    kind: "Esempio",
    note: "Se la Tower ordina una riattaccata, conferma appena possibile ed esegui la procedura prevista o le istruzioni del controllore.",
    remember: "La risposta del pilota conferma l’esecuzione: going around.",
    exchanges: [
      { role: "controller", text: "BEAR 2-1, go around!" },
      { role: "readback", text: "Going around, BEAR 2-1" },
    ],
  },
  {
    id: "vacate",
    title: "Liberare la pista",
    subtitle: "Uscita dalla pista e passaggio a Ground",
    entity: "Tower",
    phase: "Rientro",
    procedure: "Tutte",
    section: "10.3.8",
    pages: [127],
    kind: "Esempio",
    note: "Dopo l’atterraggio segui l’uscita assegnata e passa alla frequenza Ground indicata.",
    remember: "Nel readback ripeti lato, uscita e frequenza.",
    exchanges: [
      {
        role: "controller",
        text: "BEAR 2-1, vacate left on F and contact Minhad GND on 290.6",
      },
      { role: "readback", text: "Vacate left on F, 290.6, BEAR 2-1" },
    ],
  },
  {
    id: "taxi-in",
    title: "Rientro al parcheggio",
    subtitle: "Taxi in verso l’apron assegnato",
    entity: "Ground",
    phase: "Rientro",
    procedure: "Tutte",
    section: "10.3.8",
    pages: [127],
    kind: "Esempio",
    note: "Al contatto con Ground comunica da dove stai liberando la pista. Segui il percorso autorizzato fino al parcheggio.",
    remember:
      "Ripeti destinazione e taxiway. Il manuale non richiede una chiamata per lo shutdown.",
    exchanges: [
      { role: "pilot", text: "Minhad GND, BEAR 2-1, vacating via F" },
      {
        role: "controller",
        text: "BEAR 2-1, Minhad GND, taxi to apron L via H, L2",
      },
      { role: "readback", text: "Taxi to apron L via H, L2, BEAR 2-1" },
    ],
  },
];

export const terms = [
  {
    word: "ROGER",
    meaning: "Ho ricevuto e compreso.",
    note: "Non sostituisce un readback richiesto né una risposta AFFIRM o NEGATIVE.",
  },
  {
    word: "WILCO",
    meaning: "Ho ricevuto ed eseguirò.",
    note: "Conferma la comprensione e l’intenzione di seguire l’istruzione.",
  },
  {
    word: "STANDBY",
    meaning: "Attendi, ti richiamerò.",
    note: "Non richiede readback e non equivale a un sì o a un no.",
  },
  {
    word: "UNABLE",
    meaning: "Non posso eseguire la richiesta.",
    note: "Di norma è seguito dal motivo. Comunica subito se non puoi seguire un’istruzione.",
  },
];

// Lesson values describe this training example, never live mission settings.
const lesson = (
  scenario: Omit<Scenario, "source" | "section" | "kind">,
): Scenario => ({
  ...scenario,
  source: "lesson",
  section: "Lezione 13 ottobre 2026",
  kind: "Esempio",
});

export const departureStages = [
  {
    entity: "Ground",
    title: "Preparazione e rullaggio",
    description: "Radio check → avviamento → taxi → punto attesa",
    handoff: "Al punto attesa, ricevi e ripeti la frequenza Tower.",
  },
  {
    entity: "Tower",
    title: "Pista, decollo e uscita",
    description: "Pronto alla partenza → decollo → November outbound",
    handoff:
      "Il riporto outbound resta alla Tower: attendi il trasferimento a Departure.",
  },
  {
    entity: "Departure",
    title: "Primo contatto e salita",
    description: "Quota attuale → quota autorizzata → procedura assegnata",
    handoff:
      "Dopo il cambio di frequenza, presenta la situazione al nuovo ente.",
  },
] satisfies {
  entity: Entity;
  title: string;
  description: string;
  handoff: string;
}[];

export const departureScenarios: Scenario[] = [
  lesson({
    id: "lesson-radio",
    title: "Controllo radio con Ground",
    subtitle: "Prima dell’avviamento · verifica della leggibilità",
    entity: "Ground",
    phase: "Preparazione",
    procedure: "VFR",
    pages: [1],
    note: "Ascolta prima l’ATIS se disponibile. Negli appunti Ramat David ATIS è 251.150 MHz. GND e FL sono segnaposto: usa il nome della stazione e il tuo callsign.",
    remember:
      "La risposta read you 5 by 5 indica una trasmissione perfettamente leggibile.",
    exchanges: [
      { role: "pilot", text: "GND, FL, radio check" },
      { role: "controller", text: "FL, GND, read you 5 by 5" },
    ],
  }),
  lesson({
    id: "lesson-startup",
    title: "Avviamento e uscita November",
    subtitle: "Ground · autorizzazione, pista, altimeter e squawk",
    entity: "Ground",
    phase: "Preparazione",
    procedure: "VFR",
    pages: [1],
    note: "Richiedi l’avviamento e l’uscita desiderata. Il riepilogo usa pista 27, November e squawk 5001 sequential. Meteo e vento non sono specificati numericamente negli appunti.",
    remember:
      "Gli appunti scrivono QNH 2977 nel readback: qui è normalizzato in altimeter 29.77 (inHg). Non usare 2977 come QNH in hPa. Pista, uscita e squawk vanno ripetuti.",
    exchanges: [
      {
        role: "pilot",
        text: "GND, FL, request startup and November departure",
      },
      {
        role: "controller",
        text: "FL, GND, startup and November departure approved, runway in use 27, altimeter 29.77, [weather and wind], squawk 5001 sequential",
      },
      {
        role: "readback",
        text: "Startup approved, runway 27, altimeter 29.77, cleared departure via November, squawk 5001 sequential, FL",
      },
    ],
  }),
  lesson({
    id: "lesson-taxi",
    title: "Rullaggio al punto attesa Echo",
    subtitle: "Ground · tipo di velivolo, posizione e richiesta taxi",
    entity: "Ground",
    phase: "Preparazione",
    procedure: "VFR",
    pages: [1],
    note: "Comunica 1 F-16 strike e la posizione apron south. Muoviti solo dopo l’autorizzazione al rullaggio.",
    remember:
      "Via Echo è riportato anche nell’autorizzazione Ground su precisazione dell’autore degli appunti. Ripeti punto attesa, taxiway e pista assegnati.",
    exchanges: [
      {
        role: "pilot",
        text: "GND, FL, 1 F-16 strike, apron south, ready for taxi",
      },
      {
        role: "controller",
        text: "FL, GND, cleared to holding point Echo via Echo, runway 27",
      },
      {
        role: "readback",
        text: "Cleared to holding point Echo via Echo, runway 27, FL",
      },
    ],
  }),
  lesson({
    id: "lesson-holding",
    title: "Punto attesa e passaggio alla Tower",
    subtitle: "Ultima chiamata a Ground · holding short Echo",
    entity: "Ground",
    phase: "Partenza",
    procedure: "VFR",
    pages: [1],
    note: "Raggiunto il punto attesa, riporta holding short Echo runway 27. Ground assegna Tower 261.50 MHz: ripeti la frequenza, poi cambia canale.",
    remember:
      "Il Viper check annotato dopo il cambio frequenza è una comunicazione interna alla formazione, non una chiamata ATC alla Tower. Il trasferimento non autorizza l’ingresso in pista.",
    exchanges: [
      { role: "pilot", text: "GND, FL, holding short Echo, runway 27" },
      { role: "controller", text: "FL, GND, push Tower on 261.50" },
      { role: "readback", text: "Push 261.50, FL" },
    ],
  }),
  lesson({
    id: "lesson-takeoff",
    title: "Contatto Tower e decollo",
    subtitle: "Tower · ready for departure dalla posizione di attesa",
    entity: "Tower",
    phase: "Partenza",
    procedure: "VFR",
    pages: [1],
    note: "Alla nuova frequenza comunica posizione e ready for departure. Negli appunti la Tower dà un’autorizzazione combinata all’allineamento e al decollo; il testo inglese è normalizzato mantenendone il significato.",
    remember:
      "Line up and wait da solo non autorizza il decollo. Parti soltanto dopo cleared for takeoff e ripeti la pista. Le autorizzazioni possono arrivare separate: segui quella effettivamente ricevuta.",
    exchanges: [
      {
        role: "pilot",
        text: "TWR, FL, holding short Echo, runway 27, ready for departure",
      },
      {
        role: "controller",
        text: "FL, TWR, line up runway 27, cleared for takeoff runway 27",
      },
      {
        role: "readback",
        text: "Line up runway 27, cleared for takeoff runway 27, FL",
      },
    ],
  }),
  lesson({
    id: "lesson-outbound",
    title: "November outbound e passaggio a Departure",
    subtitle: "Ultima chiamata alla Tower · punto di uscita e quota",
    entity: "Tower",
    phase: "Partenza",
    procedure: "VFR",
    pages: [2],
    note: "Riporta November outbound e 3000 ft ancora alla Tower. Solo dopo l’istruzione push Departure 262.50 ripeti la frequenza e contatta il nuovo ente.",
    remember:
      "Outbound non significa che sei già su Departure. 262.50 MHz è la frequenza dell’esercizio, da confrontare con il briefing della missione. FL resta il segnaposto del callsign.",
    exchanges: [
      { role: "pilot", text: "TWR, FL, November outbound, 3000 feet" },
      { role: "controller", text: "FL, TWR, push Departure 262.50" },
      { role: "readback", text: "Push 262.50, FL" },
    ],
  }),
  {
    ...scenarios.find((s) => s.id === "if-departure")!,
    id: "lesson-departure",
    title: "Primo contatto con Departure",
    subtitle: "Integrazione IFR dal manuale · quota e procedura di salita",
    note: "Il riepilogo della lezione termina al cambio di frequenza e non fornisce una chiamata a Departure. Questo modello IFR viene dal manuale JATF (§ 10.2.5), dove l’ente di partenza è Approach. Usalo soltanto se la missione prevede una SID; non è il seguito VFR documentato dell’uscita November.",
    remember:
      "Usa il nome dell’ente assegnato (Departure o Approach), la quota attuale, quella autorizzata e la SID effettiva. Gli appunti non specificano il primo contatto VFR: non inventare una SID o un’autorizzazione di salita.",
  },
];
