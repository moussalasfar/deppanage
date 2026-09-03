import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isSupabaseAuthConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  ProviderAlreadyVerifiedError,
  submitProviderApplication,
} from "@/modules/providers/application/submit-provider-application";
import { supabaseProviderProfileRepository } from "@/modules/providers/infrastructure/supabase-provider-profile-repository";

export async function POST(request: Request) {
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json(
      {
        error: {
          code: "AUTH_UNAVAILABLE",
          message:
            "L'inscription sera disponible lorsque Supabase sera configure.",
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
          message: "Connectez-vous avant de deposer votre dossier.",
        },
      },
      { status: 401 },
    );
  }

  try {
    await submitProviderApplication(
      user.id,
      await request.json(),
      supabaseProviderProfileRepository,
    );
    return NextResponse.json({ data: { status: "pending" } });
  } catch (error) {
    if (error instanceof ProviderAlreadyVerifiedError) {
      return NextResponse.json(
        {
          error: {
            code: "ALREADY_VERIFIED",
            message: "Votre profil est deja verifie.",
          },
        },
        { status: 409 },
      );
    }
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Verifiez les informations de votre activite.",
          },
        },
        { status: 422 },
      );
    }

    console.error("provider_application_failed", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Votre dossier ne peut pas etre enregistre pour le moment.",
        },
      },
      { status: 500 },
    );
  }
}
