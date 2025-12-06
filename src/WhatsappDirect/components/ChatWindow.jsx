import { useMessages } from "../hooks/useMessages";

export const ChatWindow = ({ chatId }) => {
  const messages = useMessages(chatId);

  return (
    <div className="ws-chat">
      {messages.map((m, i) => (
        <div
          key={i}
          className={`ws-chat__msg ws-chat__msg--${m.from}`}
        >
          {m.text}
        </div>
      ))}
    </div>
  );
};
