import type { RequestDraftRepository } from "./request-draft-repository";
import type { RequestDraft } from "../domain/request-draft";
import { RequestDraftNotFoundError } from "./set-request-location";

export class IncompleteRequestError extends Error {
  constructor() {
    super("Request must have a location and details before publication");
    this.name = "IncompleteRequestError";
  }
}

export class RequestAlreadyPublishedError extends Error {
  constructor() {
    super("Request is already published");
    this.name = "RequestAlreadyPublishedError";
  }
}

type PublishRequestDependencies = {
  repository: RequestDraftRepository;
  now?: () => Date;
};

export async function publishRequest(
  requestId: string,
  ownerSessionId: string,
  dependencies: PublishRequestDependencies,
): Promise<RequestDraft> {
  const draft = await dependencies.repository.findById(
    requestId,
    ownerSessionId,
  );
  if (!draft) {
    throw new RequestDraftNotFoundError();
  }
  if (draft.status === "published") {
    throw new RequestAlreadyPublishedError();
  }
  if (!draft.location || !draft.details) {
    throw new IncompleteRequestError();
  }

  const publishedAt = (dependencies.now ?? (() => new Date()))().toISOString();
  return dependencies.repository.update({
    ...draft,
    status: "published",
    publishedAt,
    updatedAt: publishedAt,
  });
}
