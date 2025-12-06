import { useDialogs } from "../hooks/useDialogs";

export const Sidebar = ({ onSelect }) => {
  const dialogs = useDialogs();

  return (
    <div className="ws-sidebar">
      {dialogs.map(d => (
        <div
          key={d.chatId}
          className="ws-sidebar__item"
          onClick={() => onSelect(d.chatId)}
        >
          {d.phone}
        </div>
      ))}
    </div>
  );
};
