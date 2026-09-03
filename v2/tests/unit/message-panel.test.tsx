// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MessagePanel } from "@/modules/messaging/components/message-panel";

const removeChannel = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    channel: () => ({
      on() {
        return this;
      },
      subscribe() {
        return this;
      },
    }),
    removeChannel,
  }),
}));

describe("MessagePanel", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });
  });

  it("keeps the draft and disables sending while offline", () => {
    render(
      <MessagePanel
        currentUserId="client-id"
        initialMessages={[]}
        interventionId="intervention-id"
        isClosed={false}
      />,
    );

    const composer = screen.getByLabelText("Votre message");
    fireEvent.change(composer, { target: { value: "Je suis devant la gare" } });
    expect(screen.getByText("22/500")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Envoyer le message" }),
    ).toBeEnabled();

    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: false,
    });
    fireEvent(window, new Event("offline"));

    expect(screen.getByText(/Hors connexion/)).toBeVisible();
    expect(composer).toHaveValue("Je suis devant la gare");
    expect(
      screen.getByRole("button", { name: "Envoyer le message" }),
    ).toBeDisabled();
  });
});
