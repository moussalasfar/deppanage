import type { RequestDraft } from "../domain/request-draft";

export interface RequestDraftRepository {
  create(draft: RequestDraft): Promise<RequestDraft>;
  findById(id: string, ownerSessionId: string): Promise<RequestDraft | null>;
  update(draft: RequestDraft): Promise<RequestDraft>;
}
