// src/WhatsappDirect/hooks/useDialogs.js
import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/whatsappApi";

const LS_KEY = "wa_dialogs_cache";
const DIALOG_EVENT = "wa:lastMessage"; // только для превью

const sortDialogs = (list) =>
  list.slice().sort((a, b) => (b.lastTime || 0) - (a.lastTime || 0));

export default function useDialogs(_activeChatId) {
  const [dialogs, setDialogs] = useState([]);

  // старт из localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setDialogs(sortDialogs(parsed));
      }
    } catch {
      // ignore
    }
  }, []);

  // /dialogs — берём только список чатов и имена,
  // lastMessage/lastTime не трогаем (их считаем сами)
  const refreshDialogs = useCallback(async () => {
    try {
      const r = await api.get("/dialogs");
      const arr = Array.isArray(r.data) ? r.data : [];

      setDialogs((prev) => {
        const prevMap = new Map(prev.map((d) => [d.chatId, d]));
        const seen = new Set();
        const merged = [];

        for (const d of arr) {
          if (!d || !d.chatId) continue;
          seen.add(d.chatId);
          const existing = prevMap.get(d.chatId);

          if (existing) {
            merged.push({
              ...existing,
              name: d.name || existing.name || d.chatId,
            });
          } else {
            merged.push({
              chatId: d.chatId,
              name: d.name || d.chatId,
              lastMessage: "",
              lastTime: 0,
            });
          }
        }

        // чаты, которых нет в ответе, сохраняем
        for (const d of prev) {
          if (!seen.has(d.chatId)) merged.push(d);
        }

        const sorted = sortDialogs(merged);
        try {
          localStorage.setItem(LS_KEY, JSON.stringify(sorted));
        } catch {
          // ignore
        }
        return sorted;
      });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshDialogs();
  }, [refreshDialogs]);

  // редкий пуллинг для появления новых чатов
  useEffect(() => {
    const id = setInterval(refreshDialogs, 20000);
    return () => clearInterval(id);
  }, [refreshDialogs]);

  // превью и время — только по МОИМ сообщениям
  useEffect(() => {
    const handler = (event) => {
      const detail = event.detail || {};
      const chatId = detail.chatId;
      const msg = detail.message;
      if (!chatId || !msg) return;
      if (msg.from !== "me") return; // игнорируем входящие

      const ts =
        typeof msg.timestamp === "number" ? msg.timestamp : Date.now();
      const text = (msg.text || "").trim();
      const preview = text || (msg.mediaUrl ? "[MEDIA]" : "");

      setDialogs((prev) => {
        const list = [...prev];
        let found = false;

        for (let i = 0; i < list.length; i++) {
          const d = list[i];
          if (d.chatId !== chatId) continue;

          found = true;
          const currentTime =
            typeof d.lastTime === "number" ? d.lastTime : 0;

          if (!currentTime || ts >= currentTime) {
            list[i] = {
              ...d,
              lastMessage: preview || d.lastMessage || "",
              lastTime: ts || d.lastTime || 0,
            };
          }
          break;
        }

        if (!found) {
          list.push({
            chatId,
            name: chatId,
            lastMessage: preview,
            lastTime: ts,
          });
        }

        const sorted = sortDialogs(list);
        try {
          localStorage.setItem(LS_KEY, JSON.stringify(sorted));
        } catch {
          // ignore
        }
        return sorted;
      });
    };

    window.addEventListener(DIALOG_EVENT, handler);
    return () => window.removeEventListener(DIALOG_EVENT, handler);
  }, []);

  return { dialogs, refreshDialogs };
}
