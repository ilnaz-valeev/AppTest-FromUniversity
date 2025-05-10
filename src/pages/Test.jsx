// src/pages/Test.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

// Функция для перемешивания массива (Fisher-Yates Shuffle)
const shuffleArray = (array) => {
  let shuffledArray = [...array]; // Создаем копию массива
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Меняем местами
  }
  return shuffledArray;
};

const Test = ({ subjects }) => {
  const { subjectName, topicName } = useParams(); // Извлекаем параметры из URL
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Текущий вопрос
  const [answeredQuestions, setAnsweredQuestions] = useState([]); // Массив для отслеживания ответов
  const [showExplanation, setShowExplanation] = useState(false); // Флаг для показа объяснения
  const [loading, setLoading] = useState(true);
  const [testCompleted, setTestCompleted] = useState(false); // Флаг завершения теста
  const [isAnswered, setIsAnswered] = useState(false); // Флаг, который проверяет, был ли ответ дан на текущий вопрос
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null); // Для отслеживания, был ли ответ правильным
  const [isTestCancelled, setIsTestCancelled] = useState(false); // Флаг для проверки, был ли тест завершен досрочно

  // Загружаем вопросы при изменении параметров маршрута
  useEffect(() => {
    const subject = subjects[subjectName]; // Находим выбранный предмет
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

      // Перемешиваем вопросы
      const shuffledQuestions = shuffleArray(allQuestions);
      setQuestions(shuffledQuestions);
    }
    setLoading(false);
  }, [subjectName, topicName, subjects]);

  // Обработка выбранного ответа
  const handleAnswer = (selectedAnswerIndex) => {
    if (!questions || !questions[currentQuestionIndex]) return; // Защита от обращения к пустому вопросу

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswerIndex === currentQuestion.correct;

    // Сохраняем ответ (индекс ответа и факт правильности)
    setAnsweredQuestions([
      ...answeredQuestions,
      { questionIndex: currentQuestionIndex, selectedAnswerIndex, isCorrect },
    ]);

    setIsAnswered(true); // Блокируем кнопки после выбора ответа
    setIsAnswerCorrect(isCorrect); // Сохраняем факт правильности ответа

    if (isCorrect) {
      // Если ответ правильный, сразу переходим к следующему вопросу
      goToNextQuestion();
    } else {
      // Если ответ неправильный, показываем объяснение
      setShowExplanation(true);
    }
  };

  // Перейти к следующему вопросу
  const goToNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1); // Переход к следующему вопросу
      setShowExplanation(false); // Скрыть объяснение при переходе к следующему вопросу
      setIsAnswered(false); // Разблокировать кнопки для следующего вопроса
      setIsAnswerCorrect(null); // Сбросить флаг правильности ответа
    } else {
      setTestCompleted(true); // Завершаем тест, если это последний вопрос
    }
  };

  // Перезапуск теста
  const restartTest = () => {
    setAnsweredQuestions([]);
    setCurrentQuestionIndex(0);
    setTestCompleted(false);
    setShowExplanation(false);
    setIsAnswered(false); // Разблокировать кнопки при перезапуске теста
    setIsAnswerCorrect(null); // Сбросить флаг правильности ответа
    setIsTestCancelled(false); // Сбросить флаг досрочного завершения теста
  };

  // Досрочное завершение теста
  const cancelTest = () => {
    const confirmCancel = window.confirm(
      "Вы уверены, что хотите завершить тест досрочно?"
    );
    if (confirmCancel) {
      setIsTestCancelled(true);
      setTestCompleted(true); // Завершаем тест досрочно
    }
  };

  if (loading) {
    return <div>Загрузка...</div>; // Индикатор загрузки
  }

  // Если вопросы не найдены
  if (!questions || questions.length === 0) {
    return <div>Вопросы не найдены</div>;
  }

  // Защита от выхода за пределы массива
  const currentQuestion = questions[currentQuestionIndex];

  // Если все вопросы пройдены, показываем результаты
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

        {/* Перечисляем, какие вопросы были правильными, а какие нет */}
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

        {/* Кнопка для перезапуска теста */}
        <button onClick={restartTest}>Пройти тест заново</button>
      </div>
    );
  }

  return (
    <div>
      <h2>
        Тест по {subjectName} - {topicName}
      </h2>

      {/* Панель с номером текущего вопроса */}
      <div>
        <p>
          Вопрос {currentQuestionIndex + 1} из {questions.length}
        </p>
        {showExplanation && currentQuestion.explanation && (
          <div>
            <p>
              <strong>Объяснение:</strong> {currentQuestion.explanation}
            </p>
          </div>
        )}
        {showExplanation && !isAnswerCorrect && (
          <div>
            <p>
              <strong>Ваш ответ:</strong>{" "}
              {
                currentQuestion.answers[
                  answeredQuestions[answeredQuestions.length - 1]
                    ?.selectedAnswerIndex
                ]
              }
            </p>
          </div>
        )}
      </div>

      <div>
        <p>{currentQuestion.question}</p>
        <ul>
          {currentQuestion.answers.map((answer, index) => (
            <li key={index}>
              <button
                onClick={() => handleAnswer(index)}
                disabled={isAnswered} // Отключаем кнопку, если ответ уже выбран
              >
                {answer}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Кнопка для перехода к следующему вопросу */}
      {isAnswered && (
        <button onClick={goToNextQuestion}>Следующий вопрос</button>
      )}

      {/* Кнопка для досрочного завершения теста */}
      <button onClick={cancelTest}>Досрочно завершить тест</button>
    </div>
  );
};

export default Test;
