// src/pages/Topics.js
import React from "react";
import { useParams, Link } from "react-router-dom";

const Topics = ({ subjects }) => {
  const { subjectName } = useParams(); // Извлекаем subjectName из URL
  const subject = subjects[subjectName]; // Находим предмет

  if (!subject) {
    return <div>Предмет не найден</div>;
  }

  return (
    <div>
      <h2>Выберите тему для теста по {subject.name}</h2>
      {subject.topics.map((topic, index) => (
        <Link key={index} to={`/test/${subjectName}/${topic.name}`}>
          <button>{topic.name}</button>
        </Link>
      ))}
      <Link to={`/test/${subjectName}/all`}>
        <button>Общий тест</button>
      </Link>
    </div>
  );
};

export default Topics;
