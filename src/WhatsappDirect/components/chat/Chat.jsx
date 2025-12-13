// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { api } from "../../api/whatsappApi";
// import "./whatsapp-chat.scss";

// const pad2 = (n) => (n < 10 ? "0" + n : "" + n);
// const formatTime = (ts) => {
//   if (!ts) return "";
//   const d = new Date(ts);
//   if (Number.isNaN(d.getTime())) return "";
//   return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
// };

// const Chat = ({ chatId }) => {
//   const [messages, setMessages] = useState([]);
//   const [text, setText] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [loadingMore, setLoadingMore] = useState(false);

//   const [search, setSearch] = useState("");
//   const pollRef = useRef(null);
//   const scrollerRef = useRef(null);

//   // ✅ FIX: refs чтобы interval всегда видел актуальные значения
//   const chatIdRef = useRef(null);
//   const lastTsRef = useRef(0);

//   const lastTs = messages.length ? messages[messages.length - 1].timestamp : 0;
//   const oldestTs = messages.length ? messages[0].timestamp : 0;

//   // ✅ обновляем refs при изменениях
//   useEffect(() => {
//     chatIdRef.current = chatId || null;
//   }, [chatId]);

//   useEffect(() => {
//     lastTsRef.current = lastTs || 0;
//   }, [lastTs]);

//   const scrollToBottom = () => {
//     const el = scrollerRef.current;
//     if (!el) return;
//     el.scrollTop = el.scrollHeight;
//   };

//   const loadLatest = async (id) => {
//     if (!id) return;
//     try {
//       setLoading(true);
//       const r = await api.get(`/messages/${encodeURIComponent(id)}?limit=15`);
//       const arr = Array.isArray(r.data) ? r.data : [];
//       setMessages(arr);
//       setTimeout(scrollToBottom, 0);
//     } catch {
//       setMessages([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadMore = async () => {
//     if (!chatId || !oldestTs || loadingMore) return;
//     try {
//       setLoadingMore(true);
//       const r = await api.get(
//         `/messages/${encodeURIComponent(chatId)}?before=${encodeURIComponent(oldestTs)}&limit=15`
//       );
//       const arr = Array.isArray(r.data) ? r.data : [];
//       if (!arr.length) return;

//       setMessages((prev) => {
//         const seen = new Set(prev.map((m) => m.id));
//         const add = arr.filter((m) => !seen.has(m.id));
//         return [...add, ...prev];
//       });
//     } catch {
//       // тихо
//     } finally {
//       setLoadingMore(false);
//     }
//   };

//   // ✅ FIX: pollNew читает chatId/lastTs только из ref (иначе stale closure)
//   const pollNew = async () => {
//     const cid = chatIdRef.current;
//     if (!cid) return;

//     const currentLastTs = lastTsRef.current || 0;

//     try {
//       if (currentLastTs > 0) {
//         const r = await api.get(
//           `/messages/${encodeURIComponent(cid)}?after=${encodeURIComponent(currentLastTs)}`
//         );
//         const arr = Array.isArray(r.data) ? r.data : [];
//         if (!arr.length) return;

//         setMessages((prev) => {
//           const seen = new Set(prev.map((m) => m.id));
//           const add = arr.filter((m) => !seen.has(m.id));
//           if (!add.length) return prev;
//           return [...prev, ...add];
//         });
//       } else {
//         const r = await api.get(`/messages/${encodeURIComponent(cid)}?limit=15`);
//         const arr = Array.isArray(r.data) ? r.data : [];
//         if (!arr.length) return;

//         setMessages((prev) => {
//           if (!prev.length) return arr;
//           const seen = new Set(prev.map((m) => m.id));
//           const add = arr.filter((m) => !seen.has(m.id));
//           if (!add.length) return prev;
//           return [...prev, ...add].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
//         });
//       }

