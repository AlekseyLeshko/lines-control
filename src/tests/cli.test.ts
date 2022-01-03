jest.mock('child_process')
import * as cp from 'child_process';
import { makeCliProgram } from '../makeCliProgram';

describe('lines control:cli', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('should work without any attributes', async () => {
    process.exit = jest.fn();
    console.error = jest.fn();
    console.log = jest.fn();

    const defaultBranch = 'main';
    const cmdToGetStat = `git diff ${defaultBranch} --numstat`;
    cp.execSync.mockReturnValueOnce(defaultBranch);

    const gitOutput = generateGitOutput();
    cp.execSync.mockImplementation(() => gitOutput);

    makeArgv();

    // Act
    const result = await makeCliProgram();

    // Asserts
    expect(process.exit).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(0);
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith('All right!');
    expect(cp.execSync).toHaveBeenCalledTimes(2);
    expect(cp.execSync).toHaveBeenLastCalledWith(cmdToGetStat);
  });

  test('should work with the master branch as default', async () => {
    process.exit = jest.fn();
    console.error = jest.fn();
    console.log = jest.fn();

    const defaultBranch = 'master';
    const cmdToGetStat = `git diff ${defaultBranch} --numstat`;
    cp.execSync.mockReturnValueOnce(`${defaultBranch}\n`);

    const gitOutput = generateGitOutput();
    cp.execSync.mockImplementation(() => gitOutput);

    makeArgv();

    // Act
    const result = await makeCliProgram();

    // Asserts
    expect(process.exit).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(0);
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith('All right!');
    expect(cp.execSync).toHaveBeenCalledTimes(2);
    expect(cp.execSync).toHaveBeenLastCalledWith(cmdToGetStat);
    expect(cp.execSync.mock.calls[1][0].includes('\n')).toBeFalsy();
  });
});

const generateGitOutput = (changes = []) =>
  changes.map(change => `${change.insertions}\t${change.deletions}\t${change.path}`).join('\n');

const makeArgv = (argv: string[] = []) => {
  const originalArgv = [...process.argv];
  process.argv = [
    originalArgv[0],
    originalArgv[1],
  ];
}
