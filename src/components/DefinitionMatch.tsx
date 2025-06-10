import React, { useState, useEffect, useRef } from "react";
import { Word } from "../types/game";

interface DefinitionMatchProps {
  words: Word[];
  onAnswer: (isCorrect: boolean) => void;
}

const DefinitionMatch: React.FC<DefinitionMatchProps> = ({
  words,
  onAnswer,
}) => {
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<string | null>(
    null
  );
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [shuffledDefinitions, setShuffledDefinitions] = useState<string[]>([]);
  const [animatingMatch, setAnimatingMatch] = useState<{
    wordId: number;
    definition: string;
  } | null>(null);
  const [incorrectMatch, setIncorrectMatch] = useState<{
    wordId: number;
    definition: string;
  } | null>(null);
  const [attemptInProgress, setAttemptInProgress] = useState<boolean>(false);
  const lastAttemptTimeRef = useRef<number>(0);

  useEffect(() => {
    // Shuffle definitions when component mounts or words change
    const definitions = words.map((word) => word.definition);
    setShuffledDefinitions([...definitions].sort(() => Math.random() - 0.5));

    // Clear processed attempts when words change (fresh start for each exercise)
    lastAttemptTimeRef.current = 0;
  }, [words]);

  const makeAttempt = (word: Word, definition: string) => {
    if (attemptInProgress) {
      return;
    }

    // Simple time-based debounce - prevent attempts within 100ms of each other
    const now = Date.now();
    if (now - lastAttemptTimeRef.current < 100) {
      return;
    }

    setAttemptInProgress(true);
    lastAttemptTimeRef.current = now;

    // Clear selections immediately to prevent double-calls
    setSelectedWord(null);
    setSelectedDefinition(null);

    const isCorrect = word.definition === definition;

    // Call onAnswer only once per attempt
    onAnswer(isCorrect);

    if (isCorrect) {
      // Start connection animation
      setAnimatingMatch({ wordId: word.id, definition });

      // After animation, add to matched pairs
      setTimeout(() => {
        setMatchedPairs((prev) => {
          const newSet = new Set(prev);
          newSet.add(word.id);
          return newSet;
        });
        setAnimatingMatch(null);
        setAttemptInProgress(false);
      }, 1200); // Animation duration
    } else {
      // Show incorrect match animation
      setIncorrectMatch({ wordId: word.id, definition });

      // After showing red feedback, clear it
      setTimeout(() => {
        setIncorrectMatch(null);
        setAttemptInProgress(false);
      }, 800); // Shorter duration for incorrect feedback
    }
  };

  const handleWordClick = (word: Word) => {
    if (matchedPairs.has(word.id) || animatingMatch || incorrectMatch) {
      return;
    }

    if (selectedDefinition) {
      // We have a definition selected, make the attempt
      makeAttempt(word, selectedDefinition);
    } else {
      // Just select the word
      setSelectedWord(word);
      setSelectedDefinition(null);
    }
  };

  const handleDefinitionClick = (definition: string) => {
    if (animatingMatch || incorrectMatch) {
      return; // Prevent clicks during animation
    }

    if (selectedWord) {
      // We have a word selected, make the attempt
      makeAttempt(selectedWord, definition);
    } else {
      // Just select the definition
      setSelectedDefinition(definition);
      setSelectedWord(null);
    }
  };

  // Filter out matched words and definitions
  const availableWords = words.filter((word) => !matchedPairs.has(word.id));
  const availableDefinitions = shuffledDefinitions.filter((definition) => {
    // Find the word that has this definition
    const wordWithDefinition = words.find(
      (word) => word.definition === definition
    );
    return wordWithDefinition && !matchedPairs.has(wordWithDefinition.id);
  });

  return (
    <div className="match-container">
      <div className="word-list">
        {availableWords.map((word) => (
          <div
            key={word.id}
            className={`word-item ${
              selectedWord?.id === word.id ? "selected" : ""
            } ${animatingMatch?.wordId === word.id ? "connecting" : ""} ${
              incorrectMatch?.wordId === word.id ? "incorrect-flash" : ""
            }`}
            onClick={() => handleWordClick(word)}
          >
            {word.word}
          </div>
        ))}
        {availableWords.length === 0 && !animatingMatch && (
          <div className="completion-message">
            🎉 All words matched! Great job!
          </div>
        )}
      </div>

      <div className="definition-list">
        {availableDefinitions.map((definition, index) => (
          <div
            key={index}
            className={`definition-item ${
              selectedDefinition === definition ? "selected" : ""
            } ${
              animatingMatch?.definition === definition ? "connecting" : ""
            } ${
              incorrectMatch?.definition === definition ? "incorrect-flash" : ""
            }`}
            onClick={() => handleDefinitionClick(definition)}
          >
            {definition}
          </div>
        ))}
        {availableDefinitions.length === 0 && !animatingMatch && (
          <div className="completion-message">
            🎉 All definitions matched! Excellent work!
          </div>
        )}
      </div>
    </div>
  );
};

export default DefinitionMatch;
