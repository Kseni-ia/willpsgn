import React, { useState, useEffect } from "react";
import { Word } from "../types/game";

interface MemoryGameProps {
  words: Word[];
  onAnswer: (isCorrect: boolean) => void;
}

interface Card {
  id: number;
  content: string;
  type: "word" | "synonym";
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryGame: React.FC<MemoryGameProps> = ({ words, onAnswer }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  // Fisher-Yates shuffle algorithm for proper randomization
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Check if game is completed
  useEffect(() => {
    if (cards.length > 0 && cards.every((card) => card.isMatched)) {
      setGameCompleted(true);
    }
  }, [cards]);

  useEffect(() => {
    // Create cards from words and their synonyms
    const newCards: Card[] = [];

    words.forEach((word) => {
      // Add the vocabulary word
      newCards.push({
        id: word.id,
        content: word.word,
        type: "word",
        isFlipped: false,
        isMatched: false,
      });

      // Add a random synonym for each word (re-randomized each game)
      const shuffledSynonyms = shuffleArray([...word.synonyms]);
      const randomSynonym = shuffledSynonyms[0];
      newCards.push({
        id: word.id,
        content: randomSynonym,
        type: "synonym",
        isFlipped: false,
        isMatched: false,
      });
    });

    // Properly shuffle the cards using Fisher-Yates algorithm
    setCards(shuffleArray(newCards));

    // Reset game state
    setGameStarted(false);
    setGameCompleted(false);
    setFlippedCards([]);
  }, [words]);

  const handleCardClick = (index: number) => {
    // Start the game on first click
    if (!gameStarted) {
      setGameStarted(true);
    }

    if (
      flippedCards.length === 2 ||
      cards[index].isMatched ||
      flippedCards.includes(index)
    ) {
      return;
    }

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    // Update card flip state
    setCards((prevCards) => {
      const newCards = [...prevCards];
      newCards[index] = { ...newCards[index], isFlipped: true };
      return newCards;
    });

    // Check for match if two cards are flipped
    if (newFlippedCards.length === 2) {
      const [firstIndex, secondIndex] = newFlippedCards;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      setTimeout(() => {
        if (firstCard.id === secondCard.id) {
          // Match found - keep cards flipped and mark as matched
          onAnswer(true);

          setCards((prevCards) => {
            const newCards = [...prevCards];
            newCards[firstIndex] = {
              ...newCards[firstIndex],
              isMatched: true,
              isFlipped: true,
            };
            newCards[secondIndex] = {
              ...newCards[secondIndex],
              isMatched: true,
              isFlipped: true,
            };
            return newCards;
          });
        } else {
          // No match - flip cards back
          onAnswer(false);
          setCards((prevCards) => {
            const newCards = [...prevCards];
            newCards[firstIndex] = {
              ...newCards[firstIndex],
              isFlipped: false,
            };
            newCards[secondIndex] = {
              ...newCards[secondIndex],
              isFlipped: false,
            };
            return newCards;
          });
        }
        setFlippedCards([]);
      }, 800);
    }
  };

  const restartGame = () => {
    // Re-create and shuffle cards with new random synonyms
    const newCards: Card[] = [];

    words.forEach((word) => {
      // Add the vocabulary word
      newCards.push({
        id: word.id,
        content: word.word,
        type: "word",
        isFlipped: false,
        isMatched: false,
      });

      // Add a different random synonym for variety
      const shuffledSynonyms = shuffleArray([...word.synonyms]);
      const randomSynonym = shuffledSynonyms[0];
      newCards.push({
        id: word.id,
        content: randomSynonym,
        type: "synonym",
        isFlipped: false,
        isMatched: false,
      });
    });

    // Properly shuffle the cards using Fisher-Yates algorithm
    setCards(shuffleArray(newCards));

    setGameStarted(false);
    setGameCompleted(false);
    setFlippedCards([]);
  };

  return (
    <div className="memory-game">
      <div className="game-header">
        {gameCompleted && (
          <div className="game-completed">
            🎉 Game Completed! Great job matching all pairs!
            <button className="restart-btn" onClick={restartGame}>
              Play Again
            </button>
          </div>
        )}

        {!gameStarted && !gameCompleted && (
          <div className="game-instruction">Click any card to start!</div>
        )}
      </div>

      <div className="cards-grid">
        {cards.map((card, index) => (
          <div
            key={`${card.type}-${index}`}
            className={`card ${card.isFlipped ? "flipped" : ""} ${
              card.isMatched ? "matched" : ""
            } ${card.type === "word" ? "word-card" : "synonym-card"}`}
            onClick={() => handleCardClick(index)}
          >
            <div className="card-inner">
              <div className="card-front">?</div>
              <div className="card-back">{card.content}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryGame;
