import { useEffect, useState } from "react";
import { api } from "../api/whatsappApi";

export const useDialogs = () => {
  const [dialogs, setDialogs] = useState([]);

  useEffect(() => {
    api.get("/dialogs").then(r => setDialogs(r.data));
  }, []);

  return dialogs;
};
