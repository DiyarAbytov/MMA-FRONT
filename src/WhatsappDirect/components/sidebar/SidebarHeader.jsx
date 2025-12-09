import React from "react";

const SidebarHeader = ({ onRefresh }) => (
  <div className="whatsapp-sidebar__top">
    <div className="whatsapp-sidebar__title">Чаты</div>
    <div className="whatsapp-sidebar__actions">
      <button
        type="button"
        className="whatsapp-sidebar__refresh"
        onClick={onRefresh}
        title="Обновить список чатов"
      >
        ⟳
      </button>
      <div className="whatsapp-sidebar__status">Авторизован</div>
    </div>
  </div>
);

export default SidebarHeader;
