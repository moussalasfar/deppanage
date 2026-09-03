import { describe, expect, it, vi } from "vitest";
import {
  listClientRequests,
  type ClientRequestQueryRepository,
} from "@/modules/requests/application/list-client-requests";

const userId = "2ed9fc21-3f73-4410-b029-46dd17a1a886";

describe("listClientRequests", () => {
  it("returns the most recently updated request first", async () => {
    const repository: ClientRequestQueryRepository = {
      findByUserId: vi.fn().mockResolvedValue([
        {
          id: "request-1",
          service: "tire",
          status: "published",
          vehicle: { make: "Dacia", model: "Logan", registration: "" },
          photoCount: 0,
          createdAt: "2026-09-01T10:00:00.000Z",
          updatedAt: "2026-09-01T11:00:00.000Z",
          publishedAt: "2026-09-01T11:00:00.000Z",
        },
        {
          id: "request-2",
          service: "battery",
          status: "draft",
          vehicle: { make: "Renault", model: "Clio", registration: "" },
          photoCount: 0,
          createdAt: "2026-09-02T10:00:00.000Z",
          updatedAt: "2026-09-02T10:00:00.000Z",
        },
      ]),
    };

    const result = await listClientRequests(userId, repository);

    expect(result.map((request) => request.id)).toEqual([
      "request-2",
      "request-1",
    ]);
    expect(repository.findByUserId).toHaveBeenCalledWith(userId);
  });

  it("rejects an invalid user id before querying", async () => {
    const findByUserId = vi.fn();
    const repository: ClientRequestQueryRepository = { findByUserId };

    await expect(listClientRequests("invalid", repository)).rejects.toThrow();
    expect(findByUserId).not.toHaveBeenCalled();
  });
});
