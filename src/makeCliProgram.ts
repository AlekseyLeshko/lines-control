import { execSync } from 'child_process';
import commander, { Command } from 'commander';
import isLinesControlPass, { RuleType, Rule, linesControl } from './index';

const { version } = require('../package.json');

export function makeCliProgram() {
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

  const program = new Command();
  program
    .option('-r, --rules <value...>', rulesDescription, addRule, [])
    .option('-c, --comparisons <value>', 'Comparison of commits and branches', addComparisons)
    .version(version, '-v, --vers', 'output the current version')
    .showSuggestionAfterError()
    program.addHelpText('after', `
    Example call:
      $ lines-control --rules total,25 totalInsertions,5,src/**/*
      $ lines-control --rules total,25 --comparisons master,feature/test-branch-name
      $ lines-control --rules total,25 --comparisons main
    `);

  program.parse(process.argv);

  const convertComparisonsFromArrToObj = (arr?: string[]) => {
    if (!arr) {
      return { to: getDefaultBranch() };
    }

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

  const options = program.opts();
  const comparisons = convertComparisonsFromArrToObj(options.comparisons);

  linesControl(options.rules, comparisons);
}

const getDefaultBranch = () => {
  const cmd = '[ -f $(git rev-parse --show-toplevel)/.git/refs/heads/master ] && echo master || echo main';
  const defaultBranch = execSync(cmd).toString().trim();
  return defaultBranch;
}
