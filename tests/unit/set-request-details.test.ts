import { describe, expect, it } from "vitest";
import {
  InvalidRequestPhotoError,
  RequestLocationRequiredError,
  setRequestDetails,
} from "@/modules/requests/application/set-request-details";
import type { RequestDraftRepository } from "@/modules/requests/application/request-draft-repository";
import type { RequestDraft } from "@/modules/requests/domain/request-draft";

function createRepository(withLocation = true): RequestDraftRepository {
  let draft: RequestDraft = {
    id: "draft-1",
    ownerSessionId: "session-1",
    service: "tire",
    status: "draft",
    photos: [],
    vehicle: { make: "Dacia", model: "Logan", registration: "" },
    ...(withLocation
      ? {
          location: {
            source: "manual" as const,
            city: "Rabat" as const,
            address: "Gare Rabat Agdal",
          },
        }
      : {}),
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
  };

  return {
    async create(createdDraft) {
      draft = createdDraft;
      return draft;
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
}

describe("setRequestDetails", () => {
  it("stores validated details and an accepted photo", async () => {
    const result = await setRequestDetails(
      "draft-1",
      "session-1",
      {
        description: "Le pneu avant droit est completement degonfle.",
        urgency: "now",
        safetyStatus: "roadside",
      },
      [
        {
          name: "pneu.webp",
          type: "image/webp",
          size: 3,
          bytes: new Uint8Array([1, 2, 3]),
        },
      ],
      { repository: createRepository(), createId: () => "photo-1" },
    );

    expect(result.details?.urgency).toBe("now");
    expect(result.photos).toMatchObject([
      { id: "photo-1", name: "pneu.webp", type: "image/webp", size: 3 },
    ]);
  });

  it("requires location before accepting details", async () => {
    await expect(
      setRequestDetails(
        "draft-1",
        "session-1",
        {
          description: "Le vehicule ne peut plus avancer normalement.",
          urgency: "today",
          safetyStatus: "safe",
        },
        [],
        { repository: createRepository(false) },
      ),
    ).rejects.toBeInstanceOf(RequestLocationRequiredError);
  });

  it("rejects unsupported photo content types", async () => {
    await expect(
      setRequestDetails(
        "draft-1",
        "session-1",
        {
          description: "Le vehicule ne peut plus avancer normalement.",
          urgency: "today",
          safetyStatus: "safe",
        },
        [
          {
            name: "document.pdf",
            type: "application/pdf",
            size: 2,
            bytes: new Uint8Array([1, 2]),
          },
        ],
        { repository: createRepository() },
      ),
    ).rejects.toBeInstanceOf(InvalidRequestPhotoError);
  });
});
