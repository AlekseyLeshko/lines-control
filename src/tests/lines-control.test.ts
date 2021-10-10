jest.mock('child_process')
import * as childProcess from 'child_process';
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
    const gitOutput = generateGitOutput(changes);
    childProcess.execSync.mockImplementation(() => gitOutput);

    const actual = linesControl(checks);

    expect(childProcess.execSync).toHaveBeenCalled();
    expect(actual).toBe(expected);
  });

  describe('diff from X to Y', () => {
    beforeEach(() => {
      childProcess.execSync.mockReset();
    });

    test.each([
      [
        'the main and the current branch',
        {
          expected: 'git diff main --numstat'
        },
      ],
      [
        'master and feature/test-branch-name',
        {
          commitRange: {
            from: 'master',
            to: 'feature/test-branch-name',
          },
          expected: 'git diff master...feature/test-branch-name --numstat'
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
      const { execSync } = childProcess;
      execSync.mockImplementation(() => gitOutput);

      // Act
      const actual = linesControl(checks, commitRange);

      // Asserts
      expect(execSync).toHaveBeenCalledTimes(1);
      expect(execSync).toHaveBeenCalledWith(expected);

      expect(actual).toBeTruthy();
    });
  });
});

const generateGitOutput = (changes = []) =>
  changes.map(change => `${change.insertions}\t${change.deletions}\t${change.path}`).join('\n');
