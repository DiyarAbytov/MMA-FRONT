import { useEffect, useState } from "react";
import { api } from "../api/whatsappApi";
import { io } from "socket.io-client";

const socket = io("http://5.129.222.232:3001");


export const useMessages = (chatId) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!chatId) return;

    api.get(`/messages/${chatId}`).then(r =>
      setMessages(r.data)
    );

    const handler = (data) => {
      if (data.chatId === chatId) {
        setMessages(prev => [...prev, data.message]);
      }
    };

    socket.on("new-message", handler);

    return () => socket.off("new-message", handler);
  }, [chatId]);

  return messages;
};
