#!/usr/bin/env node

const { version } = require('../package.json');
import commander, { Command } from 'commander';
import { linesControl, RuleType, Rule } from './index';

const program = new Command();

const humanableCheckType = {
  [RuleType[RuleType.total]]: RuleType[RuleType.total],
  [RuleType[RuleType.totalInsertions]]: RuleType[RuleType.totalInsertions],
};

const rulesDescription = `Rules for checking.\nTypes: ${Object.keys(humanableCheckType).join(', ')};\nexample: total;50;src/**/*`;

const convertArgToRule = (stringArg: string) => {
  const attrs = stringArg.split(',');
  const checkTypeStr = (attrs[0] as unknown as RuleType);

  return {
    type: (checkTypeStr || RuleType.totalInsertions),
    maxNumber: parseInt(attrs[1] || '0', 10),
    pattern: attrs[2],
  };
};

const addRule = (value: string, previous: Rule[]) => {
  const rule = convertArgToRule(value);
  return previous.concat([rule])
}

const addComparisons = (value: string) => {
  const arr = value.split(',');

  if (arr.length > 2) {
    throw new commander.InvalidArgumentError('Two comparators at most.');
  }

  return arr;
}

program
  .option('-r, --rules <value...>', rulesDescription, addRule, [])
  .option('-c, --comparisons <value>', 'Comparison of commits and branches', addComparisons)
  .version(version, '-v, --vers', 'output the current version')
  .showSuggestionAfterError()
  program.addHelpText('after', `
  Example call:
    $ lines-control --rules total,25 totalInsertions,5,src/**/* -w
    $ lines-control --rules total,25 --comparisons master,feature/test-branch-name
    $ lines-control --rules total,25 --comparisons main
  `);

program.parse(process.argv);

const options = program.opts();

const convertComparisonsFromArrToObj = (arr: string[]) => {
  if (arr.length === 2) {
    return {
      from: arr[0],
      to: arr[1],
    };
  }

  return {
    to: arr[0],
  };
}

const comparisons = convertComparisonsFromArrToObj(options.comparisons);
const result = linesControl(options.rules, comparisons);

if (result) {
  console.log('All right!');
} else {
  console.log('This repo would like a smaller update');
  if (!options.silent) {
    process.exit(1);
  }
}
