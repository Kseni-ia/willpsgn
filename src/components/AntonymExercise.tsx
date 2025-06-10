import React, { useState } from "react";
import { Word } from "../types/game";

interface AntonymExerciseProps {
  words: Word[];
  onAnswer: (isCorrect: boolean) => void;
  onProgress: (currentIndex: number) => void;
}

const AntonymExercise: React.FC<AntonymExerciseProps> = ({
  words,
  onAnswer,
  onProgress,
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<
    "correct" | "incorrect" | "close" | null
  >(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);

  const currentWord = words[currentWordIndex];

  // Update progress whenever word index changes
  React.useEffect(() => {
    onProgress(currentWordIndex);
  }, [currentWordIndex, onProgress]);

  // Function to normalize text for comparison
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z\s]/g, "");
  };

  // Function to check if input is close to any antonym
  const findCloseMatch = (input: string, antonyms: string[]): string | null => {
    const normalizedInput = normalizeText(input);

    for (const antonym of antonyms) {
      const normalizedAntonym = normalizeText(antonym);

      // Check for partial matches or plurals
      if (
        normalizedAntonym.includes(normalizedInput) ||
        normalizedInput.includes(normalizedAntonym)
      ) {
        return antonym;
      }

      // Check for common variations (e.g., "start" vs "starting")
      if (
        normalizedInput.endsWith("ing") &&
        normalizedAntonym === normalizedInput.slice(0, -3)
      ) {
        return antonym;
      }
      if (
        normalizedAntonym.endsWith("ing") &&
        normalizedInput === normalizedAntonym.slice(0, -3)
      ) {
        return antonym;
      }

      // Check for plural forms
      if (
        normalizedInput.endsWith("s") &&
        normalizedAntonym === normalizedInput.slice(0, -1)
      ) {
        return antonym;
      }
      if (
        normalizedAntonym.endsWith("s") &&
        normalizedInput === normalizedAntonym.slice(0, -1)
      ) {
        return antonym;
      }
    }

    return null;
  };

  const skipWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
      setUserInput("");
      setFeedback(null);
      setFeedbackMessage("");
    }
  };

  const moveToNextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
      setUserInput("");
      setFeedback(null);
      setFeedbackMessage("");
    } else {
      // Exercise completed
      setExerciseCompleted(true);
      const percentage =
        words.length > 0
          ? Math.round((correctAnswers / words.length) * 100)
          : 0;
      setFeedback("correct");
      setFeedbackMessage(
        `🎉 Exercise completed! Your score: ${correctAnswers}/${words.length} (${percentage}%)`
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userInput.trim()) return;

    const normalizedInput = normalizeText(userInput);

    // Check for exact matches first
    const isExactMatch = currentWord.antonyms.some(
      (antonym) => normalizeText(antonym) === normalizedInput
    );

    if (isExactMatch) {
      setFeedback("correct");
      setFeedbackMessage("Excellent! That's a perfect antonym!");
      setCorrectAnswers((prev) => prev + 1);
      onAnswer(true);

      // Auto-advance for correct answers
      setTimeout(() => {
        moveToNextWord();
      }, 2000);
    } else {
      // Check for close matches
      const closeMatch = findCloseMatch(userInput, currentWord.antonyms);

      if (closeMatch) {
        setFeedback("close");
        setFeedbackMessage(
          `Very close! You wrote "${userInput}" - the exact form is "${closeMatch}"`
        );
        setCorrectAnswers((prev) => prev + 1);
        onAnswer(true);

        // Auto-advance for close answers
        setTimeout(() => {
          moveToNextWord();
        }, 2000);
      } else {
        setFeedback("incorrect");
        setFeedbackMessage(
          `Not quite right. Try thinking of words that mean the opposite of "${currentWord.word}"`
        );
        onAnswer(false);

        // Do NOT auto-advance for incorrect answers - user must click "Next Word"
      }
    }
  };

  const restartExercise = () => {
    setCurrentWordIndex(0);
    setUserInput("");
    setFeedback(null);
    setFeedbackMessage("");
    setCorrectAnswers(0);
    setExerciseCompleted(false);
  };

  return (
    <div className="syn-ant-container">
      <div className="word-progress">
        {exerciseCompleted
          ? `Final Score: ${correctAnswers}`
          : `Word ${currentWordIndex + 1} of ${
              words.length
            } | Score: ${correctAnswers}`}
      </div>

      <div className="exercise-content">
        <div className="exercise-left">
          {!exerciseCompleted && (
            <>
              <div className="word-row">
                <span className="word-label">Word:</span>
                <span className="word-value">{currentWord.word}</span>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="word-row">
                  <span className="word-label">Antonym:</span>
                  <input
                    type="text"
                    className={`input-field ${feedback || ""}`}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Enter an antonym (opposite meaning)..."
                    disabled={feedback !== null}
                  />
                </div>

                <div className="button-group">
                  <button
                    type="submit"
                    className="game-btn"
                    disabled={!userInput.trim() || feedback !== null}
                  >
                    Check Answer
                  </button>

                  {feedback === null && (
                    <button
                      type="button"
                      className="skip-btn"
                      onClick={skipWord}
                    >
                      Skip Word
                    </button>
                  )}

                  {feedback === "incorrect" && (
                    <button
                      type="button"
                      className="next-word-btn"
                      onClick={moveToNextWord}
                    >
                      Next Word
                    </button>
                  )}
                </div>
              </form>
            </>
          )}

          {exerciseCompleted && (
            <div className="completion-buttons">
              <button className="game-btn" onClick={restartExercise}>
                Try Again
              </button>
            </div>
          )}
        </div>

        <div className="exercise-right">
          {feedback && (
            <div className={`feedback ${feedback}`}>
              {feedbackMessage}
              {feedback === "incorrect" && !exerciseCompleted && (
                <div className="hint">
                  <strong>Hint:</strong> Some antonyms for "{currentWord.word}"
                  are: {currentWord.antonyms.slice(0, 3).join(", ")}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AntonymExercise;
