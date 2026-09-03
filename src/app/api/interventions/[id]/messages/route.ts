import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isSupabaseAuthConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendMessage } from "@/modules/messaging/application/send-message";
import { supabaseMessageRepository } from "@/modules/messaging/infrastructure/supabase-message-repository";

type MessageRouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: MessageRouteContext) {
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
    const message = await sendMessage(
      user.id,
      { interventionId: id, body: body.body },
      supabaseMessageRepository,
    );
    return NextResponse.json({ data: message }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Le message doit contenir entre 1 et 500 caracteres.",
          },
        },
        { status: 422 },
      );
    }
    if (
      error instanceof Error &&
      (error.message.includes("INTERVENTION_NOT_AVAILABLE") ||
        error.message.includes("INTERVENTION_CLOSED"))
    ) {
      return NextResponse.json(
        {
          error: {
            code: "MESSAGING_UNAVAILABLE",
            message: "Cette conversation est maintenant fermee.",
          },
        },
        { status: 409 },
      );
    }

    console.error("intervention_message_failed", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Le message ne peut pas etre envoye pour le moment.",
        },
      },
      { status: 500 },
    );
  }
}
