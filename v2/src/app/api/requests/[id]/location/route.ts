import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { readAnonymousSessionId } from "@/lib/server/anonymous-session";
import { PublishedRequestCannotBeEditedError } from "@/modules/requests/domain/request-draft";
import {
  RequestDraftNotFoundError,
  setRequestLocation,
} from "@/modules/requests/application/set-request-location";
import { getRequestDraftRepository } from "@/modules/requests/infrastructure/request-draft-repository";

type LocationRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: LocationRouteContext) {
  try {
    const ownerSessionId = readAnonymousSessionId(request);
    if (!ownerSessionId) {
      return notFoundResponse();
    }

    const { id } = await context.params;
    const draft = await setRequestLocation(
      id,
      ownerSessionId,
      await request.json(),
      { repository: getRequestDraftRepository() },
    );

    return NextResponse.json({
      data: {
        id: draft.id,
        status: draft.status,
        locationSource: draft.location?.source,
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

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "La localisation indiquee est invalide.",
          },
        },
        { status: 422 },
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Requete invalide." } },
        { status: 400 },
      );
    }

    console.error("request_location_update_failed", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message:
            "La localisation ne peut pas etre enregistree pour le moment.",
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
