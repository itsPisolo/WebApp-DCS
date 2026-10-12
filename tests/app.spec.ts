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

test("filtro IFR: chiamate comuni incluse e scenari VFR esclusi", async ({ page }) => {
  await page.getByRole("group", { name: "Procedura di volo" }).getByRole("button", { name: "IFR", exact: true }).click();
  await expect(page.getByRole("button", { name: "Apri Avviamento con ATIS", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Apri Partenza IFR", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Apri Uscita VFR", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Apri Ingresso nel circuito", exact: true })).toHaveCount(0);
});

test("aprire una scheda in fondo alla lista e tornarci su schermi piccoli", async ({ page }) => {
  await page.getByRole("button", { name: "Apri Rientro al parcheggio", exact: true }).click();
  await expect(page.locator(".detail-panel > h2")).toHaveText("Rientro al parcheggio");
  await expect(page.getByText("Taxi to apron L via H, L2, BEAR 2-1", { exact: true })).toBeVisible();
  if (page.viewportSize()!.width <= 900) {
    await expect(page.locator("#detail-title")).toBeInViewport();
    await page.getByRole("button", { name: "Torna alle schede", exact: true }).click();
    await expect(page.getByRole("button", { name: "Apri Rientro al parcheggio", exact: true })).toBeFocused();
    await expect(page.getByRole("button", { name: "Apri Rientro al parcheggio", exact: true })).toBeInViewport();
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
