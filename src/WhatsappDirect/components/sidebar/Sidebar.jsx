// // src/WhatsappDirect/sidebar/Sidebar.jsx
// import React, {
//   useMemo,
//   useState,
//   useRef,
//   useEffect,
//   useCallback,
// } from "react";
// import useDialogs from "../hooks/useDialogs";
// import SidebarHeader from "./SidebarHeader";
// import SidebarSearch from "./SidebarSearch";
// import SidebarList from "./SidebarList";
// import { api } from "../../api/whatsappApi";
// import axios from "axios";
// import "./whatsapp-sidebar.scss";

// const LEADS_API = axios.create({
//   baseURL: "https://rasu0101.pythonanywhere.com",
// });

// const normalizePhoneKey = (raw) => {
//   const d = String(raw || "").replace(/\D/g, "");
//   if (!d) return "";

//   if (d.length === 10 && d.startsWith("0")) {
//     return "996" + d.slice(1);
//   }
//   if (d.length === 9) {
//     return "996" + d;
//   }
//   if (d.length === 12 && d.startsWith("996")) {
//     return d;
//   }
//   return d;
// };

// const Sidebar = ({ activeChatId, onSelect }) => {
//   const { dialogs, refreshDialogs } = useDialogs(activeChatId);
//   const [search, setSearch] = useState("");

//   const [menu, setMenu] = useState({
//     open: false,
//     x: 0,
//     y: 0,
//     dialog: null,
//   });
//   const menuRef = useRef(null);

//   const requestPhonesRef = useRef(new Set());

//   const [notice, setNotice] = useState(null);

//   useEffect(() => {
//     if (!notice) return;
//     const id = setTimeout(() => setNotice(null), 3000);
//     return () => clearTimeout(id);
//   }, [notice]);

//   useEffect(() => {
//     const loadPhones = async () => {
//       try {
//         const res = await LEADS_API.get("/api/requests/");
//         const arr = Array.isArray(res.data)
//           ? res.data
//           : res.data?.results || [];
//         const set = new Set();
//         arr.forEach((r) => {
//           const key = normalizePhoneKey(r.phone);
//           if (key) set.add(key);
//         });
//         requestPhonesRef.current = set;
//       } catch {
//         // ignore
//       }
//     };
//     loadPhones();
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (!menu.open) return;
//       if (!menuRef.current || !menuRef.current.contains(e.target)) {
//         setMenu({ open: false, x: 0, y: 0, dialog: null });
//       }
//     };
//     const handleEsc = (e) => {
//       if (e.key === "Escape") {
//         setMenu({ open: false, x: 0, y: 0, dialog: null });
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     document.addEventListener("keydown", handleEsc);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//       document.removeEventListener("keydown", handleEsc);
//     };
//   }, [menu.open]);

//   const syncDialog = useCallback(
//     async (chatId) => {
//       if (!chatId) return;
//       try {
//         await api.get(`/poll-dialog/${encodeURIComponent(chatId)}`);
//         await refreshDialogs();
//       } catch {
//         // тихо
//       }
//     },
//     [refreshDialogs]
//   );

//   const filteredDialogs = useMemo(() => {
//     const query = search.trim().toLowerCase();
//     if (!query) return dialogs;

//     return dialogs.filter((dialog) => {
//       const name = (dialog.name || "").toLowerCase();
//       const phone = (dialog.phone || "").toLowerCase();
//       const id = (dialog.chatId || "").toLowerCase();
//       return name.includes(query) || phone.includes(query) || id.includes(query);
//     });
//   }, [dialogs, search]);

//   const handleSelect = (dialog) => {
//     if (!dialog || !dialog.chatId) return;

//     if (onSelect) onSelect(dialog);
//     syncDialog(dialog.chatId);
//   };

//   const handleContextMenu = (event, dialog) => {
//     event.preventDefault();
//     if (!dialog) return;

//     const vw = window.innerWidth;
//     const vh = window.innerHeight;
//     const mw = 200;
//     const mh = 60;
//     const pad = 8;

//     const x = Math.max(pad, Math.min(event.clientX, vw - mw - pad));
//     const y = Math.max(pad, Math.min(event.clientY, vh - mh - pad));

//     setMenu({ open: true, x, y, dialog });
//   };

//   const handleSendToRequests = async () => {
//     const dialog = menu.dialog;
//     if (!dialog) return;

//     const raw = dialog.phone || dialog.chatId || dialog.name || "";
//     const digits = String(raw).replace(/[^\d]/g, "");
//     const key = normalizePhoneKey(digits);

//     if (!key) {
//       setNotice({ type: "error", text: "Не удалось определить номер" });
//       setMenu({ open: false, x: 0, y: 0, dialog: null });
//       return;
//     }

//     if (requestPhonesRef.current.has(key)) {
//       setNotice({ type: "error", text: "Заявка уже существует" });
//       setMenu({ open: false, x: 0, y: 0, dialog: null });
//       return;
//     }

//     const phoneForBackend = "+" + key;
//     const payload = {
//       name: "whatsapp",
//       phone: phoneForBackend,
//       channel: "whatsapp",
//       status: "new",
//     };

//     try {
//       await LEADS_API.post("/api/requests/", payload);
//       requestPhonesRef.current.add(key);
//       setNotice({ type: "success", text: "Заявка создана" });
//     } catch {
//       setNotice({
//         type: "error",
//         text: "Ошибка при создании заявки",
//       });
//     }

//     setMenu({ open: false, x: 0, y: 0, dialog: null });
//   };

//   return (
//     <div className="whatsapp-sidebar">
//       <SidebarHeader onRefresh={refreshDialogs} />
//       <SidebarSearch value={search} onChange={setSearch} />

//       {notice && (
//         <div
//           className={
//             "whatsapp-sidebar__notice " +
//             (notice.type === "success"
//               ? "whatsapp-sidebar__notice--success"
//               : "whatsapp-sidebar__notice--error")
//           }
//         >
//           {notice.text}
//         </div>
//       )}

//       <SidebarList
//         dialogs={filteredDialogs}
//         activeChatId={activeChatId}
//         onSelect={handleSelect}
//         onContextMenu={handleContextMenu}
//       />

//       {menu.open && (
//         <div
//           ref={menuRef}
//           className="whatsapp-sidebar__menu"
//           style={{ left: menu.x, top: menu.y }}
//         >
//           <button
//             type="button"
//             className="whatsapp-sidebar__menu-item"
//             onClick={handleSendToRequests}
//           >
//             Отправить в заявки
//           </button>
//         </div>
//       )}
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
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(
      6,
      9
    )} ${digits.slice(9)}`;
  }

  if (digits.length === 11) {
    return `+${digits[0]} ${digits.slice(1, 4)} ${digits.slice(
      4,
      7
    )} ${digits.slice(7)}`;
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

    // мягкий пуллинг (без GreenAPI, только твой Node)
    pollRef.current = setInterval(loadDialogs, 20000);
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
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск"
        />
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
              className={
                "wa-sidebar__item" + (isActive ? " wa-sidebar__item--active" : "")
              }
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

        {!filtered.length && (
          <div className="wa-sidebar__empty">Нет чатов</div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