//       const el = scrollerRef.current;
//       if (el) {
//         const nearBottom = el.scrollHeight - (el.scrollTop + el.clientHeight) < 120;
//         if (nearBottom) setTimeout(scrollToBottom, 0);
//       }
//     } catch {
//       // тихо
//     }
//   };

//   useEffect(() => {
//     setMessages([]);
//     setText("");
//     setSearch("");

//     if (pollRef.current) clearInterval(pollRef.current);
//     if (!chatId) return;

//     loadLatest(chatId);

//     pollRef.current = setInterval(pollNew, 3000); // 3 сек норм
//     return () => {
//       if (pollRef.current) clearInterval(pollRef.current);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [chatId]);

//   const filteredMessages = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return messages;
//     return messages.filter((m) => (m.text || "").toLowerCase().includes(q));
//   }, [messages, search]);

//   const send = async () => {
//     if (!chatId) return;
//     const trimmed = text.trim();
//     if (!trimmed) return;

//     try {
//       const r = await api.post("/send", { chatId, text: trimmed });
//       const msg = r.data;

//       setMessages((prev) => {
//         const seen = new Set(prev.map((m) => m.id));
//         if (msg?.id && seen.has(msg.id)) return prev;
//         return [...prev, msg].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
//       });

//       setText("");
//       setTimeout(scrollToBottom, 0);
//     } catch {
//       // тихо
//     }
//   };

//   const onKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       send();
//     }
//   };

//   if (!chatId) {
//     return (
//       <div className="wa-chat wa-chat--empty">
//         <div className="wa-chat__empty">Выберите чат слева</div>
//       </div>
//     );
//   }

//   return (
//     <div className="wa-chat">
//       <div className="wa-chat__header">
//         <div className="wa-chat__header-left">
//           <div className="wa-chat__header-title">{chatId}</div>
//         </div>

//         <div className="wa-chat__header-right">
//           <input
//             className="wa-chat__search"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Поиск в чате"
//           />
//         </div>
//       </div>

//       <div className="wa-chat__body" ref={scrollerRef}>
//         <div className="wa-chat__loadmore-wrap">
//           <button
//             type="button"
//             className="wa-chat__loadmore"
//             onClick={loadMore}
//             disabled={loadingMore}
//           >
//             {loadingMore ? "Загрузка..." : "Загрузить ещё"}
//           </button>
//         </div>

//         {loading && <div className="wa-chat__hint">Загрузка...</div>}

//         {filteredMessages.map((m) => {
//           const mine = m.from === "me";
//           return (
//             <div
//               key={m.id + "_" + m.timestamp}
//               className={"wa-chat__msg " + (mine ? "wa-chat__msg--me" : "wa-chat__msg--client")}
//             >
//               <div className="wa-chat__bubble">
//                 {m.text && <div className="wa-chat__text">{m.text}</div>}
//                 <div className="wa-chat__meta">{formatTime(m.timestamp)}</div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <div className="wa-chat__input">
//         <textarea
//           className="wa-chat__textarea"
//           placeholder="Введите сообщение"
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           onKeyDown={onKeyDown}
//         />

//         <button
//           type="button"
//           className="wa-chat__send"
//           onClick={send}
//           disabled={!text.trim()}
//         >
//           ➤
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Chat;



import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../api/whatsappApi";
import "./whatsapp-chat.scss";

const pad2 = (n) => (n < 10 ? "0" + n : "" + n);
const formatTime = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

function mergeById(prev, incoming) {
  const map = new Map();

  for (const m of prev) {
    if (m?.id) map.set(m.id, m);
  }
  for (const m of incoming) {
    if (!m?.id) continue;
    const old = map.get(m.id);
    // берём более полную версию
    map.set(m.id, { ...(old || {}), ...m });
  }

  const arr = Array.from(map.values());
  arr.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  return arr;
}

