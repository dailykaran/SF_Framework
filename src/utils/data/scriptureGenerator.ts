import { faker } from '@faker-js/faker';
import { BOOKS, MIN_VERSES_PER_CHAPTER, MAX_VERSES_PER_CHAPTER, QUESTION_TEMPLATES } from './scripture.data';

export interface ScriptureReference {
  book: string;
  chapter: number;
  verse: number;
  reference: string;
}

export interface ScriptureVerse extends ScriptureReference {
  text: string;
}

export interface ScriptureQuestionAnswer extends ScriptureReference {
  question: string;
  answer: string;
}

/** Re-seed faker so generated scripture data is reproducible across a run. */
export function seedScripture(seed: number): void {
  faker.seed(seed);
}

export function getRandomReference(): ScriptureReference {
  const book = faker.helpers.arrayElement(BOOKS);
  const chapter = faker.number.int({ min: 1, max: book.chapters });
  return getReferenceForChapter(book.name, chapter);
}

/** Builds a reference with a random verse for a caller-supplied book/chapter, validating both exist. */
export function getReferenceForChapter(book: string, chapter: number): ScriptureReference {
  const match = BOOKS.find((b) => b.name.toLowerCase() === book.toLowerCase());
  if (!match) {
    throw new Error(`Unknown Bible book: "${book}"`);
  }
  if (chapter < 1 || chapter > match.chapters) {
    throw new Error(`${match.name} has no chapter ${chapter} (valid range: 1-${match.chapters})`);
  }

  const verse = faker.number.int({ min: MIN_VERSES_PER_CHAPTER, max: MAX_VERSES_PER_CHAPTER });
  return { book: match.name, chapter, verse, reference: `${match.name} ${chapter}:${verse}` };
}

/** Builds synthetic (non-scriptural) placeholder text shaped like a translated verse. */
export function getRandomVerseText(): string {
  return faker.lorem.sentences({ min: 1, max: 3 });
}

export function getRandomVerse(): ScriptureVerse {
  return { ...getRandomReference(), text: getRandomVerseText() };
}

export function getRandomVerses(count: number): ScriptureVerse[] {
  return Array.from({ length: count }, () => getRandomVerse());
}

function buildQuestionAnswer(ref: ScriptureReference): ScriptureQuestionAnswer {
  const template = faker.helpers.arrayElement(QUESTION_TEMPLATES);
  const question = template
    .replace('{reference}', ref.reference)
    .replace('{topic}', faker.word.noun());

  return { ...ref, question, answer: getRandomVerseText() };
}

/** Builds a synthetic (non-scriptural) question/answer pair tied to a random reference. */
export function getRandomQuestionAnswer(): ScriptureQuestionAnswer {
  return buildQuestionAnswer(getRandomReference());
}

export function getRandomQuestionAnswers(count: number): ScriptureQuestionAnswer[] {
  return Array.from({ length: count }, () => getRandomQuestionAnswer());
}

/** Builds a synthetic question/answer pair for a caller-supplied book/chapter (throws if invalid). */
export function getQuestionAnswerForChapter(book: string, chapter: number): ScriptureQuestionAnswer {
  return buildQuestionAnswer(getReferenceForChapter(book, chapter));
}

export function getQuestionAnswersForChapter(book: string, chapter: number, count: number): ScriptureQuestionAnswer[] {
  return Array.from({ length: count }, () => getQuestionAnswerForChapter(book, chapter));
}
