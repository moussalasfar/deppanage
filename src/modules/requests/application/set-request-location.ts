import type { RequestDraftRepository } from "./request-draft-repository";
import {
  PublishedRequestCannotBeEditedError,
  requestLocationSchema,
  type RequestDraft,
  type RequestLocation,
} from "../domain/request-draft";

export class RequestDraftNotFoundError extends Error {
  constructor() {
    super("Request draft not found");
    this.name = "RequestDraftNotFoundError";
  }
}

type SetRequestLocationDependencies = {
  repository: RequestDraftRepository;
  now?: () => Date;
};

export async function setRequestLocation(
  requestId: string,
  ownerSessionId: string,
  input: RequestLocation,
  dependencies: SetRequestLocationDependencies,
): Promise<RequestDraft> {
  const draft = await dependencies.repository.findById(
    requestId,
    ownerSessionId,
  );
  if (!draft) {
    throw new RequestDraftNotFoundError();
  }
  if (draft.status === "published") {
    throw new PublishedRequestCannotBeEditedError();
  }

  return dependencies.repository.update({
    ...draft,
    location: requestLocationSchema.parse(input),
    updatedAt: (dependencies.now ?? (() => new Date()))().toISOString(),
  });
}
