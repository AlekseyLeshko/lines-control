import { execSync } from 'child_process';

type FileChange = {
  insertions: number,
  deletions: number,
  path: string,
}

export enum CheckType {
  total,
  totalInsertions,
}

type Check = {
  type: CheckType,
  maxNumber: number,
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

const getGitOutput = () => {
  // TODO: and master
  const defaultBranchName = 'main';

  const branchName =  defaultBranchName;
  const cmd = `git diff origin/${branchName} --numstat`;
  const gitOutput = execSync(cmd).toString();
  return gitOutput;
}

const getChanges = () => {
  const gitOutput = getGitOutput();
  const changes = parseGitOutput(gitOutput);

  return changes;
}

export const linesControl = (checks: Check[] = []) => {
  const changes = getChanges();

  const checkResults = checks.map((check) => ({
    ...check,
    result: getResult(check, changes),
  }));

  return Boolean(checkResults.length) ? checkResults.some(item => item.result) : true;
}
