import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createRequestDraft } from "@/modules/requests/application/create-request-draft";
import { getRequestDraftRepository } from "@/modules/requests/infrastructure/request-draft-repository";
import {
  anonymousSessionCookieName,
  readAnonymousSessionId,
} from "@/lib/server/anonymous-session";

export async function POST(request: Request) {
  try {
    const sessionId = readAnonymousSessionId(request);
    const ownerSessionId = sessionId ?? crypto.randomUUID();
    const draft = await createRequestDraft(
      await request.json(),
      ownerSessionId,
      { repository: getRequestDraftRepository() },
    );
    const response = NextResponse.json(
      { data: { id: draft.id, status: draft.status } },
      { status: 201 },
    );

    if (!sessionId) {
      response.cookies.set(anonymousSessionCookieName, ownerSessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Les informations du vehicule sont invalides.",
            fields: error.flatten().fieldErrors,
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

    console.error("request_draft_creation_failed", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "La demande ne peut pas etre enregistree pour le moment.",
        },
      },
      { status: 500 },
    );
  }
}
