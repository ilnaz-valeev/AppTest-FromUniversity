import React, { useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { ThemeContext } from "../App";
import "../css/topic.min.css";

const Topics = ({ subjects }) => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { subjectName } = useParams();
  const subject = subjects[subjectName];

  if (!subject) {
    return (
      <div className={`topics-container ${darkMode ? "dark-theme" : ""}`}>
        <div className="not-found">Предмет не найден</div>
      </div>
    );
  }

  return (
    <div className={`topics-container ${darkMode ? "dark-theme" : ""}`}>
      <button onClick={toggleTheme} className="theme-toggle">
        <span className="icon">{darkMode ? "☀️" : "🌙"}</span>
        {darkMode ? "" : " "}
      </button>

      <h2>Выберите тему для теста по {subject.name}</h2>

      <div className="topics-list">


        {subject.topics.map((topic, index) => (
          <Link
            key={index}
            to={`/test/${subjectName}/${topic.name}`}
            className="topic-link"
          >
            <button className="topic-btn">{topic.name}</button>
          </Link>
        ))}
      </div>

      <Link to={`/test/${subjectName}/all`} className="all-test-btn">
        Общий тест (все темы)
      </Link>
    </div>
  );
};

export default Topics;
