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
          added: 9,
          deleted: 0,
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
          added: 10,
          deleted: 0,
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
          added: 11,
          deleted: 0,
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
          added: 1,
          deleted: 9,
          path: 'x',
        }],
        expected: true,
      },
    ],
  ])('should return a status for %s', (_, { checks, total, changes, expected }) => {
    expect(linesControl(checks, changes)).toBe(expected);
  });
});
