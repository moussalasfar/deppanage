import { z } from "zod";
import { serviceCategories } from "./service-catalog";

const serviceIds = serviceCategories.map((service) => service.id) as [
  (typeof serviceCategories)[number]["id"],
  ...(typeof serviceCategories)[number]["id"][],
];

export const createRequestDraftSchema = z.object({
  service: z.enum(serviceIds),
  vehicle: z.object({
    make: z.string().trim().min(2).max(60),
    model: z.string().trim().min(1).max(60),
    registration: z.string().trim().max(20).optional().default(""),
  }),
});

export const requestLocationSchema = z.discriminatedUnion("source", [
  z.object({
    source: z.literal("gps"),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracyMeters: z.number().positive().max(10_000),
    city: z.enum(["Casablanca", "Rabat"]),
    address: z.string().trim().max(180).optional().default(""),
  }),
  z.object({
    source: z.literal("manual"),
    city: z.enum(["Casablanca", "Rabat"]),
    address: z.string().trim().min(5).max(180),
  }),
]);

export const requestDetailsSchema = z.object({
  description: z.string().trim().min(10).max(500),
  urgency: z.enum(["now", "today"]),
  safetyStatus: z.enum(["safe", "roadside", "danger"]),
});

export const acceptedPhotoTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const maxRequestPhotos = 3;
export const maxRequestPhotoBytes = 5 * 1024 * 1024;

export class PublishedRequestCannotBeEditedError extends Error {
  constructor() {
    super("Published request cannot be edited");
    this.name = "PublishedRequestCannotBeEditedError";
  }
}

export type CreateRequestDraftInput = z.infer<typeof createRequestDraftSchema>;
export type RequestLocation = z.infer<typeof requestLocationSchema>;
export type RequestDetails = z.infer<typeof requestDetailsSchema>;

export type RequestPhoto = {
  id: string;
  name: string;
  type: (typeof acceptedPhotoTypes)[number];
  size: number;
  bytes: Uint8Array;
};

export type RequestDraft = CreateRequestDraftInput & {
  id: string;
  ownerSessionId: string;
  status: "draft" | "published";
  location?: RequestLocation;
  details?: RequestDetails;
  photos: RequestPhoto[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
};
