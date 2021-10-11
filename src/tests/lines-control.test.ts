jest.mock('child_process')
import { execSync } from 'child_process';
import { linesControl, CheckType } from '../index'

describe('lines control', () => {
  beforeEach(() => {
    execSync.mockReset();
  });

  describe('checks', () => {
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
      const gitOutput = generateGitOutput(changes);
      execSync.mockImplementation(() => gitOutput);

      // Atc
      const actual = linesControl(checks);

      // Asserts
      expect(execSync).toHaveBeenCalledTimes(1);

      expect(actual).toBe(expected);
    });
  });

  describe('diff from X to Y', () => {
    test.each([
      [
        'the default branch:master and the current branch',
        {
          expected: 'git diff master --numstat'
        },
      ],
      [
        'main and feature/test-branch-name',
        {
          commitRange: {
            from: 'main',
            to: 'feature/test-branch-name',
          },
          expected: 'git diff main...feature/test-branch-name --numstat'
        },
      ],
      [
        'the current branch and feature/another-test-branch-name',
        {
          commitRange: {
            to: 'feature/another-test-branch-name',
          },
          expected: 'git diff feature/another-test-branch-name --numstat'
        },
      ],
      [
        'a commit and another commit',
        {
          commitRange: {
            from: '68216e54cad82a9071f875363571bbe78f358ba',
            to: '428aadc7463de53b9e7423a7d456daf79d4b992e',
          },
          expected: 'git diff 68216e54cad82a9071f875363571bbe78f358ba...428aadc7463de53b9e7423a7d456daf79d4b992e --numstat'
        },
      ],
    ])('should compare with %s', (_, { commitRange, expected }) => {
      const checks = [{
        type: CheckType.total,
        maxNumber: 10,
      }];
      const changes = [{
        insertions: 10,
        deletions: 0,
        path: 'x',
      }];
      const gitOutput = generateGitOutput(changes);
      execSync.mockImplementation(() => gitOutput);

      // Act
      const actual = linesControl(checks, commitRange);

      // Asserts
      expect(execSync).toHaveBeenCalledTimes(1);
      expect(execSync).toHaveBeenCalledWith(expected);

      expect(actual).toBeTruthy();
    });
  });

  describe('with a file pattern', () => {
    test.each([
      [
        'without a file pattern',
        {
          checks: [{
            type: CheckType.total,
            maxNumber: 20,
          }],
          expected: true,
        },
      ],
      [
        'a file pattern is undefined',
        {
          checks: [{
            type: CheckType.total,
            maxNumber: 20,
            pattern: undefined,
          }],
          expected: true,
        },
      ],
      [
        'return the result taking into account all the checks',
        {
          checks: [{
            type: CheckType.total,
            maxNumber: 100,
          }, {
            type: CheckType.total,
            maxNumber: 1,
          }],
          expected: false,
        },
      ],
      [
        'take one file',
        {
          checks: [{
            type: CheckType.total,
            maxNumber: 3,
            pattern: 'aaa/bbb/y'
          }],
          expected: true,
        },
      ],
      [
        'take all files in a direcotry',
        {
          checks: [{
            type: CheckType.total,
            maxNumber: 10,
            pattern: 'aaa/bbb/*'
          }],
          expected: true,
        },
      ],
      [
        'take all files in a direcotry with the total insertions type',
        {
          checks: [{
            type: CheckType.totalInsertions,
            maxNumber: 9,
            pattern: 'aaa/bbb/*'
          }],
          expected: true,
        },
      ],
      [
        'take all files without one file',
        {
          checks: [{
            type: CheckType.total,
            maxNumber: 10,
            pattern: '!aaa/z'
          }],
          expected: true,
        },
      ],
    ])('should %s', (_, { checks, expected }) => {
      const changes = [{
        insertions: 7,
        deletions: 0,
        path: 'aaa/bbb/x',
      }, {
        insertions: 2,
        deletions: 1,
        path: 'aaa/bbb/y',
      }, {
        insertions: 5,
        deletions: 4,
        path: 'aaa/z',
      }];
      const gitOutput = generateGitOutput(changes);
      execSync.mockImplementation(() => gitOutput);

      // Act
      const actual = linesControl(checks);

      // Asserts
      expect(execSync).toHaveBeenCalledTimes(1);

      expect(actual).toBe(expected);
    });
  });
});

const generateGitOutput = (changes = []) =>
  changes.map(change => `${change.insertions}\t${change.deletions}\t${change.path}`).join('\n');
