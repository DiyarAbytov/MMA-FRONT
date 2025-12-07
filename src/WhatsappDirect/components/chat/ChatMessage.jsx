import React from "react";
import { formatTime } from "../utils/dateUtils";

const ChatMessage = ({ message, onContextMenu }) => {
  const className =
    "wa-chat__msg wa-chat__msg--" +
    (message.from === "me" ? "me" : "client");

  const handleContextMenu = (event) => {
    event.preventDefault();
    onContextMenu(event, message);
  };

  const isImage =
    message.mediaUrl &&
    (message.mediaType === "imageMessage" ||
      message.mediaType === "image");

  const isVideo =
    message.mediaUrl &&
    (message.mediaType === "videoMessage" ||
      message.mediaType === "video");

  return (
    <div className={className} onContextMenu={handleContextMenu}>
      {message.replyTo && (
        <div className="wa-chat__reply">
          <div className="wa-chat__reply-author">
            {message.replyTo.from === "me" ? "Вы" : "Собеседник"}
          </div>
          <div className="wa-chat__reply-text">
            {message.replyTo.text}
          </div>
        </div>
      )}

      {isImage && (
        <img
          src={message.mediaUrl}
          alt=""
          className="wa-chat__media wa-chat__media--image"
        />
      )}

      {isVideo && (
        <video
          controls
          className="wa-chat__media wa-chat__media--video"
        >
          <source src={message.mediaUrl} />
        </video>
      )}

      {message.text && (
        <div className="wa-chat__msg-text">{message.text}</div>
      )}

      <span className="wa-chat__msg-time">
        {formatTime(message.timestamp)}
      </span>
    </div>
  );
};

export default ChatMessage;
