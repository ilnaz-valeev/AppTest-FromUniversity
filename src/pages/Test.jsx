import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/Test.min.css";

const Test = ({ subjects }) => {
  const { subjectName, topicName } = useParams();
  const navigate = useNavigate();

  // Состояние темы
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode
      ? JSON.parse(savedMode)
      : window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Состояния теста
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testCompleted, setTestCompleted] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [fillBlankAnswer, setFillBlankAnswer] = useState("");
  const [matchingAnswers, setMatchingAnswers] = useState({});
  const [sequenceOrder, setSequenceOrder] = useState([]);
  const questionsPerPage = 5;

  // Применение темы
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Загрузка вопросов
  useEffect(() => {
    const subject = subjects[subjectName];
    if (subject) {
      let questions = [];
      if (topicName === "all") {
        questions = subject.topics.flatMap((topic) => topic.questions);
      } else {
        const topic = subject.topics.find((t) => t.name === topicName);
        if (topic) questions = topic.questions;
      }
      const shuffled = shuffleArray(questions);
      setAllQuestions(shuffled);
      setCurrentQuestions(shuffled.slice(0, questionsPerPage));
      setLoading(false);
    }
  }, [subjectName, topicName, subjects]);

  // Инициализация порядка элементов для вопроса на последовательность
  useEffect(() => {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    const answered = answeredQuestions.find(
      (q) => q.questionIndex === currentQuestionIndex
    );

    if (answered) {
      setIsAnswered(true);
      setIsAnswerCorrect(answered.isCorrect);
      setShowExplanation(!answered.isCorrect && currentQuestion.explanation);

      switch (currentQuestion.type || "single") {
        case "multiple":
          setSelectedOptions(answered.selectedAnswer);
          break;
        case "fill_blank":
          setFillBlankAnswer(answered.selectedAnswer);
          break;
        case "matching":
          setMatchingAnswers(answered.selectedAnswer);
          break;
        case "sequence":
          setSequenceOrder(
            answered.selectedAnswer.map((id) => ({
              id,
              text: currentQuestion.answers[id],
            }))
          );
          break;
        default:
          setSelectedOptions([answered.selectedAnswer]);
      }
    } else {
      // Сброс только для новых вопросов
      if (currentQuestionIndex >= answeredQuestions.length) {
        setSelectedOptions([]);
        setFillBlankAnswer("");
        setMatchingAnswers({});
        if (currentQuestion.type === "sequence") {
          setSequenceOrder(
            currentQuestion.answers.map((text, id) => ({ id, text }))
          );
        }
      }
    }
  }, [currentQuestionIndex, currentQuestions, answeredQuestions]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const moveSequenceItem = (fromIndex, toIndex) => {
    const newOrder = [...sequenceOrder];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    setSequenceOrder(newOrder);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const loadNextQuestions = () => {
    const nextPage = currentPage + 1;
    const startIndex = nextPage * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;

    if (startIndex < allQuestions.length) {
      setCurrentQuestions((prev) => [
        ...prev,
        ...allQuestions.slice(startIndex, endIndex),
      ]);
      setCurrentPage(nextPage);
    }
  };

  const handleAnswer = (selectedOption) => {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    let isCorrect = false;

    if (!currentQuestion.type || currentQuestion.type === "single") {
      isCorrect = selectedOption === currentQuestion.correct;
      setSelectedOptions([selectedOption]);
    } else {
      switch (currentQuestion.type) {
        case "multiple":
          isCorrect =
            JSON.stringify([...selectedOptions].sort()) ===
            JSON.stringify([...currentQuestion.correct].sort());
          break;
        case "fill_blank":
          isCorrect =
            fillBlankAnswer.trim().toLowerCase() ===
            currentQuestion.correct.trim().toLowerCase();
          break;
        case "matching":
          isCorrect =
            JSON.stringify(matchingAnswers) ===
            JSON.stringify(currentQuestion.correct);
          break;
        case "sequence":
          isCorrect =
            JSON.stringify(sequenceOrder.map((item) => item.id)) ===
            JSON.stringify(currentQuestion.correctSequence);
          break;
        default:
          isCorrect = selectedOptions[0] === currentQuestion.correct;
      }
    }

    setAnsweredQuestions([
      ...answeredQuestions,
      {
        questionIndex: currentQuestionIndex,
        selectedAnswer:
          currentQuestion.type === "multiple"
            ? selectedOptions
            : currentQuestion.type === "fill_blank"
            ? fillBlankAnswer
            : currentQuestion.type === "matching"
            ? matchingAnswers
            : currentQuestion.type === "sequence"
            ? sequenceOrder.map((item) => item.id)
            : selectedOption,
        isCorrect,
      },
    ]);

    setIsAnswered(true);
    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      setTimeout(goToNextQuestion, 1000);
    } else {
      setShowExplanation(true);
    }
  };

  const handleFillBlankChange = (e) => {
    setFillBlankAnswer(e.target.value);
  };

  const handleOptionSelect = (optionIndex) => {
    if (selectedOptions.includes(optionIndex)) {
      setSelectedOptions(
        selectedOptions.filter((item) => item !== optionIndex)
      );
    } else {
      setSelectedOptions([...selectedOptions, optionIndex]);
    }
  };

  const handleMatchingSelect = (leftItem, rightItem) => {
    setMatchingAnswers({
      ...matchingAnswers,
      [leftItem]: rightItem,
    });
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex + 1 < currentQuestions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if ((currentPage + 1) * questionsPerPage < allQuestions.length) {
      loadNextQuestions();
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setTestCompleted(true);
    }
    resetAnswerState();
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      resetAnswerState();
    }
  };

  const resetAnswerState = () => {
    // Теперь не сбрасывает выбранные ответы
    setShowExplanation(false);
    setIsAnswered(false);
    setIsAnswerCorrect(null);
  };

  const cancelTest = () => {
    if (window.confirm("Вы уверены, что хотите завершить тест досрочно?")) {
      const answered = allQuestions.filter((_, index) =>
        answeredQuestions.some((q) => q.questionIndex === index)
      );
      setCurrentQuestions(answered);
      setTestCompleted(true);
    }
  };

  const restartTest = () => {
    setCurrentQuestionIndex(0);
    setAnsweredQuestions([]);
    setTestCompleted(false);
    setCurrentPage(0);
    setCurrentQuestions(allQuestions.slice(0, questionsPerPage));
    resetAnswerState();
  };

  const returnToMain = () => {
    if (window.confirm("Вы уверены, что хотите прервать тест?")) {
      navigate("/");
    }
  };

  const SequenceList = ({ items, onMove }) => {
    const moveUp = (index) => {
      if (index > 0) onMove(index, index - 1);
    };

    const moveDown = (index) => {
      if (index < items.length - 1) onMove(index, index + 1);
    };

    return (
      <ul className="sequence-list">
        {items.map((item, index) => (
          <li key={index} className="sequence-item">
            <div className="sequence-controls">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0 || isAnswered}
                className="sequence-button"
              >
                ↑
              </button>
              <span className="sequence-number">{index + 1}</span>
              <button
                onClick={() => moveDown(index)}
                disabled={index === items.length - 1 || isAnswered}
                className="sequence-button"
              >
                ↓
              </button>
            </div>
            <span className="sequence-content">{item.text}</span>
          </li>
        ))}
      </ul>
    );
  };

  const renderQuestionContent = () => {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    if (!currentQuestion) return null;

    const questionType = currentQuestion.type || "single";

    switch (questionType) {
      case "multiple":
        return (
          <div className="multiple-choice">
            <p>Выберите один или несколько правильных ответов:</p>
            <ul className="answers-list">
              {currentQuestion.answers.map((answer, index) => (
                <li key={index}>
                  <label className="multiple-option">
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(index)}
                      onChange={() => handleOptionSelect(index)}
                      disabled={isAnswered}
                    />
                    <span>{answer}</span>
                  </label>
                </li>
              ))}
            </ul>
            <button
              className="submit-answer"
              onClick={() => handleAnswer()}
              disabled={isAnswered || selectedOptions.length === 0}
            >
              Ответить
            </button>
          </div>
        );

      case "fill_blank":
        return (
          <div className="fill-blank-container">
            <div className="fill-blank-input-container">
              <input
                type="text"
                value={fillBlankAnswer}
                onChange={handleFillBlankChange}
                disabled={isAnswered}
                placeholder="Введите ответ"
                className="fill-blank-input"
              />
              <button
                className="submit-fill-blank"
                onClick={() => handleAnswer()}
                disabled={isAnswered || !fillBlankAnswer.trim()}
              >
                Ответить
              </button>
            </div>
          </div>
        );

      case "matching":
        return (
          <div className="matching-question">
            <p>Установите соответствия:</p>
            <div className="matching-columns">
              <div className="matching-left">
                {currentQuestion.leftItems.map((item, index) => (
                  <div key={index} className="matching-item">
                    {item}
                  </div>
                ))}
              </div>
              <div className="matching-right">
                {currentQuestion.rightItems.map((item, index) => (
                  <div key={index} className="matching-item">
                    <select
                      value={
                        matchingAnswers[currentQuestion.leftItems[index]] || ""
                      }
                      onChange={(e) =>
                        handleMatchingSelect(
                          currentQuestion.leftItems[index],
                          e.target.value
                        )
                      }
                      disabled={isAnswered}
                    >
                      <option value="">Выберите соответствие</option>
                      {currentQuestion.rightItems.map((rightItem, idx) => (
                        <option key={idx} value={rightItem}>
                          {rightItem}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <button
              className="submit-answer"
              onClick={() => handleAnswer()}
              disabled={
                isAnswered ||
                Object.keys(matchingAnswers).length <
                  currentQuestion.leftItems.length
              }
            >
              Ответить
            </button>
          </div>
        );

      case "sequence":
        return (
          <div className="sequence-question">
            <p>Расставьте элементы в правильной последовательности:</p>
            <SequenceList items={sequenceOrder} onMove={moveSequenceItem} />
            <button
              className="submit-sequence"
              onClick={() => handleAnswer()}
              disabled={isAnswered}
            >
              Ответить
            </button>
          </div>
        );

      case "single":
      default:
        return (
          <ul className="answers-list">
            {currentQuestion.answers.map((answer, index) => {
              let buttonClass = "";
              if (isAnswered) {
                if (index === currentQuestion.correct) {
                  buttonClass = "correct-answer";
                } else if (selectedOptions[0] === index && !isAnswerCorrect) {
                  buttonClass = "incorrect-answer";
                }
              }

              return (
                <li key={index}>
                  <button
                    className={`answer-button ${buttonClass}`}
                    onClick={() => handleAnswer(index)}
                    disabled={isAnswered}
                  >
                    {answer}
                  </button>
                </li>
              );
            })}
          </ul>
        );
    }
  };

  const ResultsScreen = () => {
    const correctAnswers = answeredQuestions.filter((q) => q.isCorrect).length;
    const totalQuestions = answeredQuestions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    return (
      <div className="results-container">
        <h2>Тест завершен!</h2>
        <p className="score">
          Правильных ответов: {correctAnswers} из {totalQuestions} ({percentage}
          %)
        </p>

        <div className="detailed-results">
          <h3>Детализация:</h3>
          {answeredQuestions.map((answer, idx) => {
            const question = currentQuestions[answer.questionIndex];

            return (
              <div
                key={idx}
                className={`result-item ${
                  answer.isCorrect ? "correct" : "incorrect"
                }`}
              >
                <p>
                  <strong>Вопрос {answer.questionIndex + 1}:</strong>{" "}
                  {question.question}
                </p>
                {!answer.isCorrect && (
                  <>
                    <p className="correct-answer">
                      Правильный ответ:{" "}
                      {formatCorrectAnswer(question, answer.questionIndex)}
                    </p>
                    <p className="user-answer">
                      Ваш ответ:{" "}
                      {formatUserAnswer(
                        answer.selectedAnswer,
                        question.type,
                        answer.questionIndex
                      )}
                    </p>
                  </>
                )}
                {question.explanation && (
                  <p className="explanation">
                    Объяснение: {question.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="results-buttons">
          <button className="restart-button" onClick={restartTest}>
            Начать заново
          </button>
          <button className="home-button" onClick={returnToMain}>
            На главную
          </button>
        </div>
      </div>
    );
  };

  const formatCorrectAnswer = (question, questionIndex) => {
    if (!question) {
      const q = allQuestions[questionIndex];
      if (!q) return "Вопрос не найден";
      question = q;
    }

    const questionType = question.type || "single";

    switch (questionType) {
      case "multiple":
        return question.correct.map((idx) => question.answers[idx]).join(", ");
      case "fill_blank":
        return question.correct;
      case "matching":
        return Object.entries(question.correct)
          .map(([left, right]) => `${left} → ${right}`)
          .join(", ");
      case "sequence":
        return question.correctSequence
          .map((idx) => question.answers[idx])
          .join(" → ");
      default:
        return question.answers[question.correct];
    }
  };

  const formatUserAnswer = (answer, type, questionIndex) => {
    if (!answer && answer !== 0) return "Нет ответа";

    const questionType = type || "single";
    const question =
      currentQuestions[questionIndex] || allQuestions[questionIndex];

    if (!question) return "Вопрос не найден";

    switch (questionType) {
      case "multiple":
        return answer.map((idx) => question.answers[idx]).join(", ");
      case "fill_blank":
        return answer;
      case "matching":
        return Object.entries(answer)
          .map(([left, right]) => `${left} → ${right}`)
          .join(", ");
      case "sequence":
        return answer.map((idx) => question.answers[idx]).join(" → ");
      default:
        return question.answers[answer];
    }
  };

  if (loading) return <div className="loading">Загрузка вопросов...</div>;
  if (!allQuestions.length)
    return <div className="no-questions">Вопросы не найдены</div>;
  if (testCompleted) return <ResultsScreen />;

  const currentQuestion = currentQuestions[currentQuestionIndex];

  return (
    <div className={`test-container ${darkMode ? "dark-theme" : ""}`}>
      <div className="header-container">
        <h2 className="test-title">
          Тест по {subjectName} {topicName !== "all" && `- ${topicName}`}
        </h2>
        <button
          className={`theme-toggle ${darkMode ? "dark" : "light"}`}
          onClick={toggleDarkMode}
          aria-label={
            darkMode
              ? "Переключить на светлую тему"
              : "Переключить на темную тему"
          }
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      <div className="progress-container">
        <div className="progress-text">
          Вопрос {currentQuestionIndex + 1} из {allQuestions.length}
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${
                ((currentQuestionIndex + 1) / allQuestions.length) * 100
              }%`,
            }}
          ></div>
        </div>
      </div>

      <div className="questions-navigation">
        {currentQuestions.map((_, index) => {
          const answer = answeredQuestions.find(
            (q) => q.questionIndex === index
          );
          let squareClass = "";
          if (answer) {
            squareClass = answer.isCorrect ? "correct" : "incorrect";
          } else if (index === currentQuestionIndex) {
            squareClass = "current";
          }
          return (
            <div
              key={index}
              className={`question-square ${squareClass}`}
              onClick={() => {
                if (
                  index <= currentQuestionIndex ||
                  answeredQuestions.some((q) => q.questionIndex === index)
                ) {
                  setCurrentQuestionIndex(index);
                  resetAnswerState();
                }
              }}
              title={`Вопрос ${index + 1}`}
            >
              {index + 1}
            </div>
          );
        })}
      </div>

      <div className="question-content">
        <h3 className="question-text">{currentQuestion.question}</h3>
        {renderQuestionContent()}

        {showExplanation && currentQuestion.explanation && (
          <div className="explanation-box">
            <p className="explanation-title">Объяснение:</p>
            <p>{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      <div className="navigation-container">
        <div className="question-navigation">
          {currentQuestionIndex > 0 && (
            <button
              className="nav-button prev-button"
              onClick={goToPreviousQuestion}
            >
              ◀ Назад
            </button>
          )}
          <button
            className={`nav-button next-button ${isAnswered ? "active" : ""}`}
            onClick={goToNextQuestion}
            disabled={!isAnswered}
          >
            {currentQuestionIndex + 1 === allQuestions.length
              ? "Завершить"
              : "Далее ▶"}
          </button>
        </div>

        <div className="control-buttons">
          <button className="control-button home-button" onClick={returnToMain}>
            🏠 Выбрать предмет
          </button>
          <button className="control-button cancel-button" onClick={cancelTest}>
            🏁 Завершить тест
          </button>
        </div>
      </div>
    </div>
  );
};

export default Test;
