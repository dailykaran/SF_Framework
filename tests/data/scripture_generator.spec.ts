import { test, expect } from '@playwright/test';
import {
  BOOKS,
  getRandomReference,
  getRandomVerse,
  getRandomVerses,
  getRandomQuestionAnswer,
  getRandomQuestionAnswers,
  getQuestionAnswerForChapter,
  getQuestionAnswersForChapter,
} from '../../src/utils/data';
import { createLogger, getSpecLogFilePath } from '../../src/utils/logger/logger';

const log = createLogger('scripture-generator', getSpecLogFilePath(__filename));

test.describe('scripture data generator', () => {
  test('generates a reference with a valid book, chapter and verse', () => {
    const ref = getRandomReference();
    const book = BOOKS.find((b) => b.name === ref.book);

    expect(book).toBeDefined();
    expect(ref.chapter).toBeGreaterThanOrEqual(1);
    expect(ref.chapter).toBeLessThanOrEqual(book!.chapters);
    expect(ref.verse).toBeGreaterThanOrEqual(1);
    expect(ref.reference).toBe(`${ref.book} ${ref.chapter}:${ref.verse}`);
    log.info('Generated reference', { reference: ref.reference, book: ref.book, chapter: ref.chapter, verse: ref.verse });
  });

  test('generates a verse with non-empty placeholder text', () => {
    const verse = getRandomVerse();
    expect(verse.text.length).toBeGreaterThan(0);
    log.info('Generated verse', { reference: verse.reference, text: verse.text });
  });

  test('generates multiple verses', () => {
    const verses = getRandomVerses(5);
    log.info('Generated verses', { count: verses.length });
    expect(verses).toHaveLength(5);
    for (const verse of verses) {
      log.info('Generated verse', { reference: verse.reference, text: verse.text });
      expect(verse.text.length).toBeGreaterThan(0);
      log.info('Generated verse', { reference: verse.reference, text: verse.text });
    }
  });

  test('generates a question/answer pair tied to a reference', () => {
    const qa = getRandomQuestionAnswer();
    log.info('Generated Q&A', { reference: qa.reference, question: qa.question, answer: qa.answer });

    expect(qa.question).toContain(qa.reference);
    expect(qa.question.endsWith('?') || qa.question.endsWith('.')).toBe(true);
    expect(qa.answer.length).toBeGreaterThan(0);
  });

  test('generates multiple question/answer pairs', () => {
    const qas = getRandomQuestionAnswers(5);
    expect(qas).toHaveLength(5);
    for (const qa of qas) {
      expect(qa.question).toContain(qa.reference);
      expect(qa.answer.length).toBeGreaterThan(0);
    }
  });

  test('generates a question/answer pair for a given book and chapter', () => {
    const qa = getQuestionAnswerForChapter('3 John', 1);

    expect(qa.book).toBe('3 John');
    expect(qa.chapter).toBe(1);
    expect(qa.reference).toBe(`3 John 1:${qa.verse}`);
    expect(qa.answer.length).toBeGreaterThan(0);
  });

  test('generates multiple question/answer pairs for a given book and chapter', () => {
    const qas = getQuestionAnswersForChapter('Philippians', 2, 3);

    expect(qas).toHaveLength(3);
    for (const qa of qas) {
      expect(qa.book).toBe('Philippians');
      expect(qa.chapter).toBe(2);
    }
  });

  test('throws for an unknown book or out-of-range chapter', () => {
    expect(() => getQuestionAnswerForChapter('Not A Book', 1)).toThrow();
    expect(() => getQuestionAnswerForChapter('Jude', 2)).toThrow();
  });
});
