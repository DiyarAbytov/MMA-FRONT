import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { ChatWindow } from "./components/ChatWindow";
import { MessageInput } from "./components/MessageInput";
import "./whatsapp.scss";

export default function WhatsappModule() {
  const [activeChat, setActiveChat] = useState(null);

  return (
    <div className="ws">
      <Sidebar onSelect={setActiveChat} />

      <div className="ws__content">
        <ChatWindow chatId={activeChat} />
        <MessageInput chatId={activeChat} />
      </div>
    </div>
  );
}
