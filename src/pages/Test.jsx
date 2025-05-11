// src/pages/Test.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const shuffleArray = (array) => {
  let shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

const Test = ({ subjects }) => {
  const { subjectName, topicName } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testCompleted, setTestCompleted] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [isTestCancelled, setIsTestCancelled] = useState(false);

  useEffect(() => {
    const subject = subjects[subjectName];
    if (subject) {
      let allQuestions = [];
      if (topicName === "all") {
        allQuestions = subject.topics.flatMap((topic) => topic.questions);
      } else {
        const topic = subject.topics.find((t) => t.name === topicName);
        if (topic) {
          allQuestions = topic.questions;
        }
      }

      const shuffledQuestions = shuffleArray(allQuestions);
      setQuestions(shuffledQuestions);
    }
    setLoading(false);
  }, [subjectName, topicName, subjects]);

  const handleAnswer = (selectedAnswerIndex) => {
    if (!questions || !questions[currentQuestionIndex]) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswerIndex === currentQuestion.correct;

    // Обновляем или добавляем ответ
    const updatedAnswers = answeredQuestions.filter(
      (answer) => answer.questionIndex !== currentQuestionIndex
    );
    setAnsweredQuestions([
      ...updatedAnswers,
      { questionIndex: currentQuestionIndex, selectedAnswerIndex, isCorrect },
    ]);

    setIsAnswered(true);
    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      goToNextQuestion();
    } else {
      setShowExplanation(true);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
      updateAnswerState(currentQuestionIndex + 1);
    } else {
      setTestCompleted(true);
    }
  };

  const updateAnswerState = (index) => {
    const answer = answeredQuestions.find(
      (answer) => answer.questionIndex === index
    );
    setIsAnswered(!!answer);
    setIsAnswerCorrect(answer?.isCorrect ?? null);
  };

  const restartTest = () => {
    setAnsweredQuestions([]);
    setCurrentQuestionIndex(0);
    setTestCompleted(false);
    setShowExplanation(false);
    setIsAnswered(false);
    setIsAnswerCorrect(null);
    setIsTestCancelled(false);
  };

  const cancelTest = () => {
    const confirmCancel = window.confirm(
      "Вы уверены, что хотите завершить тест досрочно?"
    );
    if (confirmCancel) {
      setIsTestCancelled(true);
      setTestCompleted(true);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setShowExplanation(false);
    updateAnswerState(index);
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!questions || questions.length === 0) {
    return <div>Вопросы не найдены</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answeredQuestions.find(
    (answer) => answer.questionIndex === currentQuestionIndex
  );

  if (testCompleted || isTestCancelled) {
    const correctAnswers = answeredQuestions.filter(
      (answer) => answer.isCorrect
    ).length;
    const totalAnswers = answeredQuestions.length;
    const percentage = ((correctAnswers / totalAnswers) * 100).toFixed(2);

    return (
      <div>
        <p>Вы завершили тест!</p>
        <p>
          Вы ответили правильно на {correctAnswers} из {totalAnswers} вопросов.
        </p>
        <p>Ваш результат: {percentage}%</p>

        <div>
          <h3>Решенные вопросы:</h3>
          {answeredQuestions.map((answer, index) => {
            const question = questions[answer.questionIndex];
            return (
              <div key={index}>
                <p>
                  Вопрос {answer.questionIndex + 1}: {question.question} <br />
                  Ответ: {question.answers[question.correct]} (Правильный ответ)
                  <br />
                  Ваш ответ: {question.answers[answer.selectedAnswerIndex]}{" "}
                  <br />
                  {answer.isCorrect ? "Правильный" : "Неправильный"}
                </p>
              </div>
            );
          })}
        </div>

        <button onClick={restartTest}>Пройти тест заново</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>
        Тест по {subjectName} - {topicName}
      </h2>

      {/* Панель навигации по вопросам */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          margin: "20px 0",
          justifyContent: "center",
        }}
      >
        {questions.map((_, index) => {
          const answer = answeredQuestions.find(
            (answer) => answer.questionIndex === index
          );

          const squareStyle = {
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            border: "2px solid #333",
            backgroundColor: answer
              ? answer.isCorrect
                ? "#4CAF50"
                : "#F44336"
              : index === currentQuestionIndex
              ? "#2196F3"
              : "#fff",
            color: answer || index === currentQuestionIndex ? "#fff" : "#333",
            fontWeight: "bold",
            borderRadius: "5px",
            transition: "all 0.3s ease",
          };

          return (
            <div
              key={index}
              style={squareStyle}
              onClick={() => goToQuestion(index)}
              title={`Вопрос ${index + 1}`}
            >
              {index + 1}
            </div>
          );
        })}
      </div>

      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <p
          style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          Вопрос {currentQuestionIndex + 1} из {questions.length}
        </p>

        <p style={{ fontSize: "1.1rem", marginBottom: "20px" }}>
          {currentQuestion.question}
        </p>

        <ul style={{ listStyleType: "none", padding: 0 }}>
          {currentQuestion.answers.map((answer, index) => {
            // Определяем стиль для каждого варианта ответа
            let answerStyle = {
              padding: "12px",
              margin: "8px 0",
              width: "100%",
              textAlign: "left",
              cursor: isAnswered ? "not-allowed" : "pointer",
              border: "1px solid #ddd",
              borderRadius: "5px",
              backgroundColor: "#fff",
              transition: "all 0.3s ease",
            };

            // Если это правильный ответ и вопрос отвечен - зеленый
            if (currentAnswer && index === currentQuestion.correct) {
              answerStyle.backgroundColor = "#e8f5e9";
              answerStyle.border = "1px solid #4CAF50";
            }

            // Если это выбранный ответ (и он неправильный) - красный
            if (
              currentAnswer &&
              currentAnswer.selectedAnswerIndex === index &&
              !currentAnswer.isCorrect
            ) {
              answerStyle.backgroundColor = "#ffebee";
              answerStyle.border = "1px solid #F44336";
            }

            return (
              <li key={index} style={{ margin: "5px 0" }}>
                <button
                  onClick={() => handleAnswer(index)}
                  disabled={isAnswered}
                  style={answerStyle}
                >
                  {answer}
                </button>
              </li>
            );
          })}
        </ul>

        {showExplanation && currentQuestion.explanation && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#e3f2fd",
              borderRadius: "5px",
              borderLeft: "4px solid #2196F3",
            }}
          >
            <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
              Объяснение:
            </p>
            <p>{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        {isAnswered && (
          <button
            onClick={goToNextQuestion}
            style={{
              padding: "10px 25px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Следующий вопрос
          </button>
        )}

        <button
          onClick={cancelTest}
          style={{
            padding: "10px 25px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Завершить тест
        </button>
      </div>
    </div>
  );
};

export default Test;
