"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { LoaderCircle, MessageSquareText, Send, WifiOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import type { InterventionMessage } from "../domain/message";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

export function MessagePanel({
  interventionId,
  currentUserId,
  initialMessages,
  isClosed,
}: {
  interventionId: string;
  currentUserId: string;
  initialMessages: InterventionMessage[];
  isClosed: boolean;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updateConnection() {
      setIsOnline(navigator.onLine);
    }

    updateConnection();
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
    };
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`intervention-messages:${interventionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `intervention_id=eq.${interventionId}`,
        },
        (payload) => {
          const message = fromRow(payload.new as MessageRow);
          setMessages((current) =>
            current.some((item) => item.id === message.id)
              ? current
              : [...current, message],
          );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [interventionId]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || isClosed || !isOnline) {
      return;
    }

    setError("");
    setIsSending(true);
    const response = await fetch(
      `/api/interventions/${interventionId}/messages`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      },
    ).catch(() => null);
    if (!response) {
      setError("Connexion interrompue. Reessayez.");
      setIsSending(false);
      return;
    }
    const result = await response.json();
    if (!response.ok) {
      setError(result.error?.message ?? "Le message ne peut pas etre envoye.");
      setIsSending(false);
      return;
    }

    const message = result.data as InterventionMessage;
    setMessages((current) =>
      current.some((item) => item.id === message.id)
        ? current
        : [...current, message],
    );
    setDraft("");
    setIsSending(false);
  }

  return (
    <section className="message-panel" aria-labelledby="messages-title">
      <header>
        <MessageSquareText aria-hidden="true" />
        <div>
          <h2 id="messages-title">Messages</h2>
          <p>Conversation privee avec votre interlocuteur</p>
        </div>
      </header>

      <div className="message-list" aria-live="polite">
        {messages.length ? (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            return (
              <article className={isOwn ? "own" : "other"} key={message.id}>
                <span>
                  {isOwn
                    ? "Vous"
                    : message.senderRole === "provider"
                      ? "Depanneur"
                      : "Client"}
                </span>
                <p>{message.body}</p>
                <time dateTime={message.createdAt}>
                  {new Intl.DateTimeFormat("fr-MA", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Africa/Casablanca",
                  }).format(new Date(message.createdAt))}
                </time>
              </article>
            );
          })
        ) : (
          <p className="message-empty">Aucun message pour le moment.</p>
        )}
        <div ref={listEndRef} />
      </div>

      {isClosed ? (
        <p className="message-closed">Cette conversation est fermee.</p>
      ) : (
        <>
          {!isOnline ? (
            <p className="message-offline" role="status">
              <WifiOff aria-hidden="true" /> Hors connexion. Votre brouillon est
              conserve.
            </p>
          ) : null}
          <form className="message-form" onSubmit={submit}>
            <label className="sr-only" htmlFor="message-body">
              Votre message
            </label>
            <div className="message-composer">
              <textarea
                aria-describedby="message-limit"
                id="message-body"
                maxLength={500}
                name="body"
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ecrivez un message..."
                required
                rows={2}
                value={draft}
              />
              <small id="message-limit">{draft.length}/500</small>
            </div>
            <button
              aria-label="Envoyer le message"
              disabled={isSending || !isOnline || !draft.trim()}
              title={isOnline ? "Envoyer" : "Envoi indisponible hors connexion"}
              type="submit"
            >
              {isSending ? (
                <LoaderCircle className="spinner" aria-hidden="true" />
              ) : (
                <Send aria-hidden="true" />
              )}
            </button>
          </form>
        </>
      )}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}

function fromRow(message: MessageRow): InterventionMessage {
  return {
    id: message.id,
    interventionId: message.intervention_id,
    senderId: message.sender_id,
    senderRole: message.sender_role,
    body: message.body,
    createdAt: message.created_at,
  };
}
