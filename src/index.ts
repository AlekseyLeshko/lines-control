type FileChange = {
  insertions: number,
  deletions: number,
  path: string,
}

export enum CheckType {
  total,
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

const getSum = (changes: FileChange[]) => changes.reduce((acc, change) => acc += getTotal(change), 0)

const getResult = (check: Check, changes: FileChange[]) => {
  if (check.type === CheckType.total) {
    const sum = getSum(changes);
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
