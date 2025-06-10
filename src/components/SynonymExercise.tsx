import React, { useState } from "react";
import { Word } from "../types/game";

interface SynonymExerciseProps {
  words: Word[];
  onAnswer: (isCorrect: boolean) => void;
  onProgress: (currentIndex: number) => void;
}

const SynonymExercise: React.FC<SynonymExerciseProps> = ({
  words,
  onAnswer,
  onProgress,
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null
  );
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);

  const currentWord = words[currentWordIndex];

  // Update progress whenever word index changes
  React.useEffect(() => {
    onProgress(currentWordIndex);
  }, [currentWordIndex, onProgress]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isCorrect = currentWord.synonyms.some(
      (synonym) => synonym.toLowerCase() === userInput.toLowerCase()
    );

    setFeedback(isCorrect ? "correct" : "incorrect");
    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    }
    onAnswer(isCorrect);

    if (isCorrect) {
      // Auto-advance for correct answers
      setTimeout(() => {
        moveToNextWord();
      }, 1500);
    }
    // For incorrect answers, do NOT auto-advance - user must click "Next Word"
  };

  const moveToNextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
      setUserInput("");
      setFeedback(null);
    } else {
      // Exercise completed
      setExerciseCompleted(true);
      const percentage =
        words.length > 0
          ? Math.round((correctAnswers / words.length) * 100)
          : 0;
      setFeedback("correct");
    }
  };

  const skipWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
      setUserInput("");
      setFeedback(null);
    }
  };

  const restartExercise = () => {
    setCurrentWordIndex(0);
    setUserInput("");
    setFeedback(null);
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
                  <span className="word-label">Synonym:</span>
                  <input
                    type="text"
                    className={`input-field ${feedback || ""}`}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Enter a synonym..."
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
          {feedback && !exerciseCompleted && (
            <div className={`feedback ${feedback}`}>
              {feedback === "correct"
                ? "Excellent! Correct synonym!"
                : "Not quite right. Try thinking of a word with similar meaning."}
              {feedback === "incorrect" && (
                <div className="hint">
                  <strong>Hint:</strong> One of the synonyms is:{" "}
                  {currentWord.synonyms[0]}
                </div>
              )}
            </div>
          )}

          {exerciseCompleted && (
            <div className="feedback correct">
              🎉 Exercise completed! Your score: {correctAnswers}/{words.length}{" "}
              (
              {words.length > 0
                ? Math.round((correctAnswers / words.length) * 100)
                : 0}
              %)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SynonymExercise;
