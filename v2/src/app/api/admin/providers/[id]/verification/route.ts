import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isSupabaseAuthConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  AdminAccessDeniedError,
  decideProviderVerification,
} from "@/modules/admin/application/manage-provider-verifications";
import { supabaseProviderVerificationRepository } from "@/modules/admin/infrastructure/supabase-provider-verification-repository";

type VerificationRouteContext = { params: Promise<{ id: string }> };

export async function PATCH(
  request: Request,
  context: VerificationRouteContext,
) {
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json(
      { error: { code: "AUTH_UNAVAILABLE", message: "Service indisponible." } },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Connectez-vous." } },
      { status: 401 },
    );
  }

  try {
    const { id } = await context.params;
    const status = await decideProviderVerification(
      user.id,
      id,
      await request.json(),
      supabaseProviderVerificationRepository,
    );
    return NextResponse.json({ data: { status } });
  } catch (error) {
    if (error instanceof AdminAccessDeniedError) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Acces refuse." } },
        { status: 403 },
      );
    }
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "La decision ou son motif est invalide.",
          },
        },
        { status: 422 },
      );
    }
    if (error instanceof Error && error.message === "PROVIDER_NOT_PENDING") {
      return NextResponse.json(
        {
          error: {
            code: "ALREADY_DECIDED",
            message: "Cette candidature a deja ete traitee.",
          },
        },
        { status: 409 },
      );
    }

    console.error("provider_verification_failed", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "La decision ne peut pas etre enregistree.",
        },
      },
      { status: 500 },
    );
  }
}
