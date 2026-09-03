import { describe, expect, it } from "vitest";
import {
  IncompleteRequestError,
  publishRequest,
  RequestAlreadyPublishedError,
} from "@/modules/requests/application/publish-request";
import type { RequestDraftRepository } from "@/modules/requests/application/request-draft-repository";
import type { RequestDraft } from "@/modules/requests/domain/request-draft";

function createRepository(
  overrides: Partial<RequestDraft> = {},
  withDetails = true,
) {
  let draft: RequestDraft = {
    id: "draft-1",
    ownerSessionId: "session-1",
    service: "tire",
    status: "draft",
    photos: [],
    vehicle: { make: "Dacia", model: "Logan", registration: "" },
    location: {
      source: "manual",
      city: "Rabat",
      address: "Gare Rabat Agdal",
    },
    ...(withDetails
      ? {
          details: {
            description: "Le pneu avant droit est completement degonfle.",
            urgency: "now" as const,
            safetyStatus: "roadside" as const,
          },
        }
      : {}),
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
    ...overrides,
  };

  const repository: RequestDraftRepository = {
    async create(createdDraft) {
      draft = structuredClone(createdDraft);
      return structuredClone(draft);
    },
    async findById(id, ownerSessionId) {
      return draft.id === id && draft.ownerSessionId === ownerSessionId
        ? structuredClone(draft)
        : null;
    },
    async update(updatedDraft) {
      draft = structuredClone(updatedDraft);
      return structuredClone(draft);
    },
  };

  return repository;
}

describe("publishRequest", () => {
  it("publishes a complete request and records the publication time", async () => {
    const result = await publishRequest("draft-1", "session-1", {
      repository: createRepository(),
      now: () => new Date("2026-09-02T12:00:00.000Z"),
    });

    expect(result).toMatchObject({
      status: "published",
      publishedAt: "2026-09-02T12:00:00.000Z",
      updatedAt: "2026-09-02T12:00:00.000Z",
    });
  });

  it("rejects publication when details are missing", async () => {
    await expect(
      publishRequest("draft-1", "session-1", {
        repository: createRepository({}, false),
      }),
    ).rejects.toBeInstanceOf(IncompleteRequestError);
  });

  it("rejects a second publication", async () => {
    await expect(
      publishRequest("draft-1", "session-1", {
        repository: createRepository({ status: "published" }),
      }),
    ).rejects.toBeInstanceOf(RequestAlreadyPublishedError);
  });
});
