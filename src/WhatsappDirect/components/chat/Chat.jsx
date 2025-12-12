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

const Chat = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [search, setSearch] = useState("");
  const pollRef = useRef(null);
  const scrollerRef = useRef(null);

  const lastTs = messages.length ? messages[messages.length - 1].timestamp : 0;
  const oldestTs = messages.length ? messages[0].timestamp : 0;

  const scrollToBottom = () => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  const loadLatest = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const r = await api.get(`/messages/${encodeURIComponent(id)}?limit=15`);
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
        `/messages/${encodeURIComponent(chatId)}?before=${encodeURIComponent(
          oldestTs
        )}&limit=15`
      );
      const arr = Array.isArray(r.data) ? r.data : [];
      if (!arr.length) return;

      setMessages((prev) => {
        // добавляем сверху, без дублей по id
        const seen = new Set(prev.map((m) => m.id));
        const add = arr.filter((m) => !seen.has(m.id));
        return [...add, ...prev];
      });
    } catch {
      // тихо
    } finally {
      setLoadingMore(false);
    }
  };

  const pollNew = async () => {
    if (!chatId || !lastTs) return;
    try {
      const r = await api.get(
        `/messages/${encodeURIComponent(chatId)}?after=${encodeURIComponent(lastTs)}`
      );
      const arr = Array.isArray(r.data) ? r.data : [];
      if (!arr.length) return;

      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const add = arr.filter((m) => !seen.has(m.id));
        if (!add.length) return prev;
        return [...prev, ...add];
      });

      // если пользователь внизу — прокручиваем
      const el = scrollerRef.current;
      if (el) {
        const nearBottom = el.scrollHeight - (el.scrollTop + el.clientHeight) < 120;
        if (nearBottom) setTimeout(scrollToBottom, 0);
      }
    } catch {
      // тихо
    }
  };

  useEffect(() => {
    // сброс при смене чата
    setMessages([]);
    setText("");
    setSearch("");

    if (!chatId) return;

    loadLatest(chatId);

    // polling новых сообщений (без WS)
    pollRef.current = setInterval(pollNew, 5000);
    return () => clearInterval(pollRef.current);
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

      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        if (msg?.id && seen.has(msg.id)) return prev;
        return [...prev, msg];
      });

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
              className={
                "wa-chat__msg " + (mine ? "wa-chat__msg--me" : "wa-chat__msg--client")
              }
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
