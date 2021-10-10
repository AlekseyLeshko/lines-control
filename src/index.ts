type FileChange = {
  added: number,
  deleted: number,
  path: string,
}

const getTotal = (change: FileChange) => change.added + change.deleted;

export const linesControl = (total: number, changes: FileChange[] = []) => {
  if (!total) return true;

  return changes.reduce((acc, change) => acc += getTotal(change), 0) <= total;
}
