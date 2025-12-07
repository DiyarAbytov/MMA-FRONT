// import React from "react";

// const SidebarSearch = ({ value, onChange }) => (
//   <div className="wa-sidebar__search">
//     <input
//       placeholder="Поиск или новый чат"
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//     />
//   </div>
// );

// export default SidebarSearch;



import React from "react";

const SidebarSearch = ({ value, onChange }) => (
  <div className="whatsapp-sidebar__search">
    <input
      placeholder="Поиск или новый чат"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
);

export default SidebarSearch;
