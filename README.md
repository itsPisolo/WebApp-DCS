# DCS Comms

Web app responsive per studiare le comunicazioni radio in DCS. Interfaccia in italiano, comunicazioni in inglese. Tema scuro, senza backend: percorso di partenza dedicato e 23 schede nella biblioteca completa, ricerca nel testo delle chiamate, filtri combinati per ente/fase/procedura, preferiti persistenti nel browser, ripasso con soluzione e guida ai fondamenti radio.

## Sviluppo

Node.js 24.19.0 (`.nvmrc`), npm. Il checkout esistente è `/workspace/WebApp-DCS`; ogni task cloud è già isolato, quindi non occorre creare worktree.

```sh
cd /workspace/WebApp-DCS
npm --cache /workspace/.npm-cache ci
npm run dev -- --port 5173 --strictPort
```

Il server ascolta sulla porta 5173. Per verificarlo internamente: `curl --fail http://127.0.0.1:5173/`. La pagina iniziale deve mostrare il titolo “Da Ground a Departure” e 7 schede nel percorso di partenza. La voce Biblioteca conserva le 23 schede del manuale. I processi devono essere riavviati nei nuovi task.

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

## Percorso di partenza

La pagina iniziale **Partenza** distingue l’ente con cui stai parlando, in ordine:

1. **Ground**: radio check, avviamento, rullaggio, holding short e passaggio alla Tower.
2. **Tower**: primo contatto al punto attesa, allineamento/decollo, November outbound e passaggio a Departure.
3. **Departure**: modello IFR di primo contatto e salita, integrato dal manuale JATF.

Le sei schede della lezione vengono da **Lezione - 13 ott 2026 (1).pdf**, conservato in `public/reference/Lezione-13-ott-2026.pdf`. I link delle schede portano alla pagina pertinente. Il documento termina al trasferimento a Departure e non contiene il successivo contatto VFR: il modello IFR è esplicitamente distinto e non va usato come seguito automatico della partenza November. I filtri VFR/IFR mantengono questa distinzione. I preferiti comprendono sia biblioteca sia lezione.

Negli appunti GND, TWR e FL sono segnaposto. Pista 27, frequenze, 3000 ft e squawk appartengono all’esercizio. `2977` è normalizzato in **altimeter 29.77 inHg**, anziché QNH 2977. Meteo e vento non specificati restano campi da compilare. La taxiway **via Echo** è stata aggiunta all’istruzione Ground su precisazione dell’autore, in coerenza con il readback. La frase combinata di allineamento/decollo è normalizzata; l’app ricorda che `line up and wait` da solo non autorizza il decollo. Il Viper check è interno alla formazione.

## Volo personalizzato

La voce **Volo personalizzato** apre una sezione dedicata: inserisci **Nome Aeroporto** (es. Ramat David) e **Nome Volo** (es. Viper 1-1), poi apri le comunicazioni. Le sei chiamate della lezione coprono radio check, avviamento, taxi, punto attesa/cambio Tower, decollo e November outbound/cambio Departure. Il percorso termina al readback della frequenza Departure, senza includere il modello di primo contatto IFR.

I nomi sostituiscono i segnaposto nelle chiamate e nei readback: GND → Ramat David Ground, TWR/Tower → Ramat David Tower, Departure → Ramat David Departure, FL → Viper 1-1. I termini generici come “ready for departure” e gli altri dati dell’esercizio restano invariati. **Modifica nomi** aggiorna l’intera sequenza; **Annulla** conserva i nomi precedenti. La configurazione vale durante l’apertura della sezione: riaprendola vengono nuovamente richiesti i nomi.

## Fonte e scelte editoriali

Fonte fornita dall’utente: **JATF-OM-R04_Short.pdf**, sezione 10, revisione 04, pagine originali 114–131. Il file è conservato in `public/reference`; copyright Joint Air Task Force come riportato nel PDF. Ogni scheda in `src/data.ts` indica sezione e pagine originali, più il tipo (esempio o modello). Le note in italiano sono sintesi editoriali; le chiamate vengono dagli esempi o modelli del documento. Frequenze, piste, quote, callsign e codici sono dati degli esempi, non configurazione della missione.

- Il rullaggio usa le pagine 118–119: il riepilogo di pagina 125 contiene taxiway discordanti fra autorizzazione e readback.
- Il refuso `QHN` nell’esempio di pagina 119 è normalizzato in `QNH`.
- I segnaposto italiani del modello IFR a pagina 120 sono tradotti in inglese. Non è aggiunta una risposta del controllore assente nel manuale.
- Spaziatura e a capo delle chiamate sono normalizzati. La punteggiatura di “continue approach, report” è separata correttamente.
- Il riporto VFR outbound è classificato sotto Tower, che assegna il trasferimento. Departure organizza il primo contatto e la salita; nel manuale l’ente può essere Approach, come indicato nella scheda.
- Le operazioni su portaerei (§ 10.4) non sono ancora catalogate. Il PDF integrale rimane consultabile.

## Limiti della prima versione

I preferiti sono locali al browser, senza account o sincronizzazione tra dispositivi. L’allenamento è un ripasso con rivelazione della soluzione, senza riconoscimento vocale o valutazione. Non c’è ancora una PWA/offline: i font sono serviti localmente, ma l’app richiede accesso al server. Gli enti e le schede si possono estendere in `src/data.ts`; l’editor di configurazione verrà progettato insieme. Non servono credenziali né servizi esterni per avviare questa versione.
