// import React from "react";

// const ReplyPreview = ({ replyTo, onClear }) => {
//   if (!replyTo) return null;

//   return (
//     <div className="wa-reply">
//       <div className="wa-reply__bar" />
//       <div className="wa-reply__content">
//         <div className="wa-reply__title">
//           {replyTo.from === "me" ? "Вы" : "Собеседник"}
//         </div>
//         <div className="wa-reply__text">{replyTo.text}</div>
//       </div>
//       <button
//         type="button"
//         className="wa-reply__close"
//         onClick={onClear}
//       >
//         ✕
//       </button>
//     </div>
//   );
// };

// export default ReplyPreview;



import React from "react";

const ReplyPreview = ({ replyTo, onClear }) => {
  if (!replyTo) return null;

  return (
    <div className="whatsapp-reply">
      <div className="whatsapp-reply__bar" />
      <div className="whatsapp-reply__content">
        <div className="whatsapp-reply__title">
          {replyTo.from === "me" ? "Вы" : "Собеседник"}
        </div>
        <div className="whatsapp-reply__text">{replyTo.text}</div>
      </div>
      <button
        type="button"
        className="whatsapp-reply__close"
        onClick={onClear}
      >
        ✕
      </button>
    </div>
  );
};

export default ReplyPreview;
