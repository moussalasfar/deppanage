import { describe, expect, it } from "vitest";
import { createRequestDraft } from "@/modules/requests/application/create-request-draft";
import type { RequestDraftRepository } from "@/modules/requests/application/request-draft-repository";
import type { RequestDraft } from "@/modules/requests/domain/request-draft";

function createRepository() {
  const drafts = new Map<string, RequestDraft>();
  const repository: RequestDraftRepository = {
    async create(draft) {
      drafts.set(draft.id, draft);
      return draft;
    },
    async findById(id, ownerSessionId) {
      const draft = drafts.get(id);
      return draft?.ownerSessionId === ownerSessionId ? draft : null;
    },
    async update(draft) {
      drafts.set(draft.id, draft);
      return draft;
    },
  };

  return { drafts, repository };
}

describe("createRequestDraft", () => {
  it("validates and stores a vehicle draft owned by the current session", async () => {
    const { drafts, repository } = createRepository();

    const draft = await createRequestDraft(
      {
        service: "tire",
        vehicle: {
          make: "  Dacia ",
          model: "Logan",
          registration: "12345-A-6",
        },
      },
      "session-1",
      {
        repository,
        createId: () => "draft-1",
        now: () => new Date("2026-09-01T10:00:00.000Z"),
      },
    );

    expect(draft).toMatchObject({
      id: "draft-1",
      ownerSessionId: "session-1",
      service: "tire",
      status: "draft",
      photos: [],
      vehicle: { make: "Dacia", model: "Logan" },
    });
    expect(drafts.get("draft-1")).toEqual(draft);
  });

  it("rejects an unsupported service before reaching the repository", async () => {
    const { drafts, repository } = createRepository();

    await expect(
      createRequestDraft(
        {
          service: "plumbing" as "tire",
          vehicle: { make: "Dacia", model: "Logan", registration: "" },
        },
        "session-1",
        { repository },
      ),
    ).rejects.toThrow();
    expect(drafts.size).toBe(0);
  });
});
