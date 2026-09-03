import { describe, expect, it } from "vitest";
import {
  RequestDraftNotFoundError,
  setRequestLocation,
} from "@/modules/requests/application/set-request-location";
import type { RequestDraftRepository } from "@/modules/requests/application/request-draft-repository";
import type { RequestDraft } from "@/modules/requests/domain/request-draft";

const initialDraft: RequestDraft = {
  id: "draft-1",
  ownerSessionId: "session-1",
  service: "tire",
  status: "draft",
  photos: [],
  vehicle: { make: "Dacia", model: "Logan", registration: "" },
  createdAt: "2026-09-01T10:00:00.000Z",
  updatedAt: "2026-09-01T10:00:00.000Z",
};

function createRepository(): RequestDraftRepository {
  let draft = structuredClone(initialDraft);
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

describe("setRequestLocation", () => {
  it("stores a validated manual location on the owned draft", async () => {
    const result = await setRequestLocation(
      "draft-1",
      "session-1",
      { source: "manual", city: "Casablanca", address: "Maarif, Casablanca" },
      {
        repository: createRepository(),
        now: () => new Date("2026-09-01T11:00:00.000Z"),
      },
    );

    expect(result.location).toEqual({
      source: "manual",
      city: "Casablanca",
      address: "Maarif, Casablanca",
    });
    expect(result.updatedAt).toBe("2026-09-01T11:00:00.000Z");
  });

  it("does not reveal a draft owned by another session", async () => {
    await expect(
      setRequestLocation(
        "draft-1",
        "session-2",
        { source: "manual", city: "Rabat", address: "Agdal, Rabat" },
        { repository: createRepository() },
      ),
    ).rejects.toBeInstanceOf(RequestDraftNotFoundError);
  });

  it("rejects invalid GPS coordinates", async () => {
    await expect(
      setRequestLocation(
        "draft-1",
        "session-1",
        {
          source: "gps",
          city: "Casablanca",
          latitude: 120,
          longitude: -7.6,
          accuracyMeters: 20,
          address: "",
        },
        { repository: createRepository() },
      ),
    ).rejects.toThrow();
  });
});
