import { z } from "zod";
import {
  providerApplicationSchema,
  type ProviderApplication,
  type ProviderVerificationStatus,
} from "../domain/provider-profile";

export type ProviderProfile = ProviderApplication & {
  userId: string;
  verificationStatus: ProviderVerificationStatus;
  rejectionReason?: string;
};

export interface ProviderProfileRepository {
  findByUserId(userId: string): Promise<ProviderProfile | null>;
  savePending(userId: string, application: ProviderApplication): Promise<void>;
}

export class ProviderAlreadyVerifiedError extends Error {
  constructor() {
    super("Verified provider profile cannot be resubmitted");
    this.name = "ProviderAlreadyVerifiedError";
  }
}

export async function submitProviderApplication(
  userId: string,
  input: unknown,
  repository: ProviderProfileRepository,
) {
  const authenticatedUserId = z.uuid().parse(userId);
  const application = providerApplicationSchema.parse(input);
  const currentProfile = await repository.findByUserId(authenticatedUserId);
  if (currentProfile?.verificationStatus === "verified") {
    throw new ProviderAlreadyVerifiedError();
  }
  await repository.savePending(authenticatedUserId, application);
  return application;
}
