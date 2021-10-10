const { linesControl, CheckType } = require('./dist/index')

const checks = [{
  type: CheckType.total,
  maxNumber: 30,
}];

if (linesControl(checks, { to: 'HEAD^1' })) {
  console.log('All right!');
} else {
  console.log('This repo would like a smaller update');
  process.exit(1);
}
