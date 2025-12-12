import React, { useState } from "react";
import Sidebar from "./sidebar/Sidebar";
import Chat from "./chat/Chat";
import "./whatsapp.scss";

const WhatsappModule = () => {
  const [activeChatId, setActiveChatId] = useState(null);

  return (
    <div className="whatsapp">
      <Sidebar activeChatId={activeChatId} onSelectChat={setActiveChatId} />

      <div className="whatsapp__main">
        <Chat chatId={activeChatId} />
      </div>
    </div>
  );
};

export default WhatsappModule;
