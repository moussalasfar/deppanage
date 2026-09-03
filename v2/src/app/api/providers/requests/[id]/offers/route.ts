import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isSupabaseAuthConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { submitOffer } from "@/modules/offers/application/submit-offer";
import { supabaseOfferRepository } from "@/modules/offers/infrastructure/supabase-offer-repository";

type OfferRouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: OfferRouteContext) {
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json(
      {
        error: {
          code: "AUTH_UNAVAILABLE",
          message:
            "Les offres seront disponibles lorsque Supabase sera configure.",
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
          message: "Connectez-vous avant d'envoyer une offre.",
        },
      },
      { status: 401 },
    );
  }

  try {
    const { id } = await context.params;
    const offer = await submitOffer(
      user.id,
      { ...(await request.json()), requestId: id },
      supabaseOfferRepository,
    );
    return NextResponse.json({ data: offer });
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Verifiez le prix, le delai et votre message.",
          },
        },
        { status: 422 },
      );
    }
    if (
      error instanceof Error &&
      (error.message.includes("PROVIDER_NOT_VERIFIED") ||
        error.message.includes("REQUEST_NOT_ELIGIBLE"))
    ) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_ELIGIBLE",
            message: "Cette demande n'est plus disponible pour votre profil.",
          },
        },
        { status: 409 },
      );
    }

    console.error("provider_offer_failed", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Votre offre ne peut pas etre enregistree pour le moment.",
        },
      },
      { status: 500 },
    );
  }
}
