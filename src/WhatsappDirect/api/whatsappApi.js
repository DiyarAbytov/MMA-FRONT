// import axios from "axios";
// import { WHATSAPP_API_URL } from "../config/whatsappConfig";

// export const api = axios.create({
//   baseURL: WHATSAPP_API_URL,
// });


import axios from "axios";
import { WHATSAPP_API_URL } from "../config/whatsappConfig";

export const api = axios.create({
  baseURL: WHATSAPP_API_URL,
  timeout: 20000,
});
