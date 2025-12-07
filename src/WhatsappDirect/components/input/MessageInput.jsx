import React, { useState } from "react";
import { FiPaperclip, FiSend } from "react-icons/fi";
import { api } from "../../api/whatsappApi";
import ReplyPreview from "./ReplyPreview";
import FilePreview from "./FilePreview";

const MessageInput = ({ chatId, replyTo, clearReply }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const trimmed = text.trim();
  const canSend = Boolean(chatId) && (Boolean(trimmed) || Boolean(file));

  const resetState = () => {
    setText("");
    setFile(null);
    if (clearReply) {
      clearReply();
    }
  };

  const send = async () => {
    if (!canSend) return;

    try {
      if (file) {
        const formData = new FormData();
        formData.append("chatId", chatId);
        formData.append("caption", trimmed);
        formData.append("file", file);

        await api.post("/send-file", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        resetState();
        return;
      }

      await api.post("/send", {
        chatId,
        text: trimmed,
        replyTo: replyTo
          ? { id: replyTo.id, text: replyTo.text, from: replyTo.from }
          : null,
      });

      resetState();
    } catch (error) {
      // здесь можно повесить тост с ошибкой, но в консоль лишнего не шлём
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  const handleFileChange = (event) => {
    const selected = event.target.files && event.target.files[0];
    if (!selected) return;
    setFile(selected);
  };

  return (
    <div className="wa-input">
      <ReplyPreview replyTo={replyTo} onClear={clearReply} />
      <FilePreview file={file} onRemove={() => setFile(null)} />

      <div className="wa-input__row">
        <label className="wa-input__icon-btn wa-input__icon-btn--left">
          <FiPaperclip />
          <input
            type="file"
            className="wa-input__attach-input"
            onChange={handleFileChange}
          />
        </label>

        <textarea
          className="wa-input__textarea"
          placeholder="Введите сообщение"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          type="button"
          className={
            "wa-input__icon-btn wa-input__icon-btn--send" +
            (canSend ? "" : " wa-input__icon-btn--send-disabled")
          }
          onClick={send}
          disabled={!canSend}
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
