// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OperationsConsole } from "@/modules/admin/components/operations-console";

const provider = {
  id: "c4a760a8-37a4-49a2-a03b-8c8e3ddd67fd",
  businessName: "Atlas Remorquage",
  city: "Casablanca" as const,
  vehicleType: "tow_truck" as const,
  vehicleRegistration: "12345-A-6",
  serviceIds: ["towing"],
  submittedAt: "2026-09-03T10:00:00.000Z",
};

describe("OperationsConsole", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("validates a provider and removes it from the pending queue", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { status: "verified" } }),
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<OperationsConsole initialProviders={[provider]} />);

    fireEvent.click(screen.getByRole("button", { name: "Valider" }));

    await waitFor(() =>
      expect(screen.queryByText("Atlas Remorquage")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Aucune candidature a traiter")).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/admin/providers/${provider.id}/verification`,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ status: "verified" }),
      }),
    );
  });
});
