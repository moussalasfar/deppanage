import { z } from "zod";

export interface RequestOwnershipRepository {
  claimUnownedBySession(
    ownerSessionId: string,
    userId: string,
  ): Promise<number>;
}

export class AnonymousSessionRequiredError extends Error {
  constructor() {
    super("Anonymous session is required");
    this.name = "AnonymousSessionRequiredError";
  }
}

export async function claimSessionRequests(
  ownerSessionId: string | undefined,
  userId: string,
  repository: RequestOwnershipRepository,
) {
  if (!ownerSessionId) {
    throw new AnonymousSessionRequiredError();
  }

  const authenticatedUserId = z.uuid().parse(userId);
  return repository.claimUnownedBySession(ownerSessionId, authenticatedUserId);
}
