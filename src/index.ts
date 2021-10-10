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
  // pattern: string,
}

type CheckResult = Check & {
  result: boolean,
}

const getTotal = (change: FileChange) => change.insertions + change.deletions;
const getTotalInsertions = (change: FileChange) => change.insertions;

const getSum = (changes: FileChange[], adder: (arg0: CheckType) => number) => changes.reduce((acc, change) => acc += adder(change), 0)

const getResult = (check: Check, changes: FileChange[]) => {
  if (check.type === CheckType.total) {
    const sum = getSum(changes, getTotal);
    return sum <= check.maxNumber;
  }

  if (check.type === CheckType.totalInsertions) {
    const sum = getSum(changes, getTotalInsertions);
    return sum <= check.maxNumber;
  }

  return false;
}

export const linesControl = (checks: Check[] = [], changes: FileChange[] = []) => {
  const arr = checks.map((check) => ({
    ...check,
    result: getResult(check, changes),
  }));

  return Boolean(arr.length) ? arr.some(item => item.result) : true;
}
