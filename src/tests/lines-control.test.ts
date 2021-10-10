import { linesControl, CheckType } from '../index'

describe('lines control', () => {
  test.each([
    [
      'total check when no value is set',
      {
        checks: undefined,
        changes: undefined,
        expected: true,
      },
    ],
    [
      'total check when the total is 0',
      {
        checks: [{
          type: CheckType.total,
          maxNumber: 0,
        }],
        changes: [],
        expected: true,
      },
    ],
    [
      'total check when a file has changes less then the total',
      {
        checks: [{
          type: CheckType.total,
          maxNumber: 10,
        }],
        changes: [{
          insertions: 9,
          deletions: 0,
          path: 'x',
        }],
        expected: true,
      },
    ],
    [
      'total check when the file has changes equal to the total number of',
      {
        checks: [{
          type: CheckType.total,
          maxNumber: 10,
        }],
        changes: [{
          insertions: 10,
          deletions: 0,
          path: 'x',
        }],
        expected: true,
      },
    ],
    [
      'total check when a file has more changes than the total number of',
      {
        checks: [{
          type: CheckType.total,
          maxNumber: 10,
        }],
        changes: [{
          insertions: 11,
          deletions: 0,
          path: 'x',
        }],
        expected: false,
      },
    ],
    [
      'total check when the file has changes equal to the total number of',
      {
        checks: [{
          type: CheckType.total,
          maxNumber: 10,
        }],
        changes: [{
          insertions: 1,
          deletions: 9,
          path: 'x',
        }],
        expected: true,
      },
    ],
    [
      'total check when the file has insertion changes less to the total number of',
      {
        checks: [{
          type: CheckType.totalInsertions,
          maxNumber: 10,
        }],
        changes: [{
          insertions: 1,
          deletions: 11,
          path: 'x',
        }],
        expected: true,
      },
    ],
    [
      'total check when the file has insertion changes equal to the total number of',
      {
        checks: [{
          type: CheckType.totalInsertions,
          maxNumber: 10,
        }],
        changes: [{
          insertions: 10,
          deletions: 11,
          path: 'x',
        }],
        expected: true,
      },
    ],
    [
      'total check when the file has insertion changes more to the total number of',
      {
        checks: [{
          type: CheckType.totalInsertions,
          maxNumber: 10,
        }],
        changes: [{
          insertions: 11,
          deletions: 11,
          path: 'x',
        }],
        expected: false,
      },
    ],
  ])('should return a status for %s', (_, { checks, total, changes, expected }) => {
    expect(linesControl(checks, changes)).toBe(expected);
  });
});
