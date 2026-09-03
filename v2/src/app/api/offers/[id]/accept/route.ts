import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isSupabaseAuthConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { acceptOffer } from "@/modules/offers/application/accept-offer";
import { supabaseClientOfferRepository } from "@/modules/offers/infrastructure/supabase-client-offer-repository";

type AcceptOfferRouteContext = { params: Promise<{ id: string }> };

export async function POST(
  _request: Request,
  context: AcceptOfferRouteContext,
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
    const intervention = await acceptOffer(
      user.id,
      id,
      supabaseClientOfferRepository,
    );
    return NextResponse.json({ data: intervention });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Offre invalide." } },
        { status: 422 },
      );
    }
    if (
      error instanceof Error &&
      (error.message.includes("OFFER_NOT_AVAILABLE") ||
        error.message.includes("OFFER_ALREADY_ACCEPTED"))
    ) {
      return NextResponse.json(
        {
          error: {
            code: "OFFER_NOT_AVAILABLE",
            message: "Cette offre n'est plus disponible.",
          },
        },
        { status: 409 },
      );
    }

    console.error("client_offer_acceptance_failed", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "L'offre ne peut pas etre acceptee pour le moment.",
        },
      },
      { status: 500 },
    );
  }
}
