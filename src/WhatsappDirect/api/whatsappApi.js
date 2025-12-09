import axios from "axios";

export const api = axios.create({
  // baseURL: "http://localhost:3001", // на VPS заменишь на http://5.129.222.232:3001
    baseURL: "http://eva.adam247.webtm.ru/", // на VPS заменишь на http://5.129.222.232:3001
});
