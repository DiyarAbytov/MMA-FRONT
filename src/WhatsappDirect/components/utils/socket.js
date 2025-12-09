// // один общий socket для всего WhatsApp-модуля
// import { io } from "socket.io-client";

// export const socket = io("http://localhost:3001"); // на VPS заменишь хост
// // export const socket = io("http://eva.adam247.webtm.ru"); // на VPS заменишь хост



import { io } from "socket.io-client";
import { WHATSAPP_SOCKET_URL } from "../../config/whatsappConfig";

export const socket = io(WHATSAPP_SOCKET_URL);
