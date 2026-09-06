import ZiMessage from "@/components/zi/ZiMessage";

export default function ZiMessages({ messages, isThinking }) {
  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5" aria-live="polite">
      {messages.map((message) => (
        <ZiMessage
          key={message.id}
          role={message.role}
          tone={message.status === "error" ? "error" : "default"}
          isLoading={message.status === "streaming" && !message.text}
        >
          {message.text}
        </ZiMessage>
      ))}

      {isThinking ? (
        <ZiMessage role="zi" isLoading>
          Zi is thinking
        </ZiMessage>
      ) : null}
    </div>
  );
}
