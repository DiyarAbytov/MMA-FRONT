// src/WhatsappDirect/chat/ChatContextMenu.jsx
import React from "react";

const ChatContextMenu = ({ context, onReply, onClose }) => {
  if (!context) return null;

  const handleReply = (event) => {
    event.stopPropagation();
    if (onReply) {
      onReply(context.message);
    }
    onClose();
  };

  const handleCopy = async (event) => {
    event.stopPropagation();
    const text = context.message?.text || "";
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (_e) {
        // тихо игнорируем, если браузер не дал скопировать
      }
    }
    onClose();
  };

  return (
    <div
      className="wa-context"
      style={{
        top: context.y,
        left: context.x,
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="wa-context__item"
        onClick={handleReply}
      >
        Ответить
      </button>

      <button
        type="button"
        className="wa-context__item"
        onClick={handleCopy}
      >
        Скопировать
      </button>
    </div>
  );
};

export default ChatContextMenu;
