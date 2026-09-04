// @vitest-environment jsdom

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PartsStore } from "@/modules/marketplace/components/parts-store";

describe("PartsStore", () => {
  it("filters compatible parts and builds a local cart", async () => {
    const user = userEvent.setup();
    render(<PartsStore />);

    await user.selectOptions(
      screen.getByLabelText("Compatibilite"),
      "Renault Clio",
    );
    await user.click(screen.getByRole("button", { name: "Batteries" }));

    expect(screen.getByText("Batterie 60 Ah Start+")).toBeVisible();
    expect(screen.queryByText("Pneu route 185/65 R15")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Ajouter Batterie 60 Ah Start+ au panier",
      }),
    );

    expect(screen.getByLabelText("1 article(s)")).toBeVisible();
    expect(
      within(screen.getByRole("complementary")).getAllByText("890 MAD"),
    ).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: "Choisir livraison ou pose" }),
    ).toBeEnabled();

    await user.click(
      screen.getByRole("button", { name: "Choisir livraison ou pose" }),
    );
    await user.click(screen.getByRole("radio", { name: /Pose par un pro/ }));
    await user.type(
      screen.getByLabelText("Adresse ou point de repere"),
      "Gare Rabat Agdal",
    );
    await user.click(
      screen.getByRole("button", { name: "Confirmer la demande" }),
    );

    expect(screen.getByText("Votre commande est preparee.")).toBeVisible();
  });
});
