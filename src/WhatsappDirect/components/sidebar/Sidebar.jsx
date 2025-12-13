// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { api } from "../../api/whatsappApi";
// import "./whatsapp-sidebar.scss";

// const stripSuffix = (id = "") =>
//   id
//     .replace(/@c\.us$/i, "")
//     .replace(/@s\.whatsapp\.net$/i, "")
//     .replace(/@g\.us$/i, "");

// const formatPhone = (chatIdOrPhone = "") => {
//   const raw = stripSuffix(chatIdOrPhone).replace(/[^\d+]/g, "");
//   if (!raw) return "";
//   const digits = raw.startsWith("+") ? raw.slice(1) : raw;

//   if (digits.length === 12 && digits.startsWith("996")) {
//     return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(
//       6,
//       9
//     )} ${digits.slice(9)}`;
//   }

//   if (digits.length === 11) {
//     return `+${digits[0]} ${digits.slice(1, 4)} ${digits.slice(
//       4,
//       7
//     )} ${digits.slice(7)}`;
//   }

//   return raw.startsWith("+") ? raw : `+${digits}`;
// };

// const isTechnicalName = (name, chatId) => {
//   if (!name) return true;
//   if (name === chatId) return true;
//   return /@(c\.us|s\.whatsapp\.net|g\.us)$/i.test(name);
// };

// const displayName = (dialog) => {
//   if (!dialog) return "";
//   const name = dialog.name || "";
//   const chatId = dialog.chatId || "";
//   if (name && !isTechnicalName(name, chatId)) return name;
//   return formatPhone(chatId || name);
// };

// const pad2 = (n) => (n < 10 ? "0" + n : "" + n);
// const formatTime = (ts) => {
//   if (!ts) return "";
//   const d = new Date(ts);
//   if (Number.isNaN(d.getTime())) return "";
//   return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
// };

// const Sidebar = ({ activeChatId, onSelectChat }) => {
//   const [dialogs, setDialogs] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(false);

//   const pollRef = useRef(null);

//   const loadDialogs = async () => {
//     try {
//       setLoading(true);
//       const r = await api.get("/dialogs");
//       const arr = Array.isArray(r.data) ? r.data : [];
//       setDialogs(arr);
//     } catch {
//       // тихо
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadDialogs();

//     // мягкий пуллинг (без GreenAPI, только твой Node)
//     pollRef.current = setInterval(loadDialogs, 7000);
//     return () => clearInterval(pollRef.current);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return dialogs;

//     return dialogs.filter((d) => {
//       const title = displayName(d).toLowerCase();
//       const id = (d.chatId || "").toLowerCase();
//       const last = (d.lastMessage || "").toLowerCase();
//       return title.includes(q) || id.includes(q) || last.includes(q);
//     });
//   }, [dialogs, search]);

//   return (
//     <div className="wa-sidebar">
//       <div className="wa-sidebar__top">
//         <div className="wa-sidebar__title">Чаты</div>

//         <button
//           type="button"
//           className="wa-sidebar__refresh"
//           onClick={loadDialogs}
//           disabled={loading}
//           title="Обновить"
//         >
//           {loading ? "..." : "⟳"}
//         </button>
//       </div>

//       <div className="wa-sidebar__search">
//         <input
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           placeholder="Поиск"
//         />
//       </div>

//       <div className="wa-sidebar__list">
//         {filtered.map((d) => {
//           const isActive = d.chatId === activeChatId;
//           const title = displayName(d);
//           const time = d.lastTime ? formatTime(d.lastTime) : "";
//           const preview = d.lastMessage || "";

//           return (
//             <button
//               key={d.chatId}
//               type="button"
//               className={
//                 "wa-sidebar__item" + (isActive ? " wa-sidebar__item--active" : "")
//               }
//               onClick={() => onSelectChat && onSelectChat(d.chatId)}
//             >
//               <div className="wa-sidebar__avatar" />

