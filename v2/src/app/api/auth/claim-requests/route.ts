import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { readAnonymousSessionId } from "@/lib/server/anonymous-session";
import { isSupabaseAuthConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { claimSessionRequests } from "@/modules/requests/application/claim-session-requests";
import { supabaseRequestOwnershipRepository } from "@/modules/requests/infrastructure/supabase-request-ownership-repository";

export async function POST(request: Request) {
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json(
      {
        error: {
          code: "AUTH_UNAVAILABLE",
          message:
            "La connexion sera disponible lorsque Supabase sera configure.",
        },
      },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHENTICATED",
          message: "Votre session a expire. Connectez-vous de nouveau.",
        },
      },
      { status: 401 },
    );
  }

  const ownerSessionId = readAnonymousSessionId(request);
  if (!ownerSessionId) {
    return NextResponse.json({ data: { claimedCount: 0 } });
  }

  try {
    const claimedCount = await claimSessionRequests(
      ownerSessionId,
      user.id,
      supabaseRequestOwnershipRepository,
    );
    return NextResponse.json({ data: { claimedCount } });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_USER",
            message: "Le compte authentifie est invalide.",
          },
        },
        { status: 422 },
      );
    }

    console.error("request_claim_failed", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message:
            "Vos demandes ne peuvent pas etre rattachees pour le moment.",
        },
      },
      { status: 500 },
    );
  }
}
