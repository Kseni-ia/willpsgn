import React, { useState } from "react";
import "./styles/Game.css";
import { GameState, Word, GameStats, ExerciseType } from "./types/game";
import DefinitionMatch from "./components/DefinitionMatch";
import SynonymExercise from "./components/SynonymExercise";
import AntonymExercise from "./components/AntonymExercise";
import MemoryGame from "./components/MemoryGame";

const initialStats: GameStats = {
  correctAnswers: 0,
  totalQuestions: 0,
  currentStreak: 0,
  bestStreak: 0,
};

const initialGameState: GameState = {
  currentExercise: null,
  stats: initialStats,
  progress: 0,
  selectedWords: [],
  matchedPairs: new Set(),
};

// IELTS Vocabulary data - Topic 15: Signposting expressions for writing
const vocabularyData: Word[] = [
  {
    id: 1,
    word: "Furthermore",
    definition:
      "Used to introduce a piece of information or opinion that adds to or supports the previous one",
    synonyms: ["Moreover", "Additionally", "Besides"],
    antonyms: [
      "However",
      "Nevertheless",
      "Conversely",
      "On the contrary",
      "Instead",
      "Alternatively",
    ],
  },
  {
    id: 2,
    word: "Moreover",
    definition:
      "Used to introduce a piece of information that adds to or supports the previous statement",
    synonyms: ["Furthermore", "Additionally", "Besides"],
    antonyms: [
      "However",
      "Nevertheless",
      "Conversely",
      "On the other hand",
      "Alternatively",
      "Instead",
    ],
  },
  {
    id: 3,
    word: "Nevertheless",
    definition:
      "Used when saying something that contrasts with what has just been said",
    synonyms: ["However", "Nonetheless", "Still"],
    antonyms: [
      "Furthermore",
      "Moreover",
      "Additionally",
      "Similarly",
      "Likewise",
      "Therefore",
    ],
  },
  {
    id: 4,
    word: "Whereas",
    definition:
      "Used to introduce a comment which contrasts with what is said in the main clause",
    synonyms: ["While", "Although", "Though"],
    antonyms: [
      "Similarly",
      "Likewise",
      "Equally",
      "Correspondingly",
      "In the same way",
      "Therefore",
    ],
  },
  {
    id: 5,
    word: "Whilst",
    definition:
      "Means the same as while, used mainly in formal and literary contexts",
    synonyms: ["While", "Although", "Whereas"],
    antonyms: [
      "Similarly",
      "Likewise",
      "Therefore",
      "Consequently",
      "Hence",
      "Thus",
    ],
  },
  {
    id: 6,
    word: "Former",
    definition:
      "When two people, things, or groups have just been mentioned, you can refer to the first of them as the former",
    synonyms: ["First", "Previous", "Earlier"],
    antonyms: ["Latter", "Last", "Final", "Second", "Following", "Subsequent"],
  },
  {
    id: 7,
    word: "Initial",
    definition:
      "Used to describe something that happens at the beginning of a process",
    synonyms: ["First", "Opening", "Beginning"],
    antonyms: ["Final", "Last", "Concluding", "Ultimate", "Ending", "Terminal"],
  },
  {
    id: 8,
    word: "Latter",
    definition:
      "When two people, things, or groups have just been mentioned, you can refer to the second of them as the latter",
    synonyms: ["Second", "Last", "Final"],
    antonyms: ["Former", "First", "Previous", "Earlier", "Initial", "Opening"],
  },
  {
    id: 9,
    word: "Prior",
    definition:
      "Used to indicate that something has already happened, or must happen, before another event takes place",
    synonyms: ["Before", "Earlier", "Previous"],
    antonyms: ["After", "Following", "Subsequent", "Later", "Future", "Next"],
  },
  {
    id: 10,
    word: "Respectively",
    definition:
      "Means in the same order as the items that you have just mentioned",
    synonyms: ["Correspondingly", "In order", "Sequentially"],
    antonyms: [
      "Randomly",
      "Haphazardly",
      "Irregularly",
      "Chaotically",
      "Unsystematically",
      "Arbitrarily",
    ],
  },
  {
    id: 11,
    word: "Subsequent",
    definition:
      "Used to describe something that happened or existed after the time or event that has just been referred to",
    synonyms: ["Following", "Later", "Next"],
    antonyms: [
      "Prior",
      "Previous",
      "Earlier",
      "Former",
      "Preceding",
      "Initial",
    ],
  },
  {
    id: 12,
    word: "On balance",
    definition:
      "Used to indicate that you are stating an opinion after considering all the relevant facts or arguments",
    synonyms: ["Overall", "All things considered", "Generally"],
    antonyms: [
      "Specifically",
      "Particularly",
      "Individually",
      "Separately",
      "Distinctly",
      "Precisely",
    ],
  },
  {
    id: 13,
    word: "Overall",
    definition:
      "Used to indicate that you are talking about a situation in general or about the whole of something",
    synonyms: ["Generally", "All in all", "On balance"],
    antonyms: [
      "Specifically",
      "Particularly",
      "Individually",
      "Separately",
      "Partially",
      "Locally",
    ],
  },
  {
    id: 14,
    word: "Hence",
    definition:
      "Used to indicate that the statement you are about to make is a consequence of what you have just said",
    synonyms: ["Therefore", "Thus", "Consequently"],
    antonyms: [
      "However",
      "Nevertheless",
      "Despite this",
      "Regardless",
      "Notwithstanding",
      "Still",
    ],
  },
  {
    id: 15,
    word: "Thus",
    definition:
      "Used to show that what you are about to mention is the result or consequence of something else that you have just mentioned",
    synonyms: ["Therefore", "Hence", "Consequently"],
    antonyms: [
      "However",
      "Nevertheless",
      "Despite this",
      "Regardless",
      "Conversely",
      "Instead",
    ],
  },
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [showWordList, setShowWordList] = useState<boolean>(false);

  const startExercise = (type: ExerciseType) => {
    // Shuffle words for variety - different starting point each time
    const shuffledWords = [...vocabularyData].sort(() => Math.random() - 0.5);

    setGameState((prev) => ({
      ...prev,
      currentExercise: type,
      progress: 0,
      selectedWords:
        type === "memory" ? shuffledWords.slice(0, 6) : shuffledWords,
      matchedPairs: new Set(),
    }));
    setCurrentScore(0);
    setMistakes(0);
    setGameOver(false);
  };

  const goBackToMenu = () => {
    setGameState((prev) => ({
      ...prev,
      currentExercise: null,
      progress: 0,
      selectedWords: [],
      matchedPairs: new Set(),
    }));
    setCurrentScore(0);
    setMistakes(0);
    setGameOver(false);
    setShowWordList(false);
  };

  const showWordListView = () => {
    setShowWordList(true);
  };

  const restartCurrentExercise = () => {
    if (gameState.currentExercise) {
      startExercise(gameState.currentExercise);
    }
  };

  const updateStats = (isCorrect: boolean) => {
    if (gameOver) return; // Don't update if game is over

    // Handle mistake counting first, outside of setGameState
    if (!isCorrect && gameState.currentExercise === "definition") {
      setMistakes((prev) => {
        const newMistakes = prev + 1;
        if (newMistakes >= 4) {
          setGameOver(true);
        }
        return newMistakes;
      });
    }

    // Update game stats
    setGameState((prev) => {
      const newStats = { ...prev.stats };
      newStats.totalQuestions++;

      if (isCorrect) {
        newStats.correctAnswers++;
        newStats.currentStreak++;
        newStats.bestStreak = Math.max(
          newStats.bestStreak,
          newStats.currentStreak
        );
        setCurrentScore((prev) => prev + 1);
      } else {
        newStats.currentStreak = 0;
        // Mistake counting is now handled above, outside this callback
      }

      return {
        ...prev,
        stats: newStats,
      };
    });
  };

  // Add function to update progress for synonym/antonym exercises
  const updateProgress = (currentIndex: number) => {
    setGameState((prev) => ({
      ...prev,
      progress: currentIndex + 1,
    }));
  };

  const renderExercise = () => {
    if (gameOver) {
      return (
        <div className="game-over-container">
          <div className="game-over-animation">
            <h2>Game Over!</h2>
            <p>You made 4 mistakes. Don't worry, practice makes perfect!</p>
            <p>
              Your score: {currentScore}/{gameState.selectedWords.length}
            </p>
            <div className="game-over-buttons">
              <button className="game-btn" onClick={restartCurrentExercise}>
                Try Again
              </button>
              <button className="back-btn" onClick={goBackToMenu}>
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      );
    }

    switch (gameState.currentExercise) {
      case "definition":
        return (
          <DefinitionMatch
            words={gameState.selectedWords}
            onAnswer={updateStats}
          />
        );
      case "synonym":
        return (
          <SynonymExercise
            words={gameState.selectedWords}
            onAnswer={updateStats}
            onProgress={updateProgress}
          />
        );
      case "antonym":
        return (
          <AntonymExercise
            words={gameState.selectedWords}
            onAnswer={updateStats}
            onProgress={updateProgress}
          />
        );
      case "memory":
        return (
          <MemoryGame words={gameState.selectedWords} onAnswer={updateStats} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="game-container">
      {!gameState.currentExercise && !showWordList ? (
        // Welcome Screen
        <div className="welcome-screen">
          <div className="welcome-content">
            <h2>Welcome to IELTS Vocabulary Practice!</h2>
            <p className="welcome-description">
              Master 15 essential signposting expressions for writing through 4
              interactive exercises:
            </p>
            <div className="exercise-preview">
              <div
                className="preview-item"
                onClick={() => startExercise("definition")}
              >
                <span className="preview-icon">📚</span>
                <span>Definition Match</span>
              </div>
              <div
                className="preview-item"
                onClick={() => startExercise("synonym")}
              >
                <span className="preview-icon">🔗</span>
                <span>Synonym Exercise</span>
              </div>
              <div
                className="preview-item"
                onClick={() => startExercise("antonym")}
              >
                <span className="preview-icon">⚡</span>
                <span>Antonym Exercise</span>
              </div>
              <div
                className="preview-item"
                onClick={() => startExercise("memory")}
              >
                <span className="preview-icon">🧠</span>
                <span>Memory Game</span>
              </div>
            </div>
            <div className="welcome-info">
              <p className="info-highlight">
                📚 Topic 15: Signposting expressions for writing
              </p>
              <div className="word-list-section">
                <div
                  className="preview-item word-list-button centered"
                  onClick={showWordListView}
                >
                  <span className="preview-icon">📝</span>
                  <span>Word List</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : showWordList ? (
        // Word List View
        <div className="word-list-container">
          <div className="word-list-content">
            <h2>📝 Vocabulary Reference List</h2>
            <p className="word-list-description">
              Study all 15 signposting expressions before starting the
              exercises:
            </p>
            <div className="word-list-grid">
              {vocabularyData.map((word, index) => (
                <div key={word.id} className="word-card">
                  <div className="word-number">{index + 1}</div>
                  <div className="word-term">{word.word}</div>
                  <div className="word-definition">{word.definition}</div>
                  <div className="word-synonyms">
                    <strong>Synonyms:</strong> {word.synonyms.join(", ")}
                  </div>
                </div>
              ))}
            </div>
            <div className="word-list-actions">
              <button className="back-btn" onClick={goBackToMenu}>
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="exercise active">
          <h2 className="exercise-title">
            {gameState.currentExercise
              ? gameState.currentExercise.charAt(0).toUpperCase() +
                gameState.currentExercise.slice(1)
              : "Exercise"}{" "}
            Exercise
          </h2>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${
                  (gameState.progress / gameState.selectedWords.length) * 100
                }%`,
              }}
            />
          </div>
          {!gameOver && gameState.currentExercise === "definition" && (
            <div className="mistake-counter">
              <span className={`mistakes ${mistakes >= 3 ? "danger" : ""}`}>
                Mistakes: {mistakes}/4
              </span>
            </div>
          )}
          {renderExercise()}
          {!gameOver && (
            <button className="back-btn" onClick={goBackToMenu}>
              Back to Menu
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
