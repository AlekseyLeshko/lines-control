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

const getSum = (changes: FileChange[], adder: (arg0: CheckType) => number) => changes.reduce((acc, change) => acc += adder(change), 0)

const getAdder = (check: Check) => {
  if (check.type === CheckType.totalInsertions) return getTotalInsertions;

  return getTotal;
}

const getResult = (check: Check, changes: FileChange[]) => {
  const adder = getAdder(check);
  const sum = getSum(changes, adder);
  return sum <= check.maxNumber;
}

export const linesControl = (checks: Check[] = [], changes: FileChange[] = []) => {
  const arr = checks.map((check) => ({
    ...check,
    result: getResult(check, changes),
  }));

  return Boolean(arr.length) ? arr.some(item => item.result) : true;
}
