#!/usr/bin/env node

const { version } = require('../package.json');
import commander, { Command } from 'commander';
import { linesControl, CheckType } from './index';

const program = new Command();

const convertStrToCheckType = (string: string) => {
  const checkTypeStr = CheckType[string as any];
  return CheckType[checkTypeStr as any];
}

const convertArgToRule = (stringArg: string) => {
  const attrs = stringArg.split(',');

  return {
    type: convertStrToCheckType(attrs[0]) || CheckType[0],
    maxNumber: attrs[1] || 0,
    pattern: attrs[2],
  };
};

const commaSeparatedList = (value: string, previous: any) => {
  const rule = convertArgToRule(value);
  return previous.concat([rule])
}

const humanableCheckType = {
  [CheckType[CheckType.total]]: CheckType[CheckType.total],
  [CheckType[CheckType.totalInsertions]]: CheckType[CheckType.totalInsertions],
};

const rulesDescription = `Rules for checking.\nTypes: ${Object.keys(humanableCheckType).join(', ')};\nexample: total;50;src/**/*`;

program
  .option('-r, --rules <value...>', rulesDescription, commaSeparatedList, [])

  //.option('-d, --debug', 'output extra debugging')
  //.option('-s, --silent', 'Do not throw an error')
  //.option('-v, --verbose', 'Do not throw an error')

  .option('-w, --with', 'Compare to a commit or branch', 'master')

  .option('--from', 'Compare from, a commit or branch', 'master')
  .option('--to', 'Compare to, a commit or branch', 'master')
  .version(version, '-v, --vers', 'output the current version')
  .showSuggestionAfterError()
  program.addHelpText('after', `
  Example call:
    $ lines-control --rules total,25 totalInsertions,5,src/**/* -w`);

program.parse(process.argv);

const options = program.opts();

if (options.to || options.from) {
  if (!(options.to && options.from)) {
    console.error('"to" and "from" should use together');
    process.exit(1);
  }
}

const result = linesControl(options.rules, { to: options.with || options.to, from: options.from });
//console.log(result);
if (result) {
  console.log('All right!');
} else {
  console.log('This repo would like a smaller update');
  if (!options.silent) {
    process.exit(1);
  }
}
