import { validateCompletionDate } from '../src/features/habits/domain/validateCompletionDate';

describe('validateCompletionDate', () => {
  it.each(['2026-09-28', '2026-09-30', '2026-10-02'])(
    'accepts %s within the inclusive creation-to-today interval',
    (completion) => {
      expect(
        validateCompletionDate(completion, '2026-09-28', '2026-10-02'),
      ).toBeUndefined();
    },
  );

  it('accepts a habit created and completed today', () => {
    expect(() =>
      validateCompletionDate('2026-10-02', '2026-10-02', '2026-10-02'),
    ).not.toThrow();
  });

  it.each([
    ['2026-09-27', '2026-09-28', '2026-10-02'],
    ['2026-10-03', '2026-09-28', '2026-10-02'],
    ['2026-10-02', '2026-10-03', '2026-10-02'],
  ])(
    'rejects completion %s outside %s through %s',
    (completion, creation, today) => {
      expect(() => validateCompletionDate(completion, creation, today)).toThrow(
        RangeError,
      );
    },
  );

  it.each([
    ['2026-01-01', '2025-12-31', '2026-01-02'],
    ['2024-02-29', '2024-02-28', '2024-03-01'],
    ['0000-01-01', '0000-01-01', '9999-12-31'],
  ])('validates calendar boundaries: %s', (completion, creation, today) => {
    expect(() =>
      validateCompletionDate(completion, creation, today),
    ).not.toThrow();
  });

  it.each(['2026-02-29', '2026-1-01', '2026-10-02T00:00:00Z', ''])(
    'rejects malformed date %j in every argument',
    (invalid) => {
      expect(() =>
        validateCompletionDate(invalid, '2026-09-28', '2026-10-02'),
      ).toThrow(RangeError);
      expect(() =>
        validateCompletionDate('2026-10-01', invalid, '2026-10-02'),
      ).toThrow(RangeError);
      expect(() =>
        validateCompletionDate('2026-10-01', '2026-09-28', invalid),
      ).toThrow(RangeError);
    },
  );
});
