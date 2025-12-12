// src/WhatsappDirect/hooks/useMessages.js
import { useEffect, useRef, useState } from "react";
import { api } from "../../api/whatsappApi";

const MSG_EVENT = "wa:newMessage";      // для списка сообщений
const DIALOG_EVENT = "wa:lastMessage";  // для сайдбара

const useMessages = (chatId) => {
  const [messages, setMessages] = useState([]);
  const cacheRef = useRef({});

  // загрузка истории при смене чата
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    const cached = cacheRef.current[chatId];
    if (Array.isArray(cached)) {
      setMessages(cached);
    } else {
      setMessages([]);
    }

    let cancelled = false;

    const load = () => {
      api
        .get(`/messages/${chatId}`)
        .then((response) => {
          if (cancelled) return;
          const arr = Array.isArray(response.data) ? response.data : [];
          cacheRef.current[chatId] = arr;
          setMessages(arr);

          // 找им последнее МОЁ сообщение и говорим сайдбару
          if (arr.length) {
            const lastMy = [...arr].reverse().find((m) => m.from === "me");
            if (lastMy) {
              window.dispatchEvent(
                new CustomEvent(DIALOG_EVENT, {
                  detail: { chatId, message: lastMy },
                })
              );
            }
          }
        })
        .catch(() => {
          if (cancelled) return;
          setMessages([]);
        });
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [chatId]);

  // локальное добавление отправленных сообщений
  useEffect(() => {
    const handler = (event) => {
      const detail = event.detail || {};
      if (!detail.chatId || detail.chatId !== chatId) return;
      const msg = detail.message;
      if (!msg) return;

      setMessages((prev) => {
        const next = [...prev, msg];
        cacheRef.current[chatId] = next;
        return next;
      });
    };

    window.addEventListener(MSG_EVENT, handler);
    return () => window.removeEventListener(MSG_EVENT, handler);
  }, [chatId]);

  return messages;
};

export default useMessages;
