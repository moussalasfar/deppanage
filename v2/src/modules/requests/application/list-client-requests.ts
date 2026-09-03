import { z } from "zod";
import type { RequestDetails, RequestLocation } from "../domain/request-draft";
import type { ServiceCategoryId } from "../domain/service-catalog";

export type ClientRequestListItem = {
  id: string;
  service: ServiceCategoryId;
  status: "draft" | "published";
  vehicle: { make: string; model: string; registration: string };
  location?: RequestLocation;
  details?: RequestDetails;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
};

export interface ClientRequestQueryRepository {
  findByUserId(userId: string): Promise<ClientRequestListItem[]>;
}

export async function listClientRequests(
  userId: string,
  repository: ClientRequestQueryRepository,
) {
  const authenticatedUserId = z.uuid().parse(userId);
  const requests = await repository.findByUserId(authenticatedUserId);

  return requests.toSorted(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}
