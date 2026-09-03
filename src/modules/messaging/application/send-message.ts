import { z } from "zod";
import { sendMessageSchema, type InterventionMessage } from "../domain/message";

export interface MessageCommandRepository {
  send(
    senderId: string,
    interventionId: string,
    body: string,
  ): Promise<InterventionMessage>;
}

export async function sendMessage(
  senderId: string,
  input: unknown,
  repository: MessageCommandRepository,
) {
  const authenticatedSenderId = z.uuid().parse(senderId);
  const message = sendMessageSchema.parse(input);
  return repository.send(
    authenticatedSenderId,
    message.interventionId,
    message.body,
  );
}
