import React, { useMemo, useState } from "react";
import useDialogs from "../hooks/useDialogs";
import SidebarHeader from "./SidebarHeader";
import SidebarSearch from "./SidebarSearch";
import SidebarList from "./SidebarList";
import { api } from "../../api/whatsappApi";

const Sidebar = ({ activeChatId, onSelect }) => {
  // ПЕРЕДАЁМ activeChatId в хук
  const { dialogs, refreshDialogs, markAsRead } = useDialogs(activeChatId);
  const [search, setSearch] = useState("");

  const filteredDialogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return dialogs;

    return dialogs.filter((dialog) => {
      const name = (dialog.name || "").toLowerCase();
      const phone = (dialog.phone || "").toLowerCase();
      const id = (dialog.chatId || "").toLowerCase();
      return (
        name.includes(query) || phone.includes(query) || id.includes(query)
      );
    });
  }, [dialogs, search]);

  const handleSelect = (dialog) => {
    if (!dialog || !dialog.chatId) return;

    // локально снимаем badge
    if (markAsRead) {
      markAsRead(dialog.chatId);
    }

    // дергаем бэкенд -> ReadChat
    api.post("/read-chat", { chatId: dialog.chatId }).catch(() => {});

    if (onSelect) {
      onSelect(dialog);
    }
  };

  return (
    <div className="whatsapp-sidebar">
      <SidebarHeader onRefresh={refreshDialogs} />
      <SidebarSearch value={search} onChange={setSearch} />
      <SidebarList
        dialogs={filteredDialogs}
        activeChatId={activeChatId}
        onSelect={handleSelect}
      />
    </div>
  );
};

export default Sidebar;
