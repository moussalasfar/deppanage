import { z } from "zod";
import { requestDetailsSchema } from "@/modules/requests/domain/request-draft";
import type { ServiceCategoryId } from "@/modules/requests/domain/service-catalog";

export type EligibleRequest = {
  id: string;
  service: ServiceCategoryId;
  vehicle: { make: string; model: string };
  city: "Casablanca" | "Rabat";
  description: string;
  urgency: "now" | "today";
  safetyStatus: "safe" | "roadside" | "danger";
  photoCount: number;
  publishedAt: string;
};

export interface EligibleRequestRepository {
  findForVerifiedProvider(): Promise<EligibleRequest[]>;
}

export async function listEligibleRequests(
  userId: string,
  repository: EligibleRequestRepository,
) {
  z.uuid().parse(userId);
  const requests = await repository.findForVerifiedProvider();
  return requests.toSorted(
    (left, right) =>
      new Date(right.publishedAt).getTime() -
      new Date(left.publishedAt).getTime(),
  );
}

export const eligibleRequestDetailsSchema = requestDetailsSchema.pick({
  description: true,
  urgency: true,
  safetyStatus: true,
});
