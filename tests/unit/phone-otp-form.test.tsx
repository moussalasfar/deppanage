// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PhoneOtpForm } from "@/modules/auth/components/phone-otp-form";

const signInWithOtp = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { signInWithOtp } }),
}));

describe("PhoneOtpForm", () => {
  beforeEach(() => {
    signInWithOtp.mockReset();
  });

  it("keeps the phone step visible when sending the code fails", async () => {
    signInWithOtp.mockResolvedValue({ error: new Error("SMS unavailable") });
    const user = userEvent.setup();
    render(<PhoneOtpForm returnTo="/pro/demandes" />);

    await user.type(screen.getByLabelText("Numero de telephone"), "0600000001");
    await user.click(screen.getByRole("button", { name: "Recevoir mon code" }));

    expect(
      await screen.findByText(
        "Le code ne peut pas etre envoye pour le moment.",
      ),
    ).toBeVisible();
    expect(screen.getByLabelText("Numero de telephone")).toBeVisible();
    expect(screen.queryByText(/Code envoye au/)).not.toBeInTheDocument();
  });
});
