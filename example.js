const { RuleType, linesControl } = require('./dist/index')

const checks = [{
  type: RuleType.total,
  maxNumber: 30,
  pattern: '!**/tests/*'
}];

linesControl(checks, { to: 'HEAD^1' });
