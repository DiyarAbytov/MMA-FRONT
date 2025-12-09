// // src/WhatsappDirect/hooks/useDialogs.js
// import { useCallback, useEffect, useState } from "react";
// import { api } from "../../api/whatsappApi";
// import { socket } from "../utils/socket";
// import { formatPhoneId } from "../utils/dateUtils";

// const LS_KEY = "wa_dialogs_cache";

// const sortDialogs = (list) =>
//   (Array.isArray(list) ? list : [])
//     .slice()
//     .sort((a, b) => (b.lastTime || 0) - (a.lastTime || 0));

// // приведение диалога к нормальному виду
// const normalizeDialog = (raw) => {
//   if (!raw || typeof raw !== "object") return null;
//   if (!raw.chatId) return null;

//   const chatId = String(raw.chatId);

//   // выкидываем 0@s.whatsapp.net
//   if (chatId.startsWith("0@")) return null;

//   const prettyPhone = formatPhoneId(chatId);
//   const rawName = raw.name || "";

//   const name =
//     !rawName ||
//     rawName === chatId ||
//     rawName.includes("@")
//       ? prettyPhone
//       : rawName;

//   const unread =
//     typeof raw.unread === "number" && raw.unread > 0 ? raw.unread : 0;

//   return {
//     chatId,
//     name,
//     phone: prettyPhone,
//     lastMessage: raw.lastMessage || "",
//     lastTime: raw.lastTime || null,
//     unread,
//   };
// };

// const loadInitialDialogs = () => {
//   try {
//     const raw = localStorage.getItem(LS_KEY);
//     if (!raw) return [];
//     const parsed = JSON.parse(raw);
//     if (!Array.isArray(parsed)) return [];
//     const normalized = parsed
//       .map(normalizeDialog)
//       .filter((d) => d && d.chatId);
//     return sortDialogs(normalized);
//   } catch (_e) {
//     return [];
//   }
// };

// const useDialogs = () => {
//   const [dialogs, setDialogs] = useState(loadInitialDialogs);

//   const updateDialogs = useCallback((updater) => {
//     setDialogs((prev) => {
//       const base = Array.isArray(prev) ? prev : [];
//       const next =
//         typeof updater === "function" ? updater(base) : updater || [];

//       const normalized = (Array.isArray(next) ? next : [])
//         .map(normalizeDialog)
//         .filter((d) => d && d.chatId);

//       const sorted = sortDialogs(normalized);

//       try {
//         localStorage.setItem(LS_KEY, JSON.stringify(sorted));
//       } catch (_e) {
//         // ignore
//       }

//       return sorted;
//     });
//   }, []);

//   const refreshDialogs = useCallback(async () => {
//     try {
//       const response = await api.get("/dialogs");
//       const data = Array.isArray(response.data) ? response.data : [];

//       const fromServer = data
//         .map((d) => ({
//           chatId: d.chatId || d.id,
//           name: d.name || d.chatName || d.id,
//           lastMessage: d.lastMessage,
//           lastTime: d.lastTime,
//           unread: d.unread,
//         }))
//         .map(normalizeDialog)
//         .filter((d) => d && d.chatId);

//       updateDialogs((prev) => {
//         const map = new Map();

//         (Array.isArray(prev) ? prev : []).forEach((d) => {
//           const nd = normalizeDialog(d);
//           if (nd) map.set(nd.chatId, nd);
//         });

//         fromServer.forEach((srv) => {
//           if (!srv) return;
//           const existing = map.get(srv.chatId);

//           if (!existing) {
//             map.set(srv.chatId, srv);
//             return;
//           }

//           const merged = {
//             ...existing,
//             ...srv,
//             lastTime: srv.lastTime || existing.lastTime,
//             lastMessage: srv.lastMessage || existing.lastMessage,
//             unread:
//               typeof srv.unread === "number" ? srv.unread : existing.unread,
//           };

//           map.set(srv.chatId, merged);
//         });

//         return Array.from(map.values());
//       });
//     } catch (_e) {
//       // остаёмся на кеше
//     }
//   }, [updateDialogs]);

//   // отметить чат прочитанным (только фронт; без бэка)
//   const markAsRead = useCallback(
//     (chatId) => {
//       if (!chatId) return;
//       updateDialogs((prev) =>
//         (Array.isArray(prev) ? prev : []).map((d) =>
//           d.chatId === chatId ? { ...d, unread: 0 } : d
//         )
//       );
//     },
//     [updateDialogs]
//   );

//   // первый запрос
//   useEffect(() => {
//     refreshDialogs();
//   }, [refreshDialogs]);

