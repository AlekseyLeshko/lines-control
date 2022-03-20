import { execSync } from 'child_process';
import minimatch from 'minimatch';
import { getGitDiff, FileChange } from '@alekseyleshko/git-diff';

type NotBinaryFileChange = Omit<FileChange, 'insertions' | 'deletions'> & {
  insertions: number;
  deletions: number;
};

export const isLinesControlPass = (rules: Rule[] = [], comparisons?: Compare) => {
  const changes = getGitDiff(comparisons).filter(isNotBinaryFile)

  return rules
    .map(rule => ({ ...rule, result: getResult(rule, changes) }))
    .every(item => item.result);
}

export default isLinesControlPass;

type Options = {
  successfulText?: string,
  failedText?: string,
}

export const linesControl = (rules: Rule[] = [], comparisons?: Compare, options?: Options) => {
  const result = isLinesControlPass(rules, comparisons);
  const {
    successfulText = 'All right!',
    failedText = 'This repo would like a smaller update.',
  }= options || {};

  if (result) {
    console.log(successfulText);
    return;
  }

  console.error(failedText);
  process.exit(1);
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

const getTotal = (change: NotBinaryFileChange) => change.insertions + change.deletions;
const getTotalInsertions = (change: NotBinaryFileChange) => change.insertions;

const getSum = (changes: NotBinaryFileChange[], adder: (arg0: NotBinaryFileChange) => number) => changes.reduce((acc, change) => acc += adder(change), 0)

const getAdder = (rule: Rule) => {
  if (rule.type === RuleType.totalInsertions) return getTotalInsertions;

  return getTotal;
}

const getResult = (rule: Rule, changes: NotBinaryFileChange[]) => {
  const flteredChanges = changes.filter(change => rule.pattern ? minimatch(change.path, rule.pattern) : true)
  const adder = getAdder(rule);
  const sum = getSum(flteredChanges, adder);

  return sum <= rule.maxNumber;
}

const isNotBinaryFile = (change: FileChange | NotBinaryFileChange): change is NotBinaryFileChange => Number.isInteger(change.insertions) && Number.isInteger(change.deletions)

