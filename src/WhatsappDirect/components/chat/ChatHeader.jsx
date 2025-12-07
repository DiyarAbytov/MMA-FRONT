import React from "react";
import { displayNameForDialog } from "../utils/chatUtils";
import { stripWhatsAppSuffix } from "../utils/chatUtils";

const ChatHeader = ({ dialog }) => {
  if (!dialog) {
    return (
      <div className="wa-chat-header">
        <div className="wa-chat-header__left">
          <div className="wa-chat-header__name">Выберите чат</div>
        </div>
      </div>
    );
  }

  const title = displayNameForDialog(dialog);
  const phone = stripWhatsAppSuffix(dialog.chatId || "");

  return (
    <div className="wa-chat-header">
      <div className="wa-chat-header__left">
        <div className="wa-chat-header__name">{title}</div>
        <div className="wa-chat-header__status">{phone}</div>
      </div>
      <div className="wa-chat-header__right" />
    </div>
  );
};

export default ChatHeader;