//   // живые обновления по сокету
//   useEffect(() => {
//     const handleDialogUpdated = (payload) => {
//       if (!payload) return;
//       const { chatId, lastMessage, lastTime, incrementUnread } = payload;
//       if (!chatId) return;

//       updateDialogs((prev) => {
//         const list = Array.isArray(prev) ? prev.slice() : [];
//         const index = list.findIndex((d) => d.chatId === chatId);

//         if (index === -1) {
//           const created = normalizeDialog({
//             chatId,
//             lastMessage: lastMessage || "",
//             lastTime: lastTime || Date.now(),
//             unread: incrementUnread ? 1 : 0,
//           });
//           if (!created) return list;
//           list.push(created);
//           return list;
//         }

//         const current = list[index];
//         const unreadBase =
//           typeof current.unread === "number" && current.unread > 0
//             ? current.unread
//             : 0;

//         const updated = {
//           ...current,
//           lastMessage:
//             typeof lastMessage === "string" && lastMessage
//               ? lastMessage
//               : current.lastMessage,
//           lastTime: lastTime || Date.now(),
//           unread: incrementUnread ? unreadBase + 1 : unreadBase,
//         };

//         list[index] = updated;
//         return list;
//       });
//     };

//     socket.on("dialogUpdated", handleDialogUpdated);
//     return () => socket.off("dialogUpdated", handleDialogUpdated);
//   }, [updateDialogs]);

//   return { dialogs, refreshDialogs, markAsRead };
// };

// export default useDialogs;




// src/WhatsappDirect/hooks/useDialogs.js
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../api/whatsappApi";
import { formatPhoneId } from "../utils/dateUtils";

const LS_KEY = "wa_dialogs_cache";
const LAST_IDS_KEY = "wa_last_ids";

const sortDialogs = (list) =>
  list.slice().sort((a, b) => (b.lastTime || 0) - (a.lastTime || 0));

const normalizeDialog = (raw) => {
  if (!raw || !raw.chatId) return null;

  const chatId = raw.chatId;
  const rawName = raw.name || "";
  const phone = formatPhoneId(chatId);
  const name =
    !rawName || rawName === chatId || rawName.includes("@")
      ? phone
      : rawName;

  return {
    chatId,
    name,
    phone,
    lastMessage: raw.lastMessage || "",
    lastTime: raw.lastTime || null,
    unread: raw.unread || 0,
  };
};

export default function useDialogs(activeChatId) {
  const [dialogs, setDialogs] = useState([]);
  const lastIdsRef = useRef(
    JSON.parse(localStorage.getItem(LAST_IDS_KEY) || "{}")
  );

  // начальная загрузка
  const refreshDialogs = useCallback(async () => {
    const r = await api.get("/dialogs");
    const data = (r.data || []).map(normalizeDialog).filter(Boolean);
    const sorted = sortDialogs(data);
    setDialogs(sorted);
    localStorage.setItem(LS_KEY, JSON.stringify(sorted));
  }, []);

  useEffect(() => {
    refreshDialogs();
  }, [refreshDialogs]);

  // ✅ ПРАВИЛЬНЫЙ POLLING БЕЗ НАКРУТКИ
  useEffect(() => {
    if (!dialogs.length) return;

    const id = setInterval(async () => {
      const updated = await Promise.all(
        dialogs.map(async (d) => {
          const r = await api.get(`/poll-dialog/${d.chatId}`);
          const last = r.data;
          if (!last) return d;

          const prevId = lastIdsRef.current[d.chatId];
          const isNew = prevId !== last.id;

          if (!isNew) return d;

          lastIdsRef.current[d.chatId] = last.id;
          localStorage.setItem(LAST_IDS_KEY, JSON.stringify(lastIdsRef.current));

          return {
            ...d,
            lastMessage: last.text,
            lastTime: last.timestamp,
            unread:
              last.from === "client" && d.chatId !== activeChatId
                ? d.unread + 1
                : d.unread,
          };
        })
      );

      setDialogs(sortDialogs(updated));
    }, 3000);

    return () => clearInterval(id);
  }, [dialogs, activeChatId]);

  // ✅ ReadChat (жёсткий сброс)
  const markAsRead = useCallback((chatId) => {
    setDialogs((prev) =>
      prev.map((d) =>
        d.chatId === chatId ? { ...d, unread: 0 } : d
      )
    );
    api.post("/read-chat", { chatId }).catch(() => {});
  }, []);

  return { dialogs, refreshDialogs, markAsRead };
}
