# DCS Comms

Web app responsive per studiare le comunicazioni radio in DCS. Interfaccia in italiano, comunicazioni in inglese. Prima versione senza backend: 23 schede, ricerca nel testo delle chiamate, filtri combinati per ente/fase/procedura, preferiti persistenti nel browser, ripasso con soluzione e guida ai fondamenti radio.

## Sviluppo

Node.js 24.19.0 (`.nvmrc`), npm. Il checkout esistente è `/workspace/WebApp-DCS`; ogni task cloud è già isolato, quindi non occorre creare worktree.

```sh
cd /workspace/WebApp-DCS
npm --cache /workspace/.npm-cache ci
npm run dev -- --port 5173 --strictPort
```

Il server ascolta sulla porta 5173. Per verificarlo internamente: `curl --fail http://127.0.0.1:5173/`. La pagina deve mostrare il titolo “Comunicazioni radio” e 23 schede. I processi devono essere riavviati nei nuovi task.

## Build e verifiche

```sh
npm run build
npm test
```

Playwright avvia la preview della build sulla porta 4173 ed esegue test funzionali su desktop (1440 px), tablet (820 px) e mobile (390 px). Richiede Chromium: nell’ambiente cloud è presente `/usr/bin/chromium`. Su altre macchine impostare `CHROMIUM_PATH` al binario locale. Il report distingue ricerca e filtri, persistenza dei preferiti, allenamento, layout e disponibilità del PDF. Le schermate dei test cloud sono salvate in `/workspace/artifacts`.

## Pubblicazione su GitHub Pages

Il workflow `.github/workflows/pages.yml` pubblica solo su richiesta manuale. Nel repository GitHub, aprire **Settings → Pages** e scegliere **GitHub Actions** come Source. Poi aprire **Actions → Publish DCS Comms to GitHub Pages → Run workflow**, selezionare `main` e confermare. A esecuzione completata, il job `deploy` mostra il link del sito. Le modifiche successive si pubblicano rilanciando lo stesso workflow.

Il workflow installa con `npm ci` e compila usando il percorso del repository. Il PDF, l’icona e gli asset funzionano anche sotto `/WebApp-DCS/`. In locale la base resta `/`. Per riprodurre la build e i test del sito:

```sh
VITE_BASE_PATH=/WebApp-DCS/ npm run build
VITE_BASE_PATH=/WebApp-DCS/ npm test
```

La disponibilità di Pages per un repository privato dipende dal piano GitHub. Il sito può essere pubblico anche se il repository è privato; la pubblicazione comprende il PDF di riferimento. Questa configurazione prepara il deploy ma il sito diventa disponibile solo dopo l’attivazione e l’esecuzione su GitHub.

## Fonte e scelte editoriali

Fonte fornita dall’utente: **JATF-OM-R04_Short.pdf**, sezione 10, revisione 04, pagine originali 114–131. Il file è conservato in `public/reference`; copyright Joint Air Task Force come riportato nel PDF. Ogni scheda in `src/data.ts` indica sezione e pagine originali, più il tipo (esempio o modello). Le note in italiano sono sintesi editoriali; le chiamate vengono dagli esempi o modelli del documento. Frequenze, piste, quote, callsign e codici sono dati degli esempi, non configurazione della missione.

- Il rullaggio usa le pagine 118–119: il riepilogo di pagina 125 contiene taxiway discordanti fra autorizzazione e readback.
- Il refuso `QHN` nell’esempio di pagina 119 è normalizzato in `QNH`.
- I segnaposto italiani del modello IFR a pagina 120 sono tradotti in inglese. Non è aggiunta una risposta del controllore assente nel manuale.
- Spaziatura e a capo delle chiamate sono normalizzati. La punteggiatura di “continue approach, report” è separata correttamente.
- Departure organizza le chiamate della fase di uscita/salita; nell’originale l’ente può essere Tower o Approach. L’interlocutore effettivo resta nella chiamata.
- Le operazioni su portaerei (§ 10.4) non sono ancora catalogate. Il PDF integrale rimane consultabile.

## Limiti della prima versione

I preferiti sono locali al browser, senza account o sincronizzazione tra dispositivi. L’allenamento è un ripasso con rivelazione della soluzione, senza riconoscimento vocale o valutazione. Non c’è ancora una PWA/offline: i font sono serviti localmente, ma l’app richiede accesso al server. Gli enti e le schede si possono estendere in `src/data.ts`; l’editor di configurazione verrà progettato insieme. Non servono credenziali né servizi esterni per avviare questa versione.
