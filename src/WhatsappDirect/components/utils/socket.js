// один общий socket для всего WhatsApp-модуля
import { io } from "socket.io-client";

// export const socket = io("http://localhost:3001"); // на VPS заменишь хост
export const socket = io("http://eva.adam247.webtm.ru/"); // на VPS заменишь хост
// на VPS заменишь на "http://eva.adam247.webtm.ru/"
