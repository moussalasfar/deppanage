import { z } from "zod";
import {
  providerVerificationDecisionSchema,
  type PendingProvider,
  type ProviderVerificationDecision,
} from "../domain/provider-verification";

export interface AdminProviderVerificationRepository {
  isAdmin(userId: string): Promise<boolean>;
  listPending(): Promise<PendingProvider[]>;
  decide(
    providerId: string,
    decision: ProviderVerificationDecision,
  ): Promise<void>;
}

export class AdminAccessDeniedError extends Error {
  constructor() {
    super("Admin access required");
    this.name = "AdminAccessDeniedError";
  }
}

async function assertAdmin(
  userId: string,
  repository: AdminProviderVerificationRepository,
) {
  const authenticatedUserId = z.uuid().parse(userId);
  if (!(await repository.isAdmin(authenticatedUserId))) {
    throw new AdminAccessDeniedError();
  }
}

export async function listPendingProviders(
  adminId: string,
  repository: AdminProviderVerificationRepository,
) {
  await assertAdmin(adminId, repository);
  return repository.listPending();
}

export async function decideProviderVerification(
  adminId: string,
  providerId: string,
  input: unknown,
  repository: AdminProviderVerificationRepository,
) {
  await assertAdmin(adminId, repository);
  const validatedProviderId = z.uuid().parse(providerId);
  const decision = providerVerificationDecisionSchema.parse(input);
  await repository.decide(validatedProviderId, decision);
  return decision.status;
}
