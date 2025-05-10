// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { subjects } from "./data/data"; // Импортируем данные из data.js
import Home from "./pages/Home"; // Главная страница
import Topics from "./pages/Topics"; // Страница выбора темы
import Test from "./pages/Test"; // Страница с тестом

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Главная страница */}
        <Route path="/" element={<Home />} />

        {/* Страница выбора темы */}
        <Route
          path="/test/:subjectName"
          element={<Topics subjects={subjects} />}
        />

        {/* Страница с тестом по теме */}
        <Route
          path="/test/:subjectName/:topicName"
          element={<Test subjects={subjects} />} // Передаем данные в Test через пропсы
        />
      </Routes>
    </Router>
  );
};

export default App;
