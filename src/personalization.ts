import { departureScenarios } from "./data";

export type FlightNames = { airport: string; flight: string };

// Only lesson calls: stop at the Tower's handoff, excluding the IFR supplement.
export const personalizedScenarios = departureScenarios.filter(
  (scenario) => scenario.source === "lesson",
);

export function personalizeCommunication(
  text: string,
  names: FlightNames,
): string {
  const replacements: Record<string, string> = {
    GND: `${names.airport} Ground`,
    TWR: `${names.airport} Tower`,
    Tower: `${names.airport} Tower`,
    Departure: `${names.airport} Departure`,
    FL: names.flight,
  };
  // One pass, whole tokens only: do not alter 'departure', FL200 or user input.
  return text.replace(
    /\b(GND|TWR|Tower|Departure|FL)\b/g,
    (token) => replacements[token],
  );
}
