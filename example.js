const { isLinesControlPass, RuleType } = require('./dist/index')

const checks = [{
  type: RuleType.total,
  maxNumber: 30,
  pattern: '!**/tests/*'
}];

if (isLinesControlPass(checks, { to: 'HEAD^1' })) {
  console.log('All right!');
} else {
  console.log('This repo would like a smaller update');
  process.exit(1);
}
