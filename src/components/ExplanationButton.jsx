// ExplanationButton.js
import React from "react";

const ExplanationButton = ({ explanation, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{ position: "absolute", bottom: "10px", left: "10px" }}
    >
      ? Объяснение
    </button>
  );
};

export default ExplanationButton;
