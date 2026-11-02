import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi";
import { api } from "../api/client";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const welcome = "Hi! I'm the portfolio assistant. Ask me about Dhiraj's experience, skills, or projects.";
const suggestions = [
  "What does Dhiraj specialize in?",
  "Tell me about a project",
  "How can I contact Dhiraj?",
];

export function PortfolioChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const nextId = useRef(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending, isOpen]);

  async function sendMessage(content: string) {
    const text = content.trim();
    if (!text || isSending) return;

    const userMessage: Message = { id: nextId.current++, role: "user", content: text };
    const history = [...messages, userMessage]
      .slice(-10)
      .map(({ role, content: message }) => ({ role, content: message }));

    setMessages((current) => [...current, userMessage]);
    setIsSending(true);
    setError("");

    try {
      const result = await api.askAssistant(history);
      setMessages((current) => [...current, { id: nextId.current++, role: "assistant", content: result.reply }]);
      setDraft("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The assistant could not respond. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(draft);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(draft);
    }
  }

  return (
    <div className="portfolio-chat">
      {isOpen && (
        <section className="chat-panel" role="dialog" aria-modal="false" aria-labelledby="chat-title">
          <header className="chat-header">
            <div className="chat-avatar" aria-hidden="true">DY</div>
            <div className="chat-heading">
              <h2 id="chat-title">Portfolio assistant</h2>
              <p>Ask about work, skills, and projects</p>
            </div>
            <button className="chat-icon-button" type="button" aria-label="Close assistant" onClick={() => setIsOpen(false)}>
              <FiX aria-hidden="true" />
            </button>
          </header>

          <div className="chat-messages" role="log" aria-label="Chat messages" aria-live="polite">
            <div className="chat-message assistant-message">{welcome}</div>
            {messages.map((message) => (
              <div className={`chat-message ${message.role}-message`} key={message.id}>{message.content}</div>
            ))}
            {messages.length === 0 && !isSending && (
              <div className="chat-suggestions" aria-label="Suggested questions">
                {suggestions.map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => void sendMessage(suggestion)}>{suggestion}</button>
                ))}
              </div>
            )}
            {isSending && <div className="chat-message assistant-message chat-typing" role="status">Thinking...</div>}
            {error && <p className="chat-error" role="alert">{error}</p>}
            <div ref={endRef} />
          </div>

          <form className="chat-composer" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              aria-label="Your message"
              placeholder="Ask a question..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={1000}
              rows={1}
              disabled={isSending}
            />
            <button className="chat-send-button" type="submit" aria-label="Send message" disabled={isSending || !draft.trim()}>
              <FiSend aria-hidden="true" />
            </button>
          </form>
        </section>
      )}

      <button
        className="chat-launcher"
        type="button"
        aria-label={isOpen ? "Close portfolio assistant" : "Open portfolio assistant"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
      >
        {isOpen ? <FiX aria-hidden="true" /> : <FiMessageCircle aria-hidden="true" />}
      </button>
    </div>
  );
}
