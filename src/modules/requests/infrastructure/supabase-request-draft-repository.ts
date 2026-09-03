import "server-only";

import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";
import type { RequestDraftRepository } from "../application/request-draft-repository";
import {
  createRequestDraftSchema,
  requestDetailsSchema,
  requestLocationSchema,
  type RequestDraft,
  type RequestPhoto,
} from "../domain/request-draft";

const photoBucket = "request-photos";

function hashSession(ownerSessionId: string) {
  return createHash("sha256").update(ownerSessionId).digest("hex");
}

function asJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

async function findDraft(id: string, ownerSessionId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("request_drafts")
    .select("*, request_photos(*)")
    .eq("id", id)
    .eq("owner_session_hash", hashSession(ownerSessionId))
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }

  const base = createRequestDraftSchema.parse({
    service: data.service,
    vehicle: data.vehicle,
  });
  const photos: RequestPhoto[] = data.request_photos.map((photo) => ({
    id: photo.id,
    name: photo.file_name,
    type: photo.content_type as RequestPhoto["type"],
    size: photo.byte_size,
    bytes: new Uint8Array(),
  }));

  return {
    ...base,
    id: data.id,
    ownerSessionId,
    status: data.status,
    ...(data.location
      ? { location: requestLocationSchema.parse(data.location) }
      : {}),
    ...(data.details
      ? { details: requestDetailsSchema.parse(data.details) }
      : {}),
    photos,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    ...(data.published_at ? { publishedAt: data.published_at } : {}),
  } satisfies RequestDraft;
}

export const supabaseRequestDraftRepository: RequestDraftRepository = {
  async create(draft) {
    const supabase = createAdminClient();
    const { error } = await supabase.from("request_drafts").insert({
      id: draft.id,
      owner_session_hash: hashSession(draft.ownerSessionId),
      service: draft.service,
      status: draft.status,
      vehicle: asJson(draft.vehicle),
      created_at: draft.createdAt,
      updated_at: draft.updatedAt,
    });

    if (error) {
      throw error;
    }
    return structuredClone(draft);
  },

  findById: findDraft,

  async update(draft) {
    const supabase = createAdminClient();
    const currentDraft = await findDraft(draft.id, draft.ownerSessionId);
    if (!currentDraft) {
      throw new Error("REQUEST_DRAFT_NOT_FOUND");
    }

    const newPhotos = draft.photos.filter(
      (photo) => photo.bytes.byteLength > 0,
    );
    const retainedPhotoIds = new Set(
      draft.photos
        .filter((photo) => photo.bytes.byteLength === 0)
        .map((photo) => photo.id),
    );
    const stalePhotos = currentDraft.photos.filter(
      (photo) => !retainedPhotoIds.has(photo.id),
    );
    const uploadedPaths: string[] = [];

    try {
      for (const photo of newPhotos) {
        const objectPath = `${draft.id}/${photo.id}`;
        const { error } = await supabase.storage
          .from(photoBucket)
          .upload(objectPath, photo.bytes, {
            contentType: photo.type,
            upsert: false,
          });
        if (error) {
          throw error;
        }
        uploadedPaths.push(objectPath);
      }

      const { error: updateError } = await supabase
        .from("request_drafts")
        .update({
          status: draft.status,
          vehicle: asJson(draft.vehicle),
          location: draft.location ? asJson(draft.location) : null,
          details: draft.details ? asJson(draft.details) : null,
          updated_at: draft.updatedAt,
          published_at: draft.publishedAt ?? null,
        })
        .eq("id", draft.id)
        .eq("owner_session_hash", hashSession(draft.ownerSessionId));
      if (updateError) {
        throw updateError;
      }

      if (newPhotos.length) {
        const { error: photoError } = await supabase
          .from("request_photos")
          .insert(
            newPhotos.map((photo) => ({
              id: photo.id,
              request_id: draft.id,
              object_path: `${draft.id}/${photo.id}`,
              file_name: photo.name,
              content_type: photo.type,
              byte_size: photo.size,
            })),
          );
        if (photoError) {
          throw photoError;
        }
      }

      if (stalePhotos.length) {
        const stalePhotoIds = stalePhotos.map((photo) => photo.id);
        const { error: deleteError } = await supabase
          .from("request_photos")
          .delete()
          .in("id", stalePhotoIds)
          .eq("request_id", draft.id);
        if (deleteError) {
          throw deleteError;
        }
      }
    } catch (error) {
      if (uploadedPaths.length) {
        await supabase.storage.from(photoBucket).remove(uploadedPaths);
      }
      throw error;
    }

    if (stalePhotos.length) {
      const { error } = await supabase.storage
        .from(photoBucket)
        .remove(stalePhotos.map((photo) => `${draft.id}/${photo.id}`));
      if (error) {
        console.error("request_photo_cleanup_failed", {
          requestId: draft.id,
          photoIds: stalePhotos.map((photo) => photo.id),
          error,
        });
      }
    }

    return structuredClone(draft);
  },
};
