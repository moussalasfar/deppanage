import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isSupabaseAuthConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { advanceIntervention } from "@/modules/interventions/application/advance-intervention";
import { supabaseInterventionRepository } from "@/modules/interventions/infrastructure/supabase-intervention-repository";

type StatusRouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: StatusRouteContext) {
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
    const body = await request.json();
    const status = await advanceIntervention(
      user.id,
      id,
      body.status,
      supabaseInterventionRepository,
    );
    return NextResponse.json({ data: { status } });
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Etat invalide." } },
        { status: 422 },
      );
    }
    if (
      error instanceof Error &&
      (error.message.includes("INTERVENTION_NOT_AVAILABLE") ||
        error.message.includes("INVALID_INTERVENTION_TRANSITION"))
    ) {
      return NextResponse.json(
        {
          error: {
            code: "TRANSITION_REJECTED",
            message: "Cette intervention a deja change d'etat.",
          },
        },
        { status: 409 },
      );
    }

    console.error("intervention_transition_failed", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "L'etat ne peut pas etre modifie pour le moment.",
        },
      },
      { status: 500 },
    );
  }
}
