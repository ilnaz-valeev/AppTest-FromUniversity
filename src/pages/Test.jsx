// src/pages/Test.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../css/Test.min.css";

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
      <div className="results-container">
        <p>Вы завершили тест!</p>
        <p className="score">
          Вы ответили правильно на {correctAnswers} из {totalAnswers} вопросов.
          <br />
          Ваш результат: {percentage}%
        </p>

        <div className="question-review">
          <h3>Решенные вопросы:</h3>
          {answeredQuestions.map((answer, index) => {
            const question = questions[answer.questionIndex];
            return (
              <div key={index} className="review-item">
                <p>
                  <strong>Вопрос {answer.questionIndex + 1}:</strong>{" "}
                  {question.question}
                </p>
                <p className="correct-answer">
                  Правильный ответ: {question.answers[question.correct]}
                </p>
                {!answer.isCorrect && (
                  <p className="user-answer">
                    Ваш ответ: {question.answers[answer.selectedAnswerIndex]}
                  </p>
                )}
                <p>{answer.isCorrect ? "✓ Правильно" : "✗ Неправильно"}</p>
              </div>
            );
          })}
        </div>

        <button className="restart-button" onClick={restartTest}>
          Пройти тест заново
        </button>
      </div>
    );
  }

  return (
    <div className="test-container">
      <h2>
        Тест по {subjectName} - {topicName}
      </h2>

      <div className="questions-navigation">
        {questions.map((_, index) => {
          const answer = answeredQuestions.find(
            (answer) => answer.questionIndex === index
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
              onClick={() => goToQuestion(index)}
              title={`Вопрос ${index + 1}`}
            >
              {index + 1}
            </div>
          );
        })}
      </div>

      <div className="question-content">
        <p className="question-number">
          Вопрос {currentQuestionIndex + 1} из {questions.length}
        </p>

        <p className="question-text">{currentQuestion.question}</p>

        <ul className="answers-list">
          {currentQuestion.answers.map((answer, index) => {
            let buttonClass = "";
            if (currentAnswer) {
              if (index === currentQuestion.correct) {
                buttonClass = "correct-answer";
              } else if (
                currentAnswer.selectedAnswerIndex === index &&
                !currentAnswer.isCorrect
              ) {
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

        {showExplanation && currentQuestion.explanation && (
          <div className="explanation-box">
            <p className="explanation-title">Объяснение:</p>
            <p>{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      <div className="navigation-buttons">
        {isAnswered && (
          <button className="next-button" onClick={goToNextQuestion}>
            Следующий вопрос
          </button>
        )}

        <button className="cancel-button" onClick={cancelTest}>
          Завершить тест
        </button>
      </div>
    </div>
  );
};

export default Test;
