import React, { useMemo, useState } from "react";
import useDialogs from "../hooks/useDialogs";
import SidebarHeader from "./SidebarHeader";
import SidebarSearch from "./SidebarSearch";
import SidebarList from "./SidebarList";

const Sidebar = ({ activeChatId, onSelect }) => {
  const { dialogs, refreshDialogs, markAsRead } = useDialogs();
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
    if (markAsRead) {
      markAsRead(dialog.chatId);
    }
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
