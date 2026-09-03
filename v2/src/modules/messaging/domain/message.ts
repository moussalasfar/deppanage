import { z } from "zod";

export const sendMessageSchema = z.object({
  interventionId: z.uuid(),
  body: z.string().trim().min(1).max(500),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export type InterventionMessage = SendMessageInput & {
  id: string;
  senderId: string;
  senderRole: "client" | "provider";
  createdAt: string;
};
