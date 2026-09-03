import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { readAnonymousSessionId } from "@/lib/server/anonymous-session";
import {
  InvalidRequestPhotoError,
  RequestLocationRequiredError,
  setRequestDetails,
} from "@/modules/requests/application/set-request-details";
import { RequestDraftNotFoundError } from "@/modules/requests/application/set-request-location";
import { PublishedRequestCannotBeEditedError } from "@/modules/requests/domain/request-draft";
import { getRequestDraftRepository } from "@/modules/requests/infrastructure/request-draft-repository";

type DetailsRouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: DetailsRouteContext) {
  try {
    const ownerSessionId = readAnonymousSessionId(request);
    if (!ownerSessionId) {
      return notFoundResponse();
    }

    const formData = await request.formData();
    const photos = formData
      .getAll("photos")
      .filter((value): value is File => value instanceof File);
    const { id } = await context.params;
    const draft = await setRequestDetails(
      id,
      ownerSessionId,
      {
        description: formData.get("description"),
        urgency: formData.get("urgency"),
        safetyStatus: formData.get("safetyStatus"),
      },
      await Promise.all(
        photos.map(async (photo) => ({
          name: photo.name,
          type: photo.type,
          size: photo.size,
          bytes: new Uint8Array(await photo.arrayBuffer()),
        })),
      ),
      { repository: getRequestDraftRepository() },
    );

    return NextResponse.json({
      data: {
        id: draft.id,
        status: draft.status,
        photoCount: draft.photos.length,
      },
    });
  } catch (error) {
    if (error instanceof RequestDraftNotFoundError) {
      return notFoundResponse();
    }
    if (error instanceof PublishedRequestCannotBeEditedError) {
      return NextResponse.json(
        {
          error: {
            code: "ALREADY_PUBLISHED",
            message: "Une demande publiee ne peut plus etre modifiee.",
          },
        },
        { status: 409 },
      );
    }
    if (error instanceof RequestLocationRequiredError) {
      return NextResponse.json(
        {
          error: {
            code: "LOCATION_REQUIRED",
            message: "La localisation doit etre renseignee avant cette etape.",
          },
        },
        { status: 409 },
      );
    }
    if (
      error instanceof ZodError ||
      error instanceof InvalidRequestPhotoError
    ) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message:
              "Verifiez la description et les photos avant de continuer.",
          },
        },
        { status: 422 },
      );
    }

    console.error("request_details_update_failed", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message:
            "Les details ne peuvent pas etre enregistres pour le moment.",
        },
      },
      { status: 500 },
    );
  }
}

function notFoundResponse() {
  return NextResponse.json(
    { error: { code: "NOT_FOUND", message: "Demande introuvable." } },
    { status: 404 },
  );
}
