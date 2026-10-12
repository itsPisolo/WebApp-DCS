import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Headphones,
  Info,
  Menu,
  Plane,
  Radio,
  Search,
  ShieldCheck,
  Star,
  Target,
  X,
} from "lucide-react";
import {
  entities,
  phases,
  scenarios,
  terms,
  type Entity,
  type Phase,
  type Role,
  type Scenario,
} from "./data";

type View = "library" | "favorites" | "training" | "guide";
const source = `${import.meta.env.BASE_URL}reference/JATF-OM-R04_Short.pdf`;
const favoriteKey = "dcs-comms-favorites-v1";
const titles: Record<View, string> = {
  library: "Comunicazioni radio",
  favorites: "Le tue comunicazioni",
  training: "Un po’ di pratica. Molta sicurezza.",
  guide: "Prima di premere il PTT.",
};
const roleNames: Record<Role, string> = {
  pilot: "Pilota",
  controller: "Controllore",
  readback: "Pilota · Readback",
};
const roleIcons = {
  pilot: ArrowUpRight,
  controller: ArrowDownLeft,
  readback: Check,
};

function loadFavorites(): string[] {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(favoriteKey) || "[]",
    );
    return Array.isArray(saved)
      ? saved.filter(
          (id): id is string =>
            typeof id === "string" && scenarios.some((s) => s.id === id),
        )
      : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [view, setView] = useState<View>("library");
  const [entity, setEntity] = useState<Entity | "all">("all");
  const [phase, setPhase] = useState<Phase | "all">("all");
  const [procedure, setProcedure] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("radio-check");
  const [favorites, setFavorites] = useState(loadFavorites);
  const [storageError, setStorageError] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mobileDetail, setMobileDetail] = useState(false);
  const listScrollPosition = useRef(0);

  const filtered = useMemo(
    () =>
      scenarios.filter(
        (s) =>
          (entity === "all" || s.entity === entity) &&
          (phase === "all" || s.phase === phase) &&
          (procedure === "all" ||
            s.procedure === procedure ||
            s.procedure === "Tutte") &&
          (view !== "favorites" || favorites.includes(s.id)) &&
          `${s.title} ${s.subtitle} ${s.entity} ${s.phase} ${s.note} ${s.remember} ${s.exchanges.map((e) => e.text).join(" ")}`
            .toLocaleLowerCase("it")
            .includes(search.trim().toLocaleLowerCase("it")),
      ),
    [entity, phase, procedure, view, favorites, search],
  );
  const selected = filtered.find((s) => s.id === selectedId) ?? filtered[0];
  const currentIndex = selected ? filtered.indexOf(selected) : -1;

  useEffect(() => {
    setRevealed(false);
  }, [selected?.id, view]);
  useEffect(() => {
    if (mobileDetail && window.matchMedia("(max-width: 900px)").matches) {
      document.querySelector(".detail-panel")?.scrollIntoView({ block: "start" });
      document.getElementById("detail-title")?.focus({ preventScroll: true });
    }
  }, [mobileDetail, selected?.id]);
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenu(false);
        setMobileDetail(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function navigate(nextView: View, nextEntity: Entity | "all" = "all") {
    setView(nextView);
    setEntity(nextEntity);
    setPhase("all");
    setProcedure("all");
    setSearch("");
    setMobileMenu(false);
    setMobileDetail(false);
    setRevealed(false);
  }
  function toggleFavorite(id: string) {
    const next = favorites.includes(id)
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];
    setFavorites(next);
    try {
      localStorage.setItem(favoriteKey, JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }
  function clearFilters() {
    setEntity("all");
    setPhase("all");
    setProcedure("all");
    setSearch("");
  }
  function selectScenario(s: Scenario) {
    listScrollPosition.current = window.scrollY;
    setSelectedId(s.id);
    setRevealed(false);
    setMobileDetail(true);
  }
  function backToList() {
    setMobileDetail(false);
    requestAnimationFrame(() => {
      window.scrollTo({ top: listScrollPosition.current });
      document.getElementById(`scenario-${selected?.id}`)?.focus({ preventScroll: true });
    });
  }
  const filteredActive =
    entity !== "all" || phase !== "all" || procedure !== "all" || search !== "";

  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${mobileMenu ? "open" : ""}`}
        aria-label="Navigazione principale"
      >
        <button
          className="brand"
          onClick={() => navigate("library")}
          aria-label="DCS Comms, torna alla biblioteca"
        >
          <span className="brand-icon">
            <Plane size={27} strokeWidth={1.7} />
          </span>
          <span>
            <strong>
              DCS <span>COMMS</span>
            </strong>
            <small>RADIO COMPANION</small>
          </span>
        </button>
        <div className="sidebar-section">IL TUO SPAZIO</div>
        <nav className="primary-nav">
          <button
            aria-current={view === "library" ? "page" : undefined}
            className={view === "library" ? "active" : ""}
            onClick={() => navigate("library")}
          >
            <BookOpen size={19} /> Biblioteca{" "}
            <span className="nav-count">{scenarios.length}</span>
          </button>
          <button
            aria-current={view === "favorites" ? "page" : undefined}
            className={view === "favorites" ? "active" : ""}
            onClick={() => navigate("favorites")}
          >
            <Star size={19} /> Preferiti{" "}
            <span className="nav-count">{favorites.length}</span>
          </button>
          <button
            aria-current={view === "training" ? "page" : undefined}
            className={view === "training" ? "active" : ""}
            onClick={() => navigate("training")}
          >
            <Target size={19} /> Allenamento
          </button>
        </nav>
        <div className="sidebar-section entities-heading">
          ENTI DI CONTROLLO
        </div>
        <nav className="entity-nav" aria-label="Filtra per ente">
          {entities.map((item) => (
            <button
              key={item.id}
              className={
                entity === item.id && view !== "guide" ? "selected" : ""
              }
              aria-pressed={entity === item.id && view !== "guide"}
              onClick={() => {
                setEntity(entity === item.id ? "all" : item.id);
                if (view === "guide") setView("library");
                setMobileMenu(false);
                setMobileDetail(false);
              }}
            >
              <span className="entity-dot" />
              {item.id}
              <small>{item.code}</small>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className={`guide-link ${view === "guide" ? "selected" : ""}`}
            onClick={() => navigate("guide")}
          >
            <ShieldCheck size={19} /> Fondamenti radio{" "}
            <ArrowUpRight size={16} />
          </button>
          <a
            className="manual-link"
            href={source}
            target="_blank"
            rel="noreferrer"
          >
            <span className="manual-icon">
              <BookOpen size={19} />
            </span>
            <span>
              <strong>Manuale di riferimento</strong>
              <small>JATF-OM-R04 · Rev. 04</small>
            </span>
            <ArrowUpRight size={15} />
          </a>
          <div className="sidebar-foot">
            <span className="status-dot" /> Per la simulazione DCS{" "}
            <span>v0.1</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu-button icon-button"
            aria-label={mobileMenu ? "Chiudi menu" : "Apri menu"}
            aria-expanded={mobileMenu}
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X size={21} /> : <Menu size={21} />}
          </button>
          <div className="breadcrumb">
            <span>Il tuo kneeboard</span>
            <ChevronRight size={14} />
            <strong>
              {view === "guide"
                ? "Fondamenti radio"
                : view === "training"
                  ? "Allenamento"
                  : view === "favorites"
                    ? "Preferiti"
                    : "Biblioteca"}
            </strong>
          </div>
          <a
            className="source-pill"
            href={source}
            target="_blank"
            rel="noreferrer"
          >
            <span className="status-dot" /> JATF · Rev. 04{" "}
            <ArrowUpRight size={13} />
          </a>
        </header>

        <div className="page-content">
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow">
                <span /> COMUNICA CON CHIAREZZA
              </div>
              <h1>{titles[view]}</h1>
              <p>
                {view === "training"
                  ? "Leggi la situazione, prova la chiamata a voce e scopri lo scambio completo."
                  : view === "favorites"
                    ? "Le schede che vuoi avere sempre a portata di mano."
                    : view === "guide"
                      ? "Le basi di una chiamata chiara, breve e corretta."
                      : "Dall’avviamento all’atterraggio. Trova la chiamata giusta e preparati al prossimo volo."}
              </p>
              <div className="hero-meta">
                <span>
                  <Radio size={15} /> Comms in inglese
                </span>
                <span className="meta-separator">/</span>
                <span>
                  {view === "guide"
                    ? "Principi e readback"
                    : `${scenarios.length} schede · ${entities.length} enti`}
                </span>
              </div>
            </div>
            <div className="radar-art" aria-hidden="true">
              <div className="radar-grid" />
              <div className="radar-ring ring-one" />
              <div className="radar-ring ring-two" />
              <div className="radar-ring ring-three" />
              <div className="radar-cross" />
              <Plane className="radar-plane" size={43} strokeWidth={1.3} />
              <span className="radar-label">CLEAR TO COMMUNICATE</span>
              <span className="radar-point one" />
              <span className="radar-point two" />
            </div>
          </section>

          {storageError && (
            <p className="storage-message" role="status">
              I preferiti sono disponibili per questa sessione, ma il browser
              non consente di salvarli.
            </p>
          )}
          {view === "guide" ? (
            <Guide />
          ) : (
            <>
              <section
                className={`search-controls ${mobileDetail ? "mobile-hidden" : ""}`}
                aria-label="Ricerca e filtri"
              >
                <div className="search-row">
                  <label className="search-field">
                    <Search size={19} />
                    <input
                      type="search"
                      aria-label="Cerca comunicazioni"
                      placeholder="Cerca una chiamata, una parola o una fase di volo…"
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setMobileDetail(false);
                      }}
                    />
                    {search && (
                      <button
                        className="icon-button"
                        aria-label="Cancella ricerca"
                        onClick={() => setSearch("")}
                      >
                        <X size={17} />
                      </button>
                    )}
                  </label>
                  <div
                    className="procedure-toggle"
                    role="group"
                    aria-label="Procedura di volo"
                  >
                    {["all", "VFR", "IFR"].map((item) => (
                      <button
                        key={item}
                        aria-pressed={procedure === item}
                        className={procedure === item ? "active" : ""}
                        onClick={() => {
                          setProcedure(item);
                          setMobileDetail(false);
                        }}
                      >
                        {item === "all" ? "Tutte" : item}
                      </button>
                    ))}
                  </div>
                </div>
                <div
                  className="phase-filters"
                  role="group"
                  aria-label="Fase di volo"
                >
                  <button
                    className={phase === "all" ? "active" : ""}
                    aria-pressed={phase === "all"}
                    onClick={() => setPhase("all")}
                  >
                    Tutte le fasi
                  </button>
                  {phases.map((item, index) => (
                    <button
                      key={item}
                      className={phase === item ? "active" : ""}
                      aria-pressed={phase === item}
                      onClick={() => setPhase(item)}
                    >
                      <span className="phase-number">0{index + 1}</span>
                      {item}
                    </button>
                  ))}
                </div>
              </section>

              <div
                className={`catalog-heading ${mobileDetail ? "mobile-hidden" : ""}`}
              >
                <h2>
                  {view === "favorites"
                    ? "Le tue schede salvate"
                    : entity === "all"
                      ? "Tutte le comunicazioni"
                      : `${entity} · ${entities.find((e) => e.id === entity)?.description}`}{" "}
                  <span aria-live="polite">{filtered.length}</span>
                </h2>
                {filteredActive ? (
                  <button className="text-button" onClick={clearFilters}>
                    Azzera filtri <X size={13} />
                  </button>
                ) : (
                  <span className="catalog-hint">
                    Una fase alla volta, una chiamata alla volta.
                  </span>
                )}
              </div>

              {filtered.length === 0 ? (
                <section className="empty-state">
                  <span>
                    <Search size={29} />
                  </span>
                  <h2>
                    {view === "favorites" && favorites.length === 0
                      ? "Il tuo kneeboard personale inizia qui."
                      : "Nessuna comunicazione trovata."}
                  </h2>
                  <p>
                    {view === "favorites" && favorites.length === 0
                      ? "Salva le schede con la stella: le ritroverai qui, su questo browser."
                      : "Prova un’altra parola o rimuovi i filtri per ampliare la ricerca."}
                  </p>
                  <button
                    className="solid-button"
                    onClick={
                      view === "favorites" && favorites.length === 0
                        ? () => navigate("library")
                        : clearFilters
                    }
                  >
                    {view === "favorites" && favorites.length === 0
                      ? "Esplora la biblioteca"
                      : "Azzera filtri"}
                    <ArrowRight size={16} />
                  </button>
                </section>
              ) : (
                <div
                  className={`catalog-layout ${mobileDetail ? "detail-open" : ""}`}
                >
                  <section
                    className="scenario-list"
                    aria-label="Schede di comunicazione"
                  >
                    {filtered.map((s, index) => (
                      <article
                        className={`scenario-card ${selected?.id === s.id ? "selected" : ""}`}
                        key={s.id}
                      >
                        <button
                          className="scenario-open"
                          id={`scenario-${s.id}`}
                          onClick={() => selectScenario(s)}
                          aria-label={`Apri ${s.title}`}
                          aria-current={
                            selected?.id === s.id ? "true" : undefined
                          }
                        >
                          <div className="card-top">
                            <span
                              className={`entity-tag ${s.entity.toLowerCase()}`}
                            >
                              <span />
                              {s.entity.toUpperCase()}
                            </span>
                            <span className="card-number">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                          </div>
                          <h3>{s.title}</h3>
                          <p>{s.subtitle}</p>
                          <div className="card-bottom">
                            <span>{s.phase}</span>
                            <span className="card-divider">·</span>
                            <span>
                              {s.procedure === "Tutte"
                                ? "VFR / IFR"
                                : s.procedure}
                            </span>
                            <ChevronRight size={16} />
                          </div>
                        </button>
                        <button
                          className={`card-star icon-button ${favorites.includes(s.id) ? "is-favorite" : ""}`}
                          aria-label={`${favorites.includes(s.id) ? "Rimuovi dai" : "Aggiungi ai"} preferiti: ${s.title}`}
                          aria-pressed={favorites.includes(s.id)}
                          onClick={() => toggleFavorite(s.id)}
                        >
                          <Star
                            size={17}
                            fill={
                              favorites.includes(s.id) ? "currentColor" : "none"
                            }
                          />
                        </button>
                      </article>
                    ))}
                  </section>

                  {selected && (
                    <section
                      className="detail-panel"
                      aria-label={`Dettaglio: ${selected.title}`}
                    >
                      <button
                        className="back-to-list text-button"
                        onClick={backToList}
                      >
                        <ChevronLeft size={16} /> Torna alle schede
                      </button>
                      <div className="detail-heading">
                        <span
                          className={`entity-tag ${selected.entity.toLowerCase()}`}
                        >
                          <span />
                          {selected.entity.toUpperCase()}
                        </span>
                        <button
                          className={`save-button ${favorites.includes(selected.id) ? "is-favorite" : ""}`}
                          aria-pressed={favorites.includes(selected.id)}
                          onClick={() => toggleFavorite(selected.id)}
                        >
                          <Star
                            size={16}
                            fill={
                              favorites.includes(selected.id)
                                ? "currentColor"
                                : "none"
                            }
                          />
                          {favorites.includes(selected.id)
                            ? "Salvata"
                            : "Salva scheda"}
                        </button>
                      </div>
                      <h2 id="detail-title" tabIndex={-1}>{selected.title}</h2>
                      <div className="detail-tags">
                        <span>{selected.phase}</span>
                        <span>
                          {selected.procedure === "Tutte"
                            ? "VFR / IFR"
                            : selected.procedure}
                        </span>
                        <span>{selected.kind} del manuale</span>
                      </div>
                      <p className="scenario-note">{selected.note}</p>
                      {view === "training" && (
                        <div className="training-prompt">
                          <Target size={19} />
                          <div>
                            <strong>Prova prima di leggere.</strong>
                            <p>
                              {selected.exchanges[0].role === "controller"
                                ? "Immagina di ricevere l’istruzione e formula il tuo readback."
                                : "Formula la tua chiamata, poi confrontala con il manuale."}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="exchange-heading">
                        <h3>
                          <Headphones size={16} />
                          {view === "training" && !revealed
                            ? "La tua situazione"
                            : "Lo scambio radio"}
                        </h3>
                        <span>ENGLISH COMMS</span>
                      </div>
                      {view === "training" && !revealed ? (
                        <div className="training-hidden">
                          <Radio size={27} />
                          <p>{selected.subtitle}</p>
                          <span>{selected.remember}</span>
                          <button
                            className="solid-button"
                            onClick={() => setRevealed(true)}
                          >
                            <Eye size={17} />
                            Mostra le comunicazioni
                          </button>
                        </div>
                      ) : (
                        <div className="exchanges" key={selected.id}>
                          {selected.exchanges.map((exchange, index) => {
                            const Icon = roleIcons[exchange.role];
                            return (
                              <div
                                className={`exchange ${exchange.role}`}
                                key={`${selected.id}-${index}`}
                              >
                                <div className="exchange-label">
                                  <Icon size={15} />
                                  <strong>{roleNames[exchange.role]}</strong>
                                  <span>
                                    {String(index + 1).padStart(2, "0")}
                                  </span>
                                </div>
                                <p lang="en">{exchange.text}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {(view !== "training" || revealed) && (
                        <div className="remember">
                          <span className="remember-icon">
                            <Info size={18} />
                          </span>
                          <div>
                            <strong>Da ricordare</strong>
                            <p>{selected.remember}</p>
                          </div>
                        </div>
                      )}
                      <a
                        className="detail-source"
                        href={`${source}#page=${selected.pages[0] - 113}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <BookOpen size={16} />
                        <span>
                          JATF-OM-R04 · § {selected.section}
                          <small>
                            Pagina{selected.pages.length > 1 ? "e" : ""}{" "}
                            {selected.pages.join("–")} del manuale
                          </small>
                        </span>
                        <ArrowUpRight size={16} />
                      </a>
                      {view === "training" && (
                        <div className="training-navigation">
                          <button
                            className="outline-button"
                            disabled={currentIndex === 0}
                            onClick={() =>
                              setSelectedId(filtered[currentIndex - 1].id)
                            }
                          >
                            <ChevronLeft size={16} />
                            Precedente
                          </button>
                          <span>
                            {currentIndex + 1} / {filtered.length}
                          </span>
                          <button
                            className="outline-button"
                            disabled={currentIndex === filtered.length - 1}
                            onClick={() =>
                              setSelectedId(filtered[currentIndex + 1].id)
                            }
                          >
                            Successiva
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      )}
                    </section>
                  )}
                </div>
              )}
              <footer className="page-footer">
                <span>
                  <BookOpen size={14} /> Fraseologia tratta da JATF-OM-R04,
                  sezione 10.
                </span>
                <span>Frequenze e valori sono esempi del manuale.</span>
              </footer>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function Guide() {
  return (
    <div className="guide-content">
      <section className="guide-order">
        <div className="guide-section-label">01 / STRUTTURA DELLA CHIAMATA</div>
        <h2>Destinatario. Callsign. Messaggio.</h2>
        <p>
          Al primo contatto, segui questo ordine. Nelle chiamate successive puoi
          omettere il destinatario; nelle risposte il tuo callsign può andare
          alla fine.
        </p>
        <div className="call-anatomy" lang="en">
          <div>
            <small>DESTINATARIO</small>
            <strong>Al Minhad,</strong>
          </div>
          <ArrowRight size={18} />
          <div>
            <small>CALLSIGN</small>
            <strong>BEAR 2-1,</strong>
          </div>
          <ArrowRight size={18} />
          <div>
            <small>MESSAGGIO</small>
            <strong>radio check</strong>
          </div>
        </div>
        <a href={`${source}#page=1`} target="_blank" rel="noreferrer">
          Fonte: § 10.1.2, pagine 114–115 <ArrowUpRight size={13} />
        </a>
      </section>
      <section className="guide-terms">
        <div className="guide-section-label">02 / PAROLE DA CONOSCERE</div>
        <h2>Una parola, un significato preciso.</h2>
        <div className="term-grid">
          {terms.map((term) => (
            <article key={term.word}>
              <h3 lang="en">{term.word}</h3>
              <strong>{term.meaning}</strong>
              <p>{term.note}</p>
            </article>
          ))}
        </div>
        <a href={`${source}#page=1`} target="_blank" rel="noreferrer">
          Fonte: § 10.1.1, pagina 114 <ArrowUpRight size={13} />
        </a>
      </section>
      <section className="guide-readback">
        <div className="guide-section-label">03 / READBACK</div>
        <h2>Roger non basta sempre.</h2>
        <p>
          Ripeti le parti essenziali delle istruzioni per confermare che siano
          state comprese correttamente.
        </p>
        <ul>
          <li>
            Autorizzazioni di ingresso, atterraggio, decollo e attraversamento
            di piste attive.
          </li>
          <li>Istruzioni di parcheggio, rullaggio e avviamento.</li>
          <li>Autorizzazioni di rotta, punti di navigazione e procedure.</li>
          <li>
            Pista, altimeter/QNH, quote, prue, velocità e livelli di
            transizione.
          </li>
          <li>Frequenze radio assegnate.</li>
        </ul>
        <a href={`${source}#page=2`} target="_blank" rel="noreferrer">
          Fonte: § 10.1.3, pagina 115 <ArrowUpRight size={13} />
        </a>
      </section>
      <section className="guide-radio">
        <div className="guide-section-label">04 / RADIO CHECK</div>
        <h2>La scala di leggibilità.</h2>
        <div className="readability">
          {[
            "Illeggibile",
            "Leggibile a tratti",
            "Leggibile con difficoltà",
            "Leggibile",
            "Perfettamente leggibile",
          ].map((label, index) => (
            <div key={label}>
              <span>{index + 1}</span>
              <p>{label}</p>
            </div>
          ))}
        </div>
        <a href={`${source}#page=2`} target="_blank" rel="noreferrer">
          Fonte: § 10.1.4, pagina 115 <ArrowUpRight size={13} />
        </a>
      </section>
      <section className="guide-source">
        <BookOpen size={25} />
        <div>
          <h2>Il manuale resta il riferimento.</h2>
          <p>
            Questa prima raccolta copre le operazioni aeroportuali e alcuni
            contatti in rotta. Le operazioni su portaerei (§ 10.4) saranno una
            raccolta dedicata. Le categorie Departure e Approach organizzano le
            fasi; l’ente effettivo è quello indicato nella chiamata.
          </p>
          <p>
            Note in italiano redatte per lo studio. Gli esempi mantengono i
            valori del manuale; i modelli contengono campi da compilare. Nel
            rullaggio è usato l’esempio coerente delle pagine 118–119, anziché
            il riepilogo di pagina 125 con taxiway discordanti. Il refuso «QHN»
            di pagina 119 è normalizzato in «QNH» e i segnaposto della partenza
            IFR sono tradotti in inglese.
          </p>
          <p>
            I preferiti restano nel browser di questo dispositivo. La modalità
            allenamento è un ripasso con soluzione, senza valutazione
            automatica.
          </p>
          <a
            className="outline-button"
            href={source}
            target="_blank"
            rel="noreferrer"
          >
            Apri il PDF originale
            <ArrowUpRight size={16} />
          </a>
        </div>
      </section>
    </div>
  );
}
