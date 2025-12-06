import { useState } from "react";
import { api } from "../api/whatsappApi";

export const MessageInput = ({ chatId }) => {
  const [text, setText] = useState("");

  const send = async () => {
    await api.post("/send", { chatId, text });
    setText("");
  };

  return (
    <div className="ws-input">
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={send}>Send</button>
    </div>
  );
};
