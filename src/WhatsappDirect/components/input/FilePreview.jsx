import React from "react";

const FilePreview = ({ file, onRemove }) => {
  if (!file) return null;

  return (
    <div className="wa-file">
      <span className="wa-file__name">{file.name}</span>
      <button
        type="button"
        className="wa-file__remove"
        onClick={onRemove}
      >
        ✕
      </button>
    </div>
  );
};

export default FilePreview;
