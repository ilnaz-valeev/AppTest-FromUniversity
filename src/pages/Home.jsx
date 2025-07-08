import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../App";
import "../css/home.min.css";

const Home = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  const subjects = [
    {
      name: "Микробиология",
      path: "/test/microbiology",
      description: "Изучение микроорганизмов, их строения и функций",
      icon: "🧫",
    },
    {
      name: "Биохимия",
      path: "/test/biochemistry",
      description: "Химические процессы в живых организмах",
      icon: "🧪",
    },
    {
      name: "Нормальная физиология",
      path: "/test/physiology",
      description: "Функции органов и систем",
      icon: "🧠",
    },
  ];

  return (
    <div className={`home-container ${darkMode ? "dark-theme" : ""}`}>
      <button onClick={toggleTheme} className="theme-toggle">
        <span className="icon">{darkMode ? "☀️" : "🌙"}</span>
        {darkMode ? "" : ""}
      </button>

      <h1>Выберите предмет для тестирования</h1>

      <div className="subjects-grid">
        {subjects.map((subject, index) => (
          <div key={index} className="subject-card">
            <Link to={subject.path} className="subject-link">
              <div className="subject-icon">{subject.icon}</div>
              <h2 className="subject-name">{subject.name}</h2>
              <p className="subject-description">{subject.description}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