//               <div className="wa-sidebar__item-main">
//                 <div className="wa-sidebar__row">
//                   <div className="wa-sidebar__name">{title}</div>
//                   <div className="wa-sidebar__time">{time}</div>
//                 </div>

//                 <div className="wa-sidebar__preview">{preview}</div>
//               </div>
//             </button>
//           );
//         })}

//         {!filtered.length && (
//           <div className="wa-sidebar__empty">Нет чатов</div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Sidebar;



import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../api/whatsappApi";
import "./whatsapp-sidebar.scss";

const stripSuffix = (id = "") =>
  id
    .replace(/@c\.us$/i, "")
    .replace(/@s\.whatsapp\.net$/i, "")
    .replace(/@g\.us$/i, "");

const formatPhone = (chatIdOrPhone = "") => {
  const raw = stripSuffix(chatIdOrPhone).replace(/[^\d+]/g, "");
  if (!raw) return "";
  const digits = raw.startsWith("+") ? raw.slice(1) : raw;

  if (digits.length === 12 && digits.startsWith("996")) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  if (digits.length === 11) {
    return `+${digits[0]} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return raw.startsWith("+") ? raw : `+${digits}`;
};

const isTechnicalName = (name, chatId) => {
  if (!name) return true;
  if (name === chatId) return true;
  return /@(c\.us|s\.whatsapp\.net|g\.us)$/i.test(name);
};

const displayName = (dialog) => {
  if (!dialog) return "";
  const name = dialog.name || "";
  const chatId = dialog.chatId || "";
  if (name && !isTechnicalName(name, chatId)) return name;
  return formatPhone(chatId || name);
};

const pad2 = (n) => (n < 10 ? "0" + n : "" + n);
const formatTime = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

const Sidebar = ({ activeChatId, onSelectChat }) => {
  const [dialogs, setDialogs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const pollRef = useRef(null);

  const loadDialogs = async () => {
    try {
      setLoading(true);
      const r = await api.get("/dialogs");
      const arr = Array.isArray(r.data) ? r.data : [];
      setDialogs(arr);
    } catch {
      // тихо
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDialogs();

    pollRef.current = setInterval(loadDialogs, 5000);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return dialogs;

    return dialogs.filter((d) => {
      const title = displayName(d).toLowerCase();
      const id = (d.chatId || "").toLowerCase();
      const last = (d.lastMessage || "").toLowerCase();
      return title.includes(q) || id.includes(q) || last.includes(q);
    });
  }, [dialogs, search]);

  return (
    <div className="wa-sidebar">
      <div className="wa-sidebar__top">
        <div className="wa-sidebar__title">Чаты</div>

        <button
          type="button"
          className="wa-sidebar__refresh"
          onClick={loadDialogs}
          disabled={loading}
          title="Обновить"
        >
          {loading ? "..." : "⟳"}
        </button>
      </div>

      <div className="wa-sidebar__search">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск" />
      </div>

      <div className="wa-sidebar__list">
        {filtered.map((d) => {
          const isActive = d.chatId === activeChatId;
          const title = displayName(d);
          const time = d.lastTime ? formatTime(d.lastTime) : "";
          const preview = d.lastMessage || "";

          return (
            <button
              key={d.chatId}
              type="button"
              className={"wa-sidebar__item" + (isActive ? " wa-sidebar__item--active" : "")}
              onClick={() => onSelectChat && onSelectChat(d.chatId)}
            >
              <div className="wa-sidebar__avatar" />

              <div className="wa-sidebar__item-main">
                <div className="wa-sidebar__row">
                  <div className="wa-sidebar__name">{title}</div>
                  <div className="wa-sidebar__time">{time}</div>
                </div>

                <div className="wa-sidebar__preview">{preview}</div>
              </div>
            </button>
          );
        })}

        {!filtered.length && <div className="wa-sidebar__empty">Нет чатов</div>}
      </div>
    </div>
  );
};

export default Sidebar;
