import React from "react";
import unknownAvatar from "../img/unknown.png";
import { formatTime } from "../utils/dateUtils";
import { displayNameForDialog } from "../utils/chatUtils";

const SidebarItem = ({ dialog, isActive, onSelect, onContextMenu }) => {
  if (!dialog) return null;

  const title = displayNameForDialog(dialog);
  const time = dialog.lastTime ? formatTime(dialog.lastTime) : "";
  const preview = dialog.lastMessage || "";

  return (
    <button
      type="button"
      className={
        "whatsapp-sidebar__item" +
        (isActive ? " whatsapp-sidebar__item--active" : "")
      }
      onClick={() => onSelect && onSelect(dialog)}
      onContextMenu={(e) => onContextMenu && onContextMenu(e, dialog)}
    >
      <img src={unknownAvatar} className="whatsapp-sidebar__avatar" />

      <div className="whatsapp-sidebar__item-main">
        <div className="whatsapp-sidebar__item-header">
          <div className="whatsapp-sidebar__name">{title}</div>
          <div className="whatsapp-sidebar__time">{time}</div>
        </div>

        <div className="whatsapp-sidebar__item-bottom">
          <div className="whatsapp-sidebar__preview">{preview}</div>
        </div>
      </div>
    </button>
  );
};

export default SidebarItem;
