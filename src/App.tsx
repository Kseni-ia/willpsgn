import React, { useState, useEffect } from "react";
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

// IELTS Vocabulary data from the screenshot
const vocabularyData: Word[] = [
  {
    id: 1,
    word: "Chain reaction",
    definition: "A series of events, each of which causes the next",
    synonyms: ["Sequence", "Series", "Cascade"],
    antonyms: [
      "Isolation",
      "Single event",
      "Independence",
      "Separation",
      "Individual action",
      "Standalone",
      "Unconnected",
    ],
  },
  {
    id: 2,
    word: "Consequence",
    definition: "The results or effects of something",
    synonyms: ["Result", "Effect", "Outcome"],
    antonyms: [
      "Cause",
      "Origin",
      "Source",
      "Beginning",
      "Start",
      "Root",
      "Trigger",
      "Reason",
    ],
  },
  {
    id: 3,
    word: "Impact",
    definition:
      "A sudden and powerful effect on a situation, process, or person",
    synonyms: ["Effect", "Influence", "Force"],
    antonyms: [
      "Weakness",
      "Insignificance",
      "Neglect",
      "Powerlessness",
      "Ineffectiveness",
      "Gentleness",
      "Softness",
    ],
  },
  {
    id: 4,
    word: "Influence",
    definition: "To affect what people do or what happens in situations",
    synonyms: ["Affect", "Sway", "Impact"],
    antonyms: [
      "Independence",
      "Autonomy",
      "Resistance",
      "Immunity",
      "Freedom",
      "Self-reliance",
    ],
  },
  {
    id: 5,
    word: "Outcome",
    definition:
      "The situation that exists at the end of an activity or process",
    synonyms: ["Result", "End", "Conclusion"],
    antonyms: [
      "Beginning",
      "Start",
      "Cause",
      "Origin",
      "Input",
      "Commencement",
      "Introduction",
    ],
  },
  {
    id: 6,
    word: "Repercussion",
    definition:
      "Unpleasant things that happen as a result of an action or event",
    synonyms: ["Consequence", "Aftermath", "Backlash"],
    antonyms: [
      "Benefit",
      "Advantage",
      "Reward",
      "Blessing",
      "Positive outcome",
      "Good result",
      "Bonus",
    ],
  },
  {
    id: 7,
    word: "Affect",
    definition: "To influence or cause someone or something to change",
    synonyms: ["Influence", "Impact", "Alter"],
    antonyms: [
      "Ignore",
      "Preserve",
      "Maintain",
      "Leave alone",
      "Keep unchanged",
      "Neglect",
      "Disregard",
    ],
  },
  {
    id: 8,
    word: "Contribute",
    definition: "To be one of the causes of an event or situation",
    synonyms: ["Add", "Help", "Assist"],
    antonyms: [
      "Hinder",
      "Prevent",
      "Block",
      "Obstruct",
      "Impede",
      "Subtract",
      "Remove",
      "Withdraw",
    ],
  },
  {
    id: 9,
    word: "Determine",
    definition: "To cause something to be of a particular kind or nature",
    synonyms: ["Decide", "Establish", "Fix"],
    antonyms: [
      "Ignore",
      "Neglect",
      "Randomize",
      "Confuse",
      "Uncertain",
      "Undecided",
      "Flexible",
    ],
  },
  {
    id: 10,
    word: "Generate",
    definition: "To cause something to begin and develop",
    synonyms: ["Create", "Produce", "Cause"],
    antonyms: [
      "Destroy",
      "Stop",
      "End",
      "Eliminate",
      "Remove",
      "Prevent",
      "Block",
      "Terminate",
    ],
  },
  {
    id: 11,
    word: "Induce",
    definition: "To cause a state or condition",
    synonyms: ["Cause", "Bring about", "Lead to"],
    antonyms: [
      "Prevent",
      "Stop",
      "Block",
      "Discourage",
      "Deter",
      "Inhibit",
      "Suppress",
    ],
  },
  {
    id: 12,
    word: "Provoke",
    definition: "To cause a reaction or response",
    synonyms: ["Trigger", "Cause", "Arouse"],
    antonyms: [
      "Calm",
      "Soothe",
      "Prevent",
      "Pacify",
      "Appease",
      "Comfort",
      "Relax",
    ],
  },
  {
    id: 13,
    word: "Result",
    definition: "To cause a particular situation or event to happen",
    synonyms: ["Lead to", "Cause", "End in"],
    antonyms: [
      "Cause",
      "Beginning",
      "Start",
      "Origin",
      "Unfinished",
      "Incomplete",
      "Ongoing",
      "Process",
      "Input",
    ],
  },
  {
    id: 14,
    word: "Stem",
    definition: "To originate or be caused by something",
    synonyms: ["Arise", "Originate", "Spring"],
    antonyms: [
      "End",
      "Finish",
      "Conclude",
      "Terminate",
      "Result",
      "Lead to",
      "Cause",
    ],
  },
  {
    id: 15,
    word: "Trigger",
    definition: "To cause an event or situation to begin",
    synonyms: ["Cause", "Start", "Activate"],
    antonyms: ["Stop", "Prevent", "End", "Finish", "Halt", "Block", "Inhibit"],
  },
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [exerciseStartTime, setExerciseStartTime] = useState<number>(0);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>("00:00");
  const [mistakes, setMistakes] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Timer effect to update time every second
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameState.currentExercise && exerciseStartTime && !gameOver) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - exerciseStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        setCurrentTime(
          `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
        );
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.currentExercise, exerciseStartTime, gameOver]);

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
    setExerciseStartTime(Date.now());
    setCurrentScore(0);
    setCurrentTime("00:00");
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
    setExerciseStartTime(0);
    setCurrentScore(0);
    setCurrentTime("00:00");
    setMistakes(0);
    setGameOver(false);
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

  // Calculate progress percentage based on exercise type
  const getProgressPercentage = () => {
    if (!gameState.currentExercise || gameState.selectedWords.length === 0) {
      return "0%";
    }

    switch (gameState.currentExercise) {
      case "memory":
        // For memory game: matched pairs / total pairs
        const totalPairs = gameState.selectedWords.length;
        const matchedPairs = gameState.matchedPairs.size;
        return `${Math.round((matchedPairs / totalPairs) * 100)}%`;

      case "synonym":
      case "antonym":
        // For these exercises: correct answers / total words
        const totalWords = gameState.selectedWords.length;
        return `${Math.round((currentScore / totalWords) * 100)}%`;

      case "definition":
        // For definition match: use current score (which reflects actual matches)
        return `${Math.round(
          (currentScore / gameState.selectedWords.length) * 100
        )}%`;

      default:
        return "0%";
    }
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
      <div className="header">
        <h1 className="title">Vocabulary Master Game</h1>
        <div className="stats">
          {!gameState.currentExercise ? (
            // Welcome screen - show welcome info
            <>
              <div className="stat">
                <div className="stat-value">Welcome</div>
                <div className="stat-label">IELTS Practice</div>
              </div>
              <div className="stat">
                <div className="stat-value">15</div>
                <div className="stat-label">Vocabulary Words</div>
              </div>
              <div className="stat">
                <div className="stat-value">Ready?</div>
                <div className="stat-label">Let's Begin</div>
              </div>
            </>
          ) : (
            // During exercise - show scores and timer
            <>
              <div className="stat">
                <div className="stat-value">{currentScore}</div>
                <div className="stat-label">Score</div>
              </div>
              <div className="stat">
                <div className="stat-value">{currentTime}</div>
                <div className="stat-label">Time</div>
              </div>
              <div className="stat">
                <div className="stat-value">{getProgressPercentage()}</div>
                <div className="stat-label">Progress</div>
              </div>
            </>
          )}
        </div>
      </div>

      {!gameState.currentExercise ? (
        // Welcome Screen
        <div className="welcome-screen">
          <div className="welcome-content">
            <h2>Welcome to IELTS Vocabulary Practice!</h2>
            <p className="welcome-description">
              Master 15 essential IELTS vocabulary words through 4 interactive
              exercises:
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
                📚 Topic 14: Cause and Effect Vocabulary
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="exercise active">
          <h2 className="exercise-title">
            {gameState.currentExercise.charAt(0).toUpperCase() +
              gameState.currentExercise.slice(1)}{" "}
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
