import { NextResponse } from "next/server";
import { readAnonymousSessionId } from "@/lib/server/anonymous-session";
import { getRequestDraftRepository } from "@/modules/requests/infrastructure/request-draft-repository";

type RequestRouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RequestRouteContext) {
  const ownerSessionId = readAnonymousSessionId(request);
  if (!ownerSessionId) {
    return notFoundResponse();
  }

  const { id } = await context.params;
  const draft = await getRequestDraftRepository().findById(id, ownerSessionId);
  if (!draft) {
    return notFoundResponse();
  }

  return NextResponse.json({
    data: {
      id: draft.id,
      status: draft.status,
      service: draft.service,
      vehicle: draft.vehicle,
      location: draft.location,
      details: draft.details,
      photoCount: draft.photos.length,
      publishedAt: draft.publishedAt,
    },
  });
}

function notFoundResponse() {
  return NextResponse.json(
    { error: { code: "NOT_FOUND", message: "Demande introuvable." } },
    { status: 404 },
  );
}
