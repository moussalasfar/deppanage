import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isSupabaseAuthConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { cancelIntervention } from "@/modules/interventions/application/cancel-intervention";
import { supabaseInterventionRepository } from "@/modules/interventions/infrastructure/supabase-intervention-repository";

type CancelRouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: CancelRouteContext) {
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
    const status = await cancelIntervention(
      user.id,
      id,
      body.reason,
      supabaseInterventionRepository,
    );
    return NextResponse.json({ data: { status } });
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Motif invalide." } },
        { status: 422 },
      );
    }
    if (
      error instanceof Error &&
      (error.message.includes("INTERVENTION_NOT_AVAILABLE") ||
        error.message.includes("INTERVENTION_ALREADY_CLOSED") ||
        error.message.includes("INVALID_CANCELLATION_REASON") ||
        error.message.includes("NO_SHOW_REQUIRES_ARRIVAL"))
    ) {
      return NextResponse.json(
        {
          error: {
            code: "CANCELLATION_REJECTED",
            message: "Cette intervention ne peut plus etre annulee ainsi.",
          },
        },
        { status: 409 },
      );
    }

    console.error("intervention_cancellation_failed", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "L'intervention ne peut pas etre annulee pour le moment.",
        },
      },
      { status: 500 },
    );
  }
}
