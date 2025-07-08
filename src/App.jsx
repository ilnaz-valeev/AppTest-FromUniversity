import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { subjects } from "./data/data";
import Home from "./pages/Home";
import Topics from "./pages/Topics";
import Test from "./pages/Test";

export const ThemeContext = React.createContext();

const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    document.body.className = darkMode ? "dark-theme" : "";
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/test/:subjectName"
            element={<Topics subjects={subjects} />}
          />
          <Route
            path="/test/:subjectName/:topicName"
            element={<Test subjects={subjects} />}
          />
        </Routes>
      </Router>
    </ThemeContext.Provider>
  );
};

export default App;
