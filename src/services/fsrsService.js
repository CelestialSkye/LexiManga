import { createEmptyCard, FSRS, Rating } from 'ts-fsrs';

const fsrs = new FSRS();

export const AUTO_UPDATE_FIELDS = [
  'due',
  'elapsed_days',
  'lapses',
  'last_review',
  'reps',
  'scheduled_days',
  'stability',
  'state',
  'updatedAt',
  'createdAt',
];

export const createCard = (wordData) => {
  const card = createEmptyCard();
  return {
    ...card,
    wordData,
    createdAt: new Date(),
  };
};

export const reviewCard = (card, rating) => {
  // Convert rating (1-4) to TS-FSRS Rating enum
  const fsrsRating =
    rating === 1
      ? Rating.Again
      : rating === 2
        ? Rating.Hard
        : rating === 3
          ? Rating.Good
          : Rating.Easy;

  const result = fsrs.repeat(card, fsrsRating);

  // Return the card for the given rating
  return {
    card: result[rating.toString()].card,
    reviewLog: result[rating.toString()].log,
  };
};

export const getDueCards = (cards) => {
  const now = new Date();
  return cards.filter((card) => {
    const dueDate = new Date(card.due);
    return dueDate <= now;
  });
};

export const getNextReviewTime = (card) => {
  return new Date(card.due);
};