const Chat = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [search, setSearch] = useState("");

  const pollRef = useRef(null);
  const scrollerRef = useRef(null);

  const chatIdRef = useRef(null);

  useEffect(() => {
    chatIdRef.current = chatId || null;
  }, [chatId]);

  const scrollToBottom = () => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  const oldestTs = messages.length ? messages[0].timestamp : 0;

  const loadLatest = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const r = await api.get(`/messages/${encodeURIComponent(id)}?limit=30`);
      const arr = Array.isArray(r.data) ? r.data : [];
      setMessages(arr);
      setTimeout(scrollToBottom, 0);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!chatId || !oldestTs || loadingMore) return;
    try {
      setLoadingMore(true);
      const r = await api.get(
        `/messages/${encodeURIComponent(chatId)}?before=${encodeURIComponent(oldestTs)}&limit=30`
      );
      const arr = Array.isArray(r.data) ? r.data : [];
      if (!arr.length) return;

      setMessages((prev) => mergeById(prev, arr));
    } catch {
      // тихо
    } finally {
      setLoadingMore(false);
    }
  };

  // ✅ железобетон: берём последние 30 и мерджим (dedupe по msgId)
  const pollLatest = async () => {
    const cid = chatIdRef.current;
    if (!cid) return;

    try {
      const r = await api.get(`/messages/${encodeURIComponent(cid)}?limit=30`);
      const arr = Array.isArray(r.data) ? r.data : [];
      if (!arr.length) return;

      const el = scrollerRef.current;
      const nearBottom = el
        ? el.scrollHeight - (el.scrollTop + el.clientHeight) < 140
        : true;

      setMessages((prev) => mergeById(prev, arr));

      if (nearBottom) setTimeout(scrollToBottom, 0);
    } catch {
      // тихо
    }
  };

  useEffect(() => {
    setMessages([]);
    setText("");
    setSearch("");

    if (pollRef.current) clearInterval(pollRef.current);
    if (!chatId) return;

    loadLatest(chatId);

    pollRef.current = setInterval(pollLatest, 2500);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  const filteredMessages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((m) => (m.text || "").toLowerCase().includes(q));
  }, [messages, search]);

  const send = async () => {
    if (!chatId) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      const r = await api.post("/send", { chatId, text: trimmed });
      const msg = r.data;

      setMessages((prev) => mergeById(prev, [msg]));
      setText("");
      setTimeout(scrollToBottom, 0);
    } catch {
      // тихо
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!chatId) {
    return (
      <div className="wa-chat wa-chat--empty">
        <div className="wa-chat__empty">Выберите чат слева</div>
      </div>
    );
  }

  return (
    <div className="wa-chat">
      <div className="wa-chat__header">
        <div className="wa-chat__header-left">
          <div className="wa-chat__header-title">{chatId}</div>
        </div>

        <div className="wa-chat__header-right">
          <input
            className="wa-chat__search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск в чате"
          />
        </div>
      </div>

      <div className="wa-chat__body" ref={scrollerRef}>
        <div className="wa-chat__loadmore-wrap">
          <button
            type="button"
            className="wa-chat__loadmore"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Загрузка..." : "Загрузить ещё"}
          </button>
        </div>

        {loading && <div className="wa-chat__hint">Загрузка...</div>}

        {filteredMessages.map((m) => {
          const mine = m.from === "me";
          return (
            <div
              key={m.id + "_" + m.timestamp}
              className={"wa-chat__msg " + (mine ? "wa-chat__msg--me" : "wa-chat__msg--client")}
            >
              <div className="wa-chat__bubble">
                {m.text && <div className="wa-chat__text">{m.text}</div>}
                <div className="wa-chat__meta">{formatTime(m.timestamp)}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="wa-chat__input">
        <textarea
          className="wa-chat__textarea"
          placeholder="Введите сообщение"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
        />

        <button
          type="button"
          className="wa-chat__send"
          onClick={send}
          disabled={!text.trim()}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default Chat;
