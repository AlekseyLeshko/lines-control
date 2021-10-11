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

export enum RuleType {
  total,
  totalInsertions,
}

export type Rule = {
  type: RuleType,
  maxNumber: number,
  pattern?: string,
}

type CheckResult = Rule & {
  result: boolean,
}

const getTotal = (change: FileChange) => change.insertions + change.deletions;
const getTotalInsertions = (change: FileChange) => change.insertions;

const getSum = (changes: FileChange[], adder: (arg0: FileChange) => number) => changes.reduce((acc, change) => acc += adder(change), 0)

const getAdder = (rule: Rule) => {
  if (rule.type === RuleType.totalInsertions) return getTotalInsertions;

  return getTotal;
}

const getResult = (rule: Rule, changes: FileChange[]) => {
  const flteredChanges = changes.filter(change => rule.pattern ? minimatch(change.path, rule.pattern) : true)
  const adder = getAdder(rule);
  const sum = getSum(flteredChanges, adder);

  return sum <= rule.maxNumber;
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
  const defaultBranchName = 'master';
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

export const linesControl = (rules: Rule[] = [], comparisons?: Compare) => {
  const changes = getChanges(comparisons);
  const result = rules
    .map(rule => ({ ...rule, result: getResult(rule, changes) }))
    .every(item => item.result);

  return result
}
