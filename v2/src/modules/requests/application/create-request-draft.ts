import type { RequestDraftRepository } from "./request-draft-repository";
import {
  createRequestDraftSchema,
  type CreateRequestDraftInput,
  type RequestDraft,
} from "../domain/request-draft";

type CreateRequestDraftDependencies = {
  repository: RequestDraftRepository;
  createId?: () => string;
  now?: () => Date;
};

export async function createRequestDraft(
  input: CreateRequestDraftInput,
  ownerSessionId: string,
  dependencies: CreateRequestDraftDependencies,
): Promise<RequestDraft> {
  const data = createRequestDraftSchema.parse(input);
  const timestamp = (dependencies.now ?? (() => new Date()))().toISOString();
  const draft: RequestDraft = {
    ...data,
    id: (dependencies.createId ?? crypto.randomUUID)(),
    ownerSessionId,
    status: "draft",
    photos: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return dependencies.repository.create(draft);
}
