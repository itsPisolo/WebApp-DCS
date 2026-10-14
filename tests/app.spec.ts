import { expect, test, type Page } from "@playwright/test";

async function navigate(page: Page, label: string) {
  const menu = page.getByRole("button", { name: "Apri menu", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole("button", { name: new RegExp(`^${label}(?: \\d+)?$`) })
    .click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("./");
  await navigate(page, "Biblioteca");
});

test("ricerca nel testo delle comms e collegamento alla fonte corretta", async ({
  page,
}) => {
  await expect(page.locator(".scenario-card")).toHaveCount(23);
  await page
    .getByRole("searchbox", { name: "Cerca comunicazioni" })
    .fill("winchester");
  await expect(page.locator(".scenario-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Apri Check-out e RTB", exact: true })
    .click();
  await expect(
    page.getByText("Overlord, BEAR 2-1, Winchester, RTB", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".detail-source")).toHaveAttribute(
    "href",
    `${process.env.VITE_BASE_PATH || "/"}reference/JATF-OM-R04_Short.pdf#page=13`,
  );
});

test("filtri ente e fase combinati, nessun risultato e azzeramento", async ({
  page,
}) => {
  const menu = page.getByRole("button", { name: "Apri menu", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("button", { name: "Ground GND", exact: true }).click();
  await page
    .getByRole("group", { name: "Fase di volo" })
    .getByRole("button", { name: /Rientro/ })
    .click();
  await expect(page.locator(".scenario-card")).toHaveCount(1);
  await expect(
    page.getByRole("button", {
      name: "Apri Rientro al parcheggio",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("searchbox").fill("non-esiste-123");
  await expect(
    page.getByRole("heading", { name: "Nessuna comunicazione trovata." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Azzera filtri", exact: true })
    .last()
    .click();
  await expect(page.locator(".scenario-card")).toHaveCount(23);
});

test("preferiti persistenti dopo ricaricamento e rimozione", async ({
  page,
}) => {
  await page
    .getByRole("button", {
      name: "Aggiungi ai preferiti: Radio check",
      exact: true,
    })
    .click();
  await page.reload();
  await navigate(page, "Preferiti");
  await expect(page.locator(".scenario-card")).toHaveCount(1);
  await page
    .getByRole("button", {
      name: "Rimuovi dai preferiti: Radio check",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Il tuo kneeboard personale inizia qui.",
    }),
  ).toBeVisible();
  await page.reload();
  await navigate(page, "Preferiti");
  await expect(page.locator(".scenario-card")).toHaveCount(0);
});

test("filtro IFR: chiamate comuni incluse e scenari VFR esclusi", async ({
  page,
}) => {
  await page
    .getByRole("group", { name: "Procedura di volo" })
    .getByRole("button", { name: "IFR", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Apri Avviamento con ATIS", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Apri Partenza IFR", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Apri Uscita VFR", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: "Apri Ingresso nel circuito",
      exact: true,
    }),
  ).toHaveCount(0);
});

test("aprire una scheda in fondo alla lista e tornarci su schermi piccoli", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Apri Rientro al parcheggio", exact: true })
    .click();
  await expect(page.locator(".detail-panel > h2")).toHaveText(
    "Rientro al parcheggio",
  );
  await expect(
    page.getByText("Taxi to apron L via H, L2, BEAR 2-1", { exact: true }),
  ).toBeVisible();
  if (page.viewportSize()!.width <= 900) {
    await expect(page.locator("#detail-title")).toBeInViewport();
    await page
      .getByRole("button", { name: "Torna alle schede", exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Apri Rientro al parcheggio",
        exact: true,
      }),
    ).toBeFocused();
    await expect(
      page.getByRole("button", {
        name: "Apri Rientro al parcheggio",
        exact: true,
      }),
    ).toBeInViewport();
  }
});

test("allenamento: soluzione nascosta, rivelazione e reset sulla scheda successiva", async ({
  page,
}) => {
  await navigate(page, "Allenamento");
  await page
    .getByRole("button", { name: "Apri Radio check", exact: true })
    .click();
  await expect(page.locator(".exchange")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Mostra le comunicazioni", exact: true })
    .click();
  await expect(page.locator(".exchange")).toHaveCount(2);
  await expect(
    page.getByText("BEAR 2-1, Al Minhad, read you 5 by 5", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Successiva", exact: true }).click();
  await expect(page.locator(".detail-panel > h2")).toHaveText(
    "Richiesta di avviamento",
  );
  await expect(page.locator(".exchange")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Mostra le comunicazioni", exact: true })
    .click();
  await expect(page.locator(".exchange")).toHaveCount(3);
});

test("layout adattivo, guida e PDF disponibili senza errori applicativi", async ({
  page,
  request,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await expect(
    page.getByRole("heading", { name: "Comunicazioni radio", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `/workspace/artifacts/dcs-${testInfo.project.name}.png`,
    fullPage: false,
  });
  await page
    .getByRole("button", { name: "Apri Richiesta di avviamento", exact: true })
    .click();
  await expect(page.locator(".exchange")).toHaveCount(3);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const back = page.getByRole("button", {
    name: "Torna alle schede",
    exact: true,
  });
  if (await back.isVisible()) {
    await back.click();
    await expect(page.getByRole("searchbox")).toBeVisible();
  }
  await navigate(page, "Fondamenti radio");
  await expect(
    page.getByRole("heading", { name: "Roger non basta sempre." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const pdf = await request.get("reference/JATF-OM-R04_Short.pdf");
  expect(pdf.ok()).toBe(true);
  expect((await pdf.body()).subarray(0, 4).toString()).toBe("%PDF");
  expect(errors).toEqual([]);
});

test("partenza: sequenza Ground, Tower e Departure con fonti distinte", async ({
  page,
  request,
}, testInfo) => {
  await page.goto("./");
  await expect(
    page.getByRole("heading", { name: "Da Ground a Departure", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".scenario-card")).toHaveCount(7);
  await page.screenshot({
    path: `/workspace/artifacts/partenza-${testInfo.project.name}.png`,
  });
  const lesson = await request.get("reference/Lezione-13-ott-2026.pdf");
  expect(lesson.ok()).toBe(true);
  expect((await lesson.body()).subarray(0, 4).toString()).toBe("%PDF");
  await page
    .getByRole("button", {
      name: "Apri Rullaggio al punto attesa Echo",
      exact: true,
    })
    .click();
  await expect(page.locator(".exchange.controller p")).toHaveText(
    "FL, GND, cleared to holding point Echo via Echo, runway 27",
  );
  await expect(page.locator(".exchange.readback p")).toHaveText(
    "Cleared to holding point Echo via Echo, runway 27, FL",
  );
  await page.getByRole("button", { name: "Successiva", exact: true }).click();
  await expect(page.locator("#detail-title")).toHaveText(
    "Punto attesa e passaggio alla Tower",
  );
  await expect(page.locator(".detail-heading .entity-tag")).toHaveText(
    "GROUND",
  );
  await expect(page.locator(".exchange.readback p")).toHaveText(
    "Push 261.50, FL",
  );
  await page.getByRole("button", { name: "Successiva", exact: true }).click();
  await expect(page.locator(".detail-heading .entity-tag")).toHaveText("TOWER");
  await page.getByRole("button", { name: "Successiva", exact: true }).click();
  await expect(page.locator("#detail-title")).toHaveText(
    "November outbound e passaggio a Departure",
  );
  await expect(page.locator(".detail-heading .entity-tag")).toHaveText("TOWER");
  await expect(page.locator(".detail-source")).toHaveAttribute(
    "href",
    `${process.env.VITE_BASE_PATH || "/"}reference/Lezione-13-ott-2026.pdf#page=2`,
  );
  await expect(page.locator(".exchange.readback p")).toHaveText(
    "Push 262.50, FL",
  );
  await page.getByRole("button", { name: "Successiva", exact: true }).click();
  await expect(page.locator(".detail-heading .entity-tag")).toHaveText(
    "DEPARTURE",
  );
  await expect(page.locator(".scenario-note")).toContainText(
    "non è il seguito VFR documentato",
  );
  await expect(page.locator(".detail-source")).toHaveAttribute(
    "href",
    `${process.env.VITE_BASE_PATH || "/"}reference/JATF-OM-R04_Short.pdf#page=7`,
  );
  await expect(
    page.getByRole("button", { name: "Successiva", exact: true }),
  ).toBeDisabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("partenza: filtri per ente e VFR, preferiti della lezione persistenti", async ({
  page,
}) => {
  await page.goto("./");
  const stages = page.getByRole("group", {
    name: "Ente nel percorso di partenza",
  });
  await stages.getByRole("button", { name: /Ground/ }).click();
  await expect(page.locator(".scenario-card")).toHaveCount(4);
  await stages.getByRole("button", { name: /^02Tower/ }).click();
  await expect(page.locator(".scenario-card")).toHaveCount(2);
  await expect(
    page.getByRole("button", {
      name: "Apri November outbound e passaggio a Departure",
      exact: true,
    }),
  ).toBeVisible();
  await stages.getByRole("button", { name: /^02Tower/ }).click();
  await page
    .getByRole("group", { name: "Procedura di volo" })
    .getByRole("button", { name: "VFR", exact: true })
    .click();
  await expect(page.locator(".scenario-card")).toHaveCount(6);
  await expect(
    page.getByRole("button", {
      name: "Apri Primo contatto con Departure",
      exact: true,
    }),
  ).toHaveCount(0);
  await page
    .getByRole("button", {
      name: "Aggiungi ai preferiti: Rullaggio al punto attesa Echo",
      exact: true,
    })
    .click();
  await page.reload();
  await navigate(page, "Preferiti");
  await expect(page.locator(".scenario-card")).toHaveCount(1);
  await page
    .getByRole("button", {
      name: "Apri Rullaggio al punto attesa Echo",
      exact: true,
    })
    .click();
  await expect(page.locator(".detail-source")).toHaveAttribute(
    "href",
    `${process.env.VITE_BASE_PATH || "/"}reference/Lezione-13-ott-2026.pdf#page=1`,
  );
});

test("volo personalizzato: sei chiamate con aeroporto e callsign, fino al readback Departure", async ({
  page,
}, testInfo) => {
  await navigate(page, "Volo personalizzato");
  await page
    .getByLabel("Nome Aeroporto", { exact: true })
    .fill(" Ramat David ");
  await page.getByLabel("Nome Volo", { exact: true }).fill(" Viper 1-1 ");
  await page.getByRole("button", { name: "Apri le comunicazioni" }).click();
  const steps = page.locator(".personalized-step");
  await expect(steps).toHaveCount(6);
  await expect(steps.first().locator(".exchange.pilot p")).toHaveText(
    "Ramat David Ground, Viper 1-1, radio check",
  );
  await expect(steps.first().locator(".exchange.controller p")).toHaveText(
    "Viper 1-1, Ramat David Ground, read you 5 by 5",
  );
  for (let index = 1; index < 6; index++)
    await steps.nth(index).locator("summary").click();
  await expect(steps.nth(1).locator(".exchange.pilot p")).toHaveText(
    "Ramat David Ground, Viper 1-1, request startup and November departure",
  );
  await expect(steps.nth(2).locator(".exchange.controller p")).toHaveText(
    "Viper 1-1, Ramat David Ground, cleared to holding point Echo via Echo, runway 27",
  );
  await expect(steps.nth(3).locator(".exchange.controller p")).toHaveText(
    "Viper 1-1, Ramat David Ground, push Ramat David Tower on 261.50",
  );
  await expect(steps.nth(4).locator(".exchange.pilot p")).toHaveText(
    "Ramat David Tower, Viper 1-1, holding short Echo, runway 27, ready for departure",
  );
  await expect(steps.last().locator(".exchange.controller p")).toHaveText(
    "Viper 1-1, Ramat David Tower, push Ramat David Departure 262.50",
  );
  await expect(steps.last().locator(".exchange.readback p")).toHaveText(
    "Push 262.50, Viper 1-1",
  );
  await expect(steps.last().locator(".detail-source")).toHaveAttribute(
    "href",
    `${process.env.VITE_BASE_PATH || "/"}reference/Lezione-13-ott-2026.pdf#page=2`,
  );
  expect(
    (
      await page.locator(".personalized-step .exchange p").allTextContents()
    ).join(" "),
  ).not.toMatch(/\b(FL|GND|TWR)\b/);
  await expect(
    page.getByText("Primo contatto con Departure", { exact: true }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.locator(".flight-summary").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `/workspace/artifacts/volo-personalizzato-${testInfo.project.name}.png`,
  });
  await navigate(page, "Partenza");
  await page
    .getByRole("button", {
      name: "Apri Controllo radio con Ground",
      exact: true,
    })
    .click();
  await expect(page.locator(".exchange.pilot p")).toHaveText(
    "GND, FL, radio check",
  );
});

test("volo personalizzato: nomi obbligatori, modifica annullabile e testo letterale", async ({
  page,
}) => {
  await navigate(page, "Volo personalizzato");
  await page.getByRole("button", { name: "Apri le comunicazioni" }).click();
  await expect(page.locator(".personalized-flight")).toHaveCount(0);
  await page.getByLabel("Nome Aeroporto", { exact: true }).fill("   ");
  await page.getByLabel("Nome Volo", { exact: true }).fill("Viper 1-1");
  await page.getByRole("button", { name: "Apri le comunicazioni" }).click();
  await expect(page.locator(".personalized-flight")).toHaveCount(0);
  await page.getByLabel("Nome Aeroporto", { exact: true }).fill("Ramat David");
  await page.getByRole("button", { name: "Apri le comunicazioni" }).click();
  await page.getByRole("button", { name: "Modifica nomi" }).click();
  await page.getByLabel("Nome Aeroporto", { exact: true }).fill("Annullato");
  await page.getByRole("button", { name: "Annulla", exact: true }).click();
  await expect(
    page.locator(".personalized-step").first().locator(".exchange.pilot p"),
  ).toHaveText("Ramat David Ground, Viper 1-1, radio check");
  await page.getByRole("button", { name: "Modifica nomi" }).click();
  await expect(page.getByLabel("Nome Aeroporto", { exact: true })).toHaveValue(
    "Ramat David",
  );
  await page
    .getByLabel("Nome Aeroporto", { exact: true })
    .fill("FL Tower $& <b>");
  await page.getByLabel("Nome Volo", { exact: true }).fill("GND 1-1");
  await page.getByRole("button", { name: "Aggiorna comunicazioni" }).click();
  await expect(
    page.locator(".personalized-step").first().locator(".exchange.pilot p"),
  ).toHaveText("FL Tower $& <b> Ground, GND 1-1, radio check");
  await expect(page.locator(".personalized-step b")).toHaveCount(0);
});
