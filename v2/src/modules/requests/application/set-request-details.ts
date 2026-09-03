import type { RequestDraftRepository } from "./request-draft-repository";
import {
  acceptedPhotoTypes,
  maxRequestPhotoBytes,
  maxRequestPhotos,
  PublishedRequestCannotBeEditedError,
  requestDetailsSchema,
  type RequestDraft,
  type RequestPhoto,
} from "../domain/request-draft";
import { RequestDraftNotFoundError } from "./set-request-location";

export class RequestLocationRequiredError extends Error {
  constructor() {
    super("Request location is required");
    this.name = "RequestLocationRequiredError";
  }
}

export class InvalidRequestPhotoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidRequestPhotoError";
  }
}

type PhotoInput = {
  name: string;
  type: string;
  size: number;
  bytes: Uint8Array;
};

type SetRequestDetailsDependencies = {
  repository: RequestDraftRepository;
  createId?: () => string;
  now?: () => Date;
};

export async function setRequestDetails(
  requestId: string,
  ownerSessionId: string,
  detailsInput: unknown,
  photoInputs: PhotoInput[],
  dependencies: SetRequestDetailsDependencies,
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
  if (!draft.location) {
    throw new RequestLocationRequiredError();
  }
  if (photoInputs.length > maxRequestPhotos) {
    throw new InvalidRequestPhotoError("Too many request photos");
  }

  const createId = dependencies.createId ?? crypto.randomUUID;
  const photos: RequestPhoto[] = photoInputs.map((photo) => {
    if (
      !acceptedPhotoTypes.includes(
        photo.type as (typeof acceptedPhotoTypes)[number],
      ) ||
      photo.size <= 0 ||
      photo.size > maxRequestPhotoBytes ||
      photo.bytes.byteLength !== photo.size
    ) {
      throw new InvalidRequestPhotoError("Invalid request photo");
    }

    return {
      id: createId(),
      name: photo.name.slice(0, 120),
      type: photo.type as RequestPhoto["type"],
      size: photo.size,
      bytes: photo.bytes,
    };
  });

  return dependencies.repository.update({
    ...draft,
    details: requestDetailsSchema.parse(detailsInput),
    photos,
    updatedAt: (dependencies.now ?? (() => new Date()))().toISOString(),
  });
}
