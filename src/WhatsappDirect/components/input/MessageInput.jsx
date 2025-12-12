// src/WhatsappDirect/input/MessageInput.jsx
import React, { useState } from "react";
import { FiPaperclip, FiSend } from "react-icons/fi";
import { api } from "../../api/whatsappApi";
import ReplyPreview from "./ReplyPreview";
import FilePreview from "./FilePreview";
import "./whatsapp-input.scss";

const MSG_EVENT = "wa:newMessage";      // для списка сообщений
const DIALOG_EVENT = "wa:lastMessage";  // для сайдбара

const MessageInput = ({ chatId, replyTo, clearReply }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const trimmed = text.trim();
  const canSend =
    Boolean(chatId) && (Boolean(trimmed) || Boolean(file));

  const resetState = () => {
    setText("");
    setFile(null);
    if (clearReply) clearReply();
  };

  const notifyFrontend = (chatId, msg) => {
    if (!chatId || !msg) return;
    window.dispatchEvent(
      new CustomEvent(MSG_EVENT, { detail: { chatId, message: msg } })
    );
    window.dispatchEvent(
      new CustomEvent(DIALOG_EVENT, { detail: { chatId, message: msg } })
    );
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
          headers: { "Content-Type": "multipart/form-data" },
        });

        // файлы в истории появятся при следующей загрузке,
        // превью подтянется через /dialogs, дублей не будет
        resetState();
        return;
      }

      const response = await api.post("/send", {
        chatId,
        text: trimmed,
        replyTo: replyTo
          ? { id: replyTo.id, text: replyTo.text, from: replyTo.from }
          : null,
      });

      const msg = response.data;
      notifyFrontend(chatId, msg);

      resetState();
    } catch (_e) {
      // можно повесить тост
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  const handleFileChange = (event) => {
    const selected =
      event.target.files && event.target.files[0];
    if (!selected) return;
    setFile(selected);
  };

  return (
    <div className="whatsapp-input">
      <ReplyPreview replyTo={replyTo} onClear={clearReply} />
      <FilePreview file={file} onRemove={() => setFile(null)} />

      <div className="whatsapp-input__row">
        <label className="whatsapp-input__icon-button whatsapp-input__icon-button--left">
          <FiPaperclip />
          <input
            type="file"
            className="whatsapp-input__attach-input"
            onChange={handleFileChange}
          />
        </label>

        <textarea
          className="whatsapp-input__textarea"
          placeholder="Введите сообщение"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          type="button"
          className={
            "whatsapp-input__icon-button whatsapp-input__icon-button--send" +
            (canSend ? "" : " whatsapp-input__icon-button--send-disabled")
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
