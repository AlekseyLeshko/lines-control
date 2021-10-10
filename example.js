const { linesControl, CheckType } = require('./dist/index')

const checks = [{
  type: CheckType.totalInsertions,
  maxNumber: 4000,
}];
console.log(linesControl(checks));
