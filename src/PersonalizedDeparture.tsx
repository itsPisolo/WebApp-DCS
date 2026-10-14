import { useState, type FormEvent } from "react";
import { ArrowRight, BookOpen, ChevronRight, Plane, Radio } from "lucide-react";
import {
  personalizedScenarios,
  personalizeCommunication,
  type FlightNames,
} from "./personalization";

const roleNames = {
  pilot: "Pilota",
  controller: "Controllore",
  readback: "Pilota · Readback",
};

export default function PersonalizedDeparture() {
  const [names, setNames] = useState<FlightNames | null>(null);
  const [draft, setDraft] = useState<FlightNames>({ airport: "", flight: "" });
  const [editing, setEditing] = useState(true);

  function configure(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = { airport: draft.airport.trim(), flight: draft.flight.trim() };
    if (!next.airport || !next.flight) return;
    setDraft(next);
    setNames(next);
    setEditing(false);
  }

  if (editing || !names) {
    return (
      <section className="flight-setup" aria-labelledby="flight-setup-title">
        <div className="flight-setup-icon">
          <Plane size={25} />
        </div>
        <h2 id="flight-setup-title">Come ti presenterai alla radio?</h2>
        <p>
          Inserisci aeroporto e callsign: li useremo nelle sei chiamate dal
          radio check al trasferimento dalla Tower a Departure.
        </p>
        <form onSubmit={configure}>
          <label htmlFor="airport-name">Nome Aeroporto</label>
          <input
            id="airport-name"
            name="airport"
            autoComplete="off"
            placeholder="Ramat David"
            required
            pattern=".*\S.*"
            title="Inserisci un nome, non solo spazi."
            maxLength={80}
            value={draft.airport}
            onChange={(event) =>
              setDraft({ ...draft, airport: event.target.value })
            }
          />
          <small>
            Diventerà {draft.airport.trim() || "Ramat David"} Ground, Tower e
            Departure.
          </small>
          <label htmlFor="flight-name">Nome Volo</label>
          <input
            id="flight-name"
            name="flight"
            autoComplete="off"
            placeholder="Viper 1-1"
            required
            pattern=".*\S.*"
            title="Inserisci un callsign, non solo spazi."
            maxLength={60}
            value={draft.flight}
            onChange={(event) =>
              setDraft({ ...draft, flight: event.target.value })
            }
          />
          <small>
            Il callsign completo che sostituirà FL nelle chiamate e nei
            readback.
          </small>
          <div className="flight-setup-actions">
            <button className="solid-button" type="submit">
              {names ? "Aggiorna comunicazioni" : "Apri le comunicazioni"}{" "}
              <ArrowRight size={16} />
            </button>
            {names && (
              <button
                className="outline-button"
                type="button"
                onClick={() => {
                  setDraft(names);
                  setEditing(false);
                }}
              >
                Annulla
              </button>
            )}
          </div>
        </form>
      </section>
    );
  }

  return (
    <section
      className="personalized-flight"
      aria-label="Comunicazioni personalizzate"
    >
      <div className="flight-summary">
        <div>
          <span className="eyebrow">
            <Radio size={14} /> IL TUO VOLO
          </span>
          <h2>{names.flight}</h2>
          <p>
            {names.airport} Ground → {names.airport} Tower → {names.airport}{" "}
            Departure
          </p>
        </div>
        <button className="outline-button" onClick={() => setEditing(true)}>
          Modifica nomi
        </button>
      </div>
      <p className="departure-note">
        Segui le chiamate in ordine. Pista 27, frequenze, quota, squawk e meteo
        restano quelli dell’esercizio: verifica i dati nel briefing. Il percorso
        termina con il readback della frequenza Departure.
      </p>
      <div className="personalized-sequence">
        {personalizedScenarios.map((scenario, index) => (
          <details
            className="personalized-step"
            key={scenario.id}
            open={index === 0}
          >
            <summary>
              <span className="stage-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <span className={`entity-tag ${scenario.entity.toLowerCase()}`}>
                  {names.airport} {scenario.entity}
                </span>
                <h3>{scenario.title}</h3>
                <p>{scenario.subtitle}</p>
              </div>
              <ChevronRight size={18} />
            </summary>
            <div className="personalized-step-content">
              {scenario.id === "lesson-holding" && (
                <p className="personalized-context">
                  Il Viper check degli appunti è interno alla formazione,
                  separato dalle chiamate ATC. Il cambio frequenza non autorizza
                  l’ingresso in pista.
                </p>
              )}
              {scenario.id === "lesson-takeoff" && (
                <p className="personalized-context">
                  Line up and wait da solo non autorizza il decollo: attendi
                  cleared for takeoff.
                </p>
              )}
              <div className="exchanges">
                {scenario.exchanges.map((exchange, exchangeIndex) => (
                  <div
                    className={`exchange ${exchange.role}`}
                    key={exchangeIndex}
                  >
                    <div className="exchange-label">
                      <strong>{roleNames[exchange.role]}</strong>
                      <span>{String(exchangeIndex + 1).padStart(2, "0")}</span>
                    </div>
                    <p lang="en">
                      {personalizeCommunication(exchange.text, names)}
                    </p>
                  </div>
                ))}
              </div>
              <a
                className="detail-source"
                href={`${import.meta.env.BASE_URL}reference/Lezione-13-ott-2026.pdf#page=${scenario.pages[0]}`}
                target="_blank"
                rel="noreferrer"
              >
                <BookOpen size={16} /> Lezione · 13 ottobre 2026 · pagina{" "}
                {scenario.pages[0]}
              </a>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
