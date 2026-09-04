// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PlatformDemo } from "@/modules/demo/components/platform-demo";

describe("PlatformDemo", () => {
  it("switches roles, submits a provider offer, compares a client budget and opens the marketplace", async () => {
    const user = userEvent.setup();
    render(<PlatformDemo />);

    expect(
      screen.getByRole("heading", {
        name: /De quel depannage avez-vous besoin/,
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Voir la plateforme comme depanneur",
      }),
    );
    expect(
      screen.getByRole("heading", { name: "Demandes en direct" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Pneu" }));
    expect(screen.getByText("1 demande(s) affichee(s)")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Consulter Batterie a plat a Maarif, Casablanca",
      }),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Consulter Pneu avant creve a Agdal, Rabat",
      }),
    );
    const price = screen.getByRole("spinbutton", {
      name: "Votre prix (MAD)",
    });
    await user.clear(price);
    await user.type(price, "275");
    await user.click(screen.getByRole("button", { name: "Envoyer mon offre" }));
    expect(
      screen.getByRole("button", { name: "Offre enregistree" }),
    ).toBeInTheDocument();
    expect(price).toHaveValue(275);

    await user.click(
      screen.getByRole("button", {
        name: "Voir la plateforme comme client",
      }),
    );
    const budget = screen.getByRole("slider", { name: "Budget maximum" });
    fireEvent.change(budget, { target: { value: "250" } });
    expect(
      screen.getByText("1 offre(s) dans votre budget"),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Choisir l'offre de Casa Auto Secours",
      }),
    );
    expect(screen.getByText(/Depanneur confirme/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Marketplace" }));
    expect(
      screen.getByRole("heading", {
        name: "Les bonnes pieces, avec ou sans la pose.",
      }),
    ).toBeInTheDocument();

    await user.type(
      screen.getByRole("textbox", { name: "Rechercher une piece" }),
      "Pneu",
    );
    expect(screen.getByText("Pneu route 185/65 R15")).toBeInTheDocument();
    expect(screen.queryByText("Batterie Start+ 60 Ah")).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", {
        name: "Ajouter Pneu route 185/65 R15 au panier",
      }),
    );
    expect(screen.getByRole("link", { name: "Panier 1" })).toBeInTheDocument();
  });
});
