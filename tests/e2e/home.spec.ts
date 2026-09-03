import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("opens an accessible phone login and validates the number locally", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Ouvrir le compte" }).click();

  await expect(page).toHaveURL(/\/connexion$/);
  await expect(
    page.getByRole("heading", { name: "Connectez-vous par telephone" }),
  ).toBeVisible();

  await page.getByLabel("Numero de telephone").fill("0512345678");
  await page.getByRole("button", { name: "Recevoir mon code" }).click();
  await expect(
    page
      .getByRole("alert")
      .getByText("Saisissez un numero mobile marocain valide."),
  ).toBeVisible();

  const accessibilityScan = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScan.violations).toEqual([]);
});

test("protects the client request list and preserves the return path", async ({
  page,
}) => {
  await page.goto("/demandes");

  await expect(page).toHaveURL(/\/connexion\?retour=(?:%2F|\/)demandes$/);
  await expect(
    page.getByRole("heading", { name: "Connectez-vous par telephone" }),
  ).toBeVisible();
});

test("protects provider registration and preserves the return path", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Rejoindre le reseau/ }).click();

  await expect(page).toHaveURL(
    /\/connexion\?retour=(?:%2F|\/)pro(?:%2F|\/)inscription$/,
  );
  await expect(
    page.getByRole("heading", { name: "Connectez-vous par telephone" }),
  ).toBeVisible();
});

test("starts an assistance request from an accessible home screen", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "De quel depannage avez-vous besoin ?" }),
  ).toBeVisible();

  const tireOption = page.getByRole("radio", { name: "Pneu" });
  await tireOption.check();
  await expect(tireOption).toBeChecked();

  const accessibilityScan = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScan.violations).toEqual([]);

  await page.getByRole("button", { name: "Demander un depanneur" }).click();
  await expect(page).toHaveURL(/\/demander\?service=tire/);
  await expect(page.getByText("Probleme selectionne : Pneu")).toBeVisible();

  await page.getByLabel("Marque").fill("Dacia");
  await page.getByLabel("Modele").fill("Logan");
  await page.getByLabel("Immatriculation").fill("12345-A-6");

  const requestCreated = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/requests") && response.status() === 201,
  );
  await page.getByRole("button", { name: "Continuer" }).click();
  await requestCreated;

  await expect(page).toHaveURL(/\/demander\/[a-f0-9-]+\/localisation/, {
    timeout: 15_000,
  });
  await expect(
    page.getByRole("heading", { name: "Ou se trouve le vehicule ?" }),
  ).toBeVisible();

  await page.getByRole("radio", { name: "Rabat" }).check();
  await page.getByRole("tab", { name: "Repere manuel" }).click();
  await page
    .getByLabel("Adresse ou point de repere")
    .fill("Devant la gare Rabat Agdal, entree principale");

  const locationUpdated = page.waitForResponse(
    (response) =>
      response.url().endsWith("/location") && response.status() === 200,
  );
  await page.getByRole("button", { name: "Enregistrer ce repere" }).click();
  await locationUpdated;

  await expect(page).toHaveURL(/\/demander\/[a-f0-9-]+\/details/, {
    timeout: 15_000,
  });
  await expect(
    page.getByRole("heading", { name: "Que se passe-t-il ?" }),
  ).toBeVisible();

  await page
    .getByLabel("Decrivez ce que vous observez")
    .fill(
      "Le pneu avant droit est degonfle et je n'ai pas de roue de secours.",
    );
  await page.getByRole("radio", { name: /Maintenant/ }).check();
  await page.getByRole("radio", { name: /Bas-cote/ }).check();

  const detailsUpdated = page.waitForResponse(
    (response) =>
      response.url().endsWith("/details") && response.status() === 200,
  );
  await page.getByRole("button", { name: "Verifier ma demande" }).click();
  await detailsUpdated;

  await expect(page).toHaveURL(/\/demander\/[a-f0-9-]+\/verification/, {
    timeout: 15_000,
  });
  await expect(
    page.getByRole("heading", { name: "Votre demande est-elle correcte ?" }),
  ).toBeVisible();
  await expect(page.getByText("Dacia Logan - 12345-A-6")).toBeVisible();
  await expect(
    page.getByText(/Rabat - Devant la gare Rabat Agdal/),
  ).toBeVisible();

  const publicationBlocked = page.waitForResponse(
    (response) =>
      response.url().endsWith("/publish") && response.status() === 503,
  );
  await page.getByRole("button", { name: "Publier ma demande" }).click();
  await publicationBlocked;

  await expect(page).toHaveURL(
    /\/connexion\?retour=(?:%2F|\/)demander(?:%2F|\/)[a-f0-9-]+(?:%2F|\/)verification/,
  );
  await expect(
    page.getByRole("heading", { name: "Connectez-vous par telephone" }),
  ).toBeVisible();

  const detailsAccessibilityScan = await new AxeBuilder({ page }).analyze();
  expect(detailsAccessibilityScan.violations).toEqual([]);
});
