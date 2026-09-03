import { NextResponse } from "next/server";
import { readAnonymousSessionId } from "@/lib/server/anonymous-session";
import { isSupabaseAuthConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  authorizeRequestPublication,
  RequestPublicationForbiddenError,
} from "@/modules/requests/application/authorize-request-publication";
import {
  IncompleteRequestError,
  publishRequest,
  RequestAlreadyPublishedError,
} from "@/modules/requests/application/publish-request";
import { RequestDraftNotFoundError } from "@/modules/requests/application/set-request-location";
import { getRequestDraftRepository } from "@/modules/requests/infrastructure/request-draft-repository";
import { supabaseRequestPublicationOwnershipRepository } from "@/modules/requests/infrastructure/supabase-request-publication-ownership-repository";

type PublishRouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: PublishRouteContext) {
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json(
      {
        error: {
          code: "AUTH_UNAVAILABLE",
          message: "Connectez-vous avant de publier votre demande.",
        },
      },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHENTICATED",
          message: "Connectez-vous avant de publier votre demande.",
        },
      },
      { status: 401 },
    );
  }

  try {
    const ownerSessionId = readAnonymousSessionId(request);
    if (!ownerSessionId) {
      return notFoundResponse();
    }

    const { id } = await context.params;
    await authorizeRequestPublication(
      id,
      user.id,
      supabaseRequestPublicationOwnershipRepository,
    );
    const publishedRequest = await publishRequest(id, ownerSessionId, {
      repository: getRequestDraftRepository(),
    });

    return NextResponse.json({
      data: {
        id: publishedRequest.id,
        status: publishedRequest.status,
        publishedAt: publishedRequest.publishedAt,
      },
    });
  } catch (error) {
    if (error instanceof RequestPublicationForbiddenError) {
      return notFoundResponse();
    }
    if (error instanceof RequestDraftNotFoundError) {
      return notFoundResponse();
    }
    if (
      error instanceof IncompleteRequestError ||
      error instanceof RequestAlreadyPublishedError
    ) {
      return NextResponse.json(
        {
          error: {
            code:
              error instanceof IncompleteRequestError
                ? "INCOMPLETE_REQUEST"
                : "ALREADY_PUBLISHED",
            message:
              error instanceof IncompleteRequestError
                ? "Completez toutes les etapes avant de publier la demande."
                : "Cette demande a deja ete publiee.",
          },
        },
        { status: 409 },
      );
    }

    console.error("request_publication_failed", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "La demande ne peut pas etre publiee pour le moment.",
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
