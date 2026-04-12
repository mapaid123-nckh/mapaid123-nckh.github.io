import React from "react";

export default function Card({ title, button, onClick }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="red-icon"></div>
        <h3>{title}</h3>
      </div>

      <div className="card-content">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>

      <button className="blue-btn" onClick={onClick}>
        {button}
      </button>
    </div>
  );
}
