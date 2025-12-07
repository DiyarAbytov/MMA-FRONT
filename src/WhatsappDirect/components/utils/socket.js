// один общий socket для всего WhatsApp-модуля
import { io } from "socket.io-client";

export const socket = io("http://localhost:3001"); // на VPS заменишь хост
// на VPS заменишь на "http://5.129.222.232:3001"
