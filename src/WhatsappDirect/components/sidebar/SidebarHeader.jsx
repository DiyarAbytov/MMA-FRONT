// import React from "react";

// const SidebarHeader = ({ onRefresh }) => (
//   <div className="wa-sidebar__top">
//     <div className="wa-sidebar__title">Чаты</div>
//     <div className="wa-sidebar__actions">
//       <button
//         type="button"
//         className="wa-sidebar__refresh"
//         onClick={onRefresh}
//         title="Обновить список чатов"
//       >
//         ⟳
//       </button>
//       <div className="wa-sidebar__status">Авторизован</div>
//     </div>
//   </div>
// );

// export default SidebarHeader;


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
