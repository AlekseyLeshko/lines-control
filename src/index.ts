import { execSync } from 'child_process';
import minimatch from 'minimatch';

type FileChange = {
  insertions: number,
  deletions: number,
  path: string,
}

type Compare = {
  from?: string;
  to: string;
}

export enum CheckType {
  total,
  totalInsertions,
}

type Check = {
  type: CheckType,
  maxNumber: number,
  pattern?: string,
}

type CheckResult = Check & {
  result: boolean,
}

const getTotal = (change: FileChange) => change.insertions + change.deletions;
const getTotalInsertions = (change: FileChange) => change.insertions;

const getSum = (changes: FileChange[], adder: (arg0: FileChange) => number) => changes.reduce((acc, change) => acc += adder(change), 0)

const getAdder = (check: Check) => {
  if (check.type === CheckType.totalInsertions) return getTotalInsertions;

  return getTotal;
}

const getResult = (check: Check, changes: FileChange[]) => {
  const adder = getAdder(check);
  const sum = getSum(changes, adder);
  return sum <= check.maxNumber;
}

const parseGitOutput = (gitOutput: string) =>
  gitOutput
    .split('\n')
    .filter(line => line)
    .map((diffChage) => diffChage.split('\t'))
    .map(([a, b, path]) => ({
      insertions: parseInt(a, 10),
      deletions: parseInt(b, 10),
      path,
    }));

const getCommitRange = (comparisons?: Compare) => {
  const defaultBranchName = 'main';
  const { from, to = defaultBranchName } = comparisons || {};
  if (from && to) {
    return [from, to].join('...');
  }

  return to;
}

const getGitOutput = (comparisons?: Compare) => {
  const commitRange = getCommitRange(comparisons);
  const cmd = `git diff ${commitRange} --numstat`;
  const gitOutput = execSync(cmd).toString();
  return gitOutput;
}

const getChanges = (comparisons?: Compare) => {
  const gitOutput = getGitOutput(comparisons);
  const changes = parseGitOutput(gitOutput);

  return changes;
}

export const linesControl = (checks: Check[] = [], comparisons?: Compare) => {
  const changes = getChanges(comparisons);

  const checkResults = checks.map((check) => ({
    ...check,
    result: getResult(check, changes.filter(change => check.pattern ? minimatch(change.path, check.pattern) : true)),
  }));

  return Boolean(checkResults.length) ? checkResults.every(item => item.result) : true;
}
