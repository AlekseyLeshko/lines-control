# lines-control
This tool should you control the scope of diff changes


## Install
```
$ npm i lines-control -D
or
$ yarn add lines-control -D
```

## Usage
### Terminal example
You can use this module in your terminal.
```
$ lines-control --rules total,50
$ lines-control --rules total,50,src/**/*
$ lines-control --rules total,50,src/**/* totalInsertions,5,webpack/**/*
$ lines-control --rules total,50,src/**/* --comparisons origin/main
$ lines-control --rules total,50,src/**/* --comparisons origin/main,/feature-x
$ lines-control --rules total,50,src/**/* --comparisons origin/feature-x,origin/feature-y
$ lines-control --rules total,50,src/**/* totalInsertions,5,webpack/**/* --comparisons origin/feature-x,origin/feature-y
```


### [lint-staged](https://github.com/okonet/lint-staged) example
You can check how many lines have been touched each time you create a commit.
```
{
  "lint-staged": {
    "*": "lines-control --rules total,50,src/**/*"
  }
}
```

### [husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged) example
You can check how many lines have been touched each time you create a commit.
```
//
{
  "lint-staged": {
    "*": "lines-control --rules total,50,src/**/*"
  }
}
```

### CI:[github actions](https://github.com/features/actions) example
You can create a CI step like
```
  lines-control:
    steps:
      - name: Load current commit
        uses: actions/checkout@v2
        with:
          ref: ${{ github.ref }}

     ...

      - name: Lines control
        run: yarn lines-control --rules totalInsertions,50 --comparisons origin/main
```


#### CLI help
```
$ npx lines-control -h

Usage: lines-control [options]

Options:
  -r, --rules <value...>     Rules for checking.
                             Types: total, totalInsertions;
                             example: total;50;src/**/* (default: [])
  -c, --comparisons <value>  Comparison of commits and branches
  -v, --vers                 output the current version
  -h, --help                 display help for command

  Example call:
    $ lines-control --rules total,25 totalInsertions,5,src/**/*
    $ lines-control --rules total,25 --comparisons master,feature/test-branch-name
    $ lines-control --rules total,25 --comparisons main
```
