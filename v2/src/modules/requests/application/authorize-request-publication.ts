import { z } from "zod";

export interface RequestPublicationOwnershipRepository {
  isOwnedByUser(requestId: string, userId: string): Promise<boolean>;
}

export class RequestPublicationForbiddenError extends Error {
  constructor() {
    super("Authenticated user does not own this request");
    this.name = "RequestPublicationForbiddenError";
  }
}

export async function authorizeRequestPublication(
  requestId: string,
  userId: string,
  repository: RequestPublicationOwnershipRepository,
) {
  const authenticatedUserId = z.uuid().parse(userId);
  if (!(await repository.isOwnedByUser(requestId, authenticatedUserId))) {
    throw new RequestPublicationForbiddenError();
  }
}
