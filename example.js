const { linesControl, CheckType } = require('./dist/index')

const checks = [{
  type: CheckType.total,
  maxNumber: 0,
}];

if (linesControl(checks)) {
  console.log('All right!');
} else {
  console.log('This repo would like a smaller update');
}
