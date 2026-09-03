import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { MessageQueryRepository } from "../application/list-messages";
import type { MessageCommandRepository } from "../application/send-message";

export const supabaseMessageRepository: MessageQueryRepository &
  MessageCommandRepository = {
  async findByIntervention(interventionId) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("messages")
      .select("id, intervention_id, sender_id, sender_role, body, created_at")
      .eq("intervention_id", interventionId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });
    if (error) {
      throw error;
    }
    return data.map(toInterventionMessage);
  },

  async send(_senderId, interventionId, body) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("send_intervention_message", {
      p_intervention_id: interventionId,
      p_body: body,
    });
    if (error) {
      throw error;
    }
    return toInterventionMessage(data);
  },
};

function toInterventionMessage(message: {
  id: string;
  intervention_id: string;
  sender_id: string;
  sender_role: "client" | "provider";
  body: string;
  created_at: string;
}) {
  return {
    id: message.id,
    interventionId: message.intervention_id,
    senderId: message.sender_id,
    senderRole: message.sender_role,
    body: message.body,
    createdAt: message.created_at,
  };
}
