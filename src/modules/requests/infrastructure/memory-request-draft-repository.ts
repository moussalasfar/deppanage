import type { RequestDraftRepository } from "../application/request-draft-repository";
import type { RequestDraft } from "../domain/request-draft";

const storeKey = Symbol.for("depannage.request-drafts");
const globalStore = globalThis as typeof globalThis & {
  [storeKey]?: Map<string, RequestDraft>;
};

function getStore() {
  globalStore[storeKey] ??= new Map<string, RequestDraft>();
  return globalStore[storeKey];
}

export const memoryRequestDraftRepository: RequestDraftRepository = {
  async create(draft) {
    getStore().set(draft.id, structuredClone(draft));
    return structuredClone(draft);
  },

  async findById(id, ownerSessionId) {
    const draft = getStore().get(id);
    return draft?.ownerSessionId === ownerSessionId
      ? structuredClone(draft)
      : null;
  },

  async update(draft) {
    const currentDraft = getStore().get(draft.id);
    if (!currentDraft || currentDraft.ownerSessionId !== draft.ownerSessionId) {
      throw new Error("REQUEST_DRAFT_NOT_FOUND");
    }

    getStore().set(draft.id, structuredClone(draft));
    return structuredClone(draft);
  },
};
