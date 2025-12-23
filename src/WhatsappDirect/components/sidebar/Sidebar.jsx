import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { api } from "../../api/whatsappApi";
import axios from "axios";
import "./whatsapp-sidebar.scss";

// ====== Django leads API (заявки) ======
const LEADS_API = axios.create({
  baseURL: process.env.REACT_APP_LEADS_API_URL || "https://rasu0101.pythonanywhere.com",
});

// ====== helpers ======
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

// ключ для дедупа телефонов
const normalizePhoneKey = (raw) => {
  const d = String(raw || "").replace(/\D/g, "");
  if (!d) return "";

  // 0XXXXXXXXX -> 996XXXXXXXXX (КР)
  if (d.length === 10 && d.startsWith("0")) return "996" + d.slice(1);

  // XXXXXXXXX -> 996XXXXXXXXX (9 цифр)
  if (d.length === 9) return "996" + d;

  // уже норм
  if (d.length === 12 && d.startsWith("996")) return d;

  // что есть
  return d;
};

const extractPhoneKeyFromChatId = (chatId) => {
  const digits = String(stripSuffix(chatId || "")).replace(/\D/g, "");
  return normalizePhoneKey(digits);
};

const Sidebar = ({ activeChatId, onSelectChat }) => {
  const [dialogs, setDialogs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // context menu
  const [menu, setMenu] = useState({ open: false, x: 0, y: 0, chat: null });
  const menuRef = useRef(null);

  // polling dialogs
  const pollRef = useRef(null);

  // уже существующие телефоны в заявках
  const requestPhonesRef = useRef(new Set());

  const loadDialogs = useCallback(async () => {
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
  }, []);

  // грузим список заявок -> собираем телефоны (дедуп)
  useEffect(() => {
    const loadRequestPhones = async () => {
      try {
        const res = await LEADS_API.get("/api/requests/");
        const arr = Array.isArray(res.data) ? res.data : res.data?.results || [];
        const set = new Set();
        arr.forEach((r) => {
          const key = normalizePhoneKey(r?.phone);
          if (key) set.add(key);
        });
        requestPhonesRef.current = set;
      } catch (err) {
        // только ошибки
        console.error("Failed to load requests:", err?.response?.data || err?.message || err);
      }
    };
    loadRequestPhones();
  }, []);

  useEffect(() => {
    loadDialogs();
    pollRef.current = setInterval(loadDialogs, 5000);
    return () => clearInterval(pollRef.current);
  }, [loadDialogs]);

  // закрыть меню: клик вне / Esc
  useEffect(() => {
    const onDoc = (e) => {
      if (!menu.open) return;
      if (!menuRef.current?.contains(e.target)) setMenu({ open: false, x: 0, y: 0, chat: null });
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setMenu({ open: false, x: 0, y: 0, chat: null });
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [menu.open]);

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

  const hasRequestForChat = useCallback((chat) => {
    if (!chat?.chatId) return false;
    const key = extractPhoneKeyFromChatId(chat.chatId);
    if (!key) return false;
    return requestPhonesRef.current.has(key);
  }, []);

  const openMenu = useCallback((e, chat) => {
    e.preventDefault();

    // меню рядом, но не вылезает за экран
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mw = 240;
    const mh = 64;
    const pad = 8;

    const nx = Math.max(pad, Math.min(e.clientX, vw - mw - pad));
    const ny = Math.max(pad, Math.min(e.clientY, vh - mh - pad));

    setMenu({ open: true, x: nx, y: ny, chat });
  }, []);

  const sendToRequests = useCallback(async (chat) => {
    if (!chat?.chatId) {
      setMenu({ open: false, x: 0, y: 0, chat: null });
      return;
    }

    const key = extractPhoneKeyFromChatId(chat.chatId);
    if (!key) {
      console.error("Cannot parse phone from chatId:", chat.chatId);
      setMenu({ open: false, x: 0, y: 0, chat: null });
      return;
    }

    // дедуп: уже есть
    if (requestPhonesRef.current.has(key)) {
      setMenu({ open: false, x: 0, y: 0, chat: null });
      return;
    }

    const payload = {
      name: "whatsapp",      // по твоему требованию: на английском
      phone: `+${key}`,      // +996...
      channel: "whatsapp",
      status: "new",
    };

    try {
      await LEADS_API.post("/api/requests/", payload);
      requestPhonesRef.current.add(key);
    } catch (err) {
      console.error("Failed to create request:", err?.response?.data || err?.message || err);
    }

    setMenu({ open: false, x: 0, y: 0, chat: null });
  }, []);

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
          const disabled = hasRequestForChat(d);

          return (
            <button
              key={d.chatId}
              type="button"
              className={"wa-sidebar__item" + (isActive ? " wa-sidebar__item--active" : "")}
              onClick={() => onSelectChat && onSelectChat(d.chatId)}
              onContextMenu={(e) => openMenu(e, d)}
            >
              <div className="wa-sidebar__avatar" />

              <div className="wa-sidebar__item-main">
                <div className="wa-sidebar__row">
                  <div className="wa-sidebar__name">{title}</div>
                  <div className="wa-sidebar__time">{time}</div>
                </div>

                <div className="wa-sidebar__row2">
                  <div className="wa-sidebar__preview">{preview}</div>
                  {disabled ? <span className="wa-sidebar__badge">Lead</span> : <span />}
                </div>
              </div>
            </button>
          );
        })}

        {!filtered.length && <div className="wa-sidebar__empty">Нет чатов</div>}
      </div>

      {menu.open ? (
        <div
          ref={menuRef}
          className="wa-sidebar__menu"
          style={{ left: menu.x, top: menu.y }}
        >
          <button
            type="button"
            className="wa-sidebar__menu-item"
            onClick={() => sendToRequests(menu.chat)}
            disabled={hasRequestForChat(menu.chat)}
            title={
              hasRequestForChat(menu.chat)
                ? "This phone already exists in requests"
                : "Create a new request from this chat"
            }
          >
            {hasRequestForChat(menu.chat) ? "Already in requests" : "Send to request"}
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default Sidebar;
