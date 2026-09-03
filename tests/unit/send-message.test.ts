import { describe, expect, it, vi } from "vitest";
import {
  sendMessage,
  type MessageCommandRepository,
} from "@/modules/messaging/application/send-message";

const senderId = "550e8400-e29b-41d4-a716-446655440000";
const interventionId = "c4a760a8-37a4-49a2-a03b-8c8e3ddd67fd";

describe("sendMessage", () => {
  it("trims and sends a participant message", async () => {
    const repository: MessageCommandRepository = {
      send: vi.fn().mockResolvedValue({
        id: "b99f30e7-7569-45c0-ae06-67cfacc37d1a",
        interventionId,
        senderId,
        senderRole: "client",
        body: "Je suis devant l'entree principale.",
        createdAt: "2026-09-03T12:00:00.000Z",
      }),
    };

    await sendMessage(
      senderId,
      { interventionId, body: "  Je suis devant l'entree principale.  " },
      repository,
    );

    expect(repository.send).toHaveBeenCalledWith(
      senderId,
      interventionId,
      "Je suis devant l'entree principale.",
    );
  });

  it.each(["", " ", "a".repeat(501)])(
    "rejects an invalid body before accessing the repository",
    async (body) => {
      const repository: MessageCommandRepository = { send: vi.fn() };

      await expect(
        sendMessage(senderId, { interventionId, body }, repository),
      ).rejects.toThrow();
      expect(repository.send).not.toHaveBeenCalled();
    },
  );
});
