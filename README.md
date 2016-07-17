
![dependencies](https://img.shields.io/david/billybonks/ember-cli-stylelint.svg)
![ember-observer](http://emberobserver.com/badges/ember-cli-stylelint.svg)
![downloads](https://img.shields.io/npm/dm/ember-cli-stylelint.svg)
![build](https://travis-ci.org/billybonks/ember-cli-stylelint.svg?branch=master)


# Ember-cli-stylelint

An Ember-CLI addon that allows easy integration with [stylelint](http://stylelint.io/)

## Installation

`ember install ember-cli-stylelint`

##Configuration

Linting configuration can be added in a
* a stylelint property in package.json
* a .stylelintrc file
* a stylelint.config.js file exporting a JS object

as required by [stylelint](http://stylelint.io/user-guide/configuration/).

the parent key is `styleLint`

## Options

`linterConfig` {Object}

Hash as specified by [stylelint](https://github.com/stylelint/stylelint/blob/master/docs/user-guide/node-api.md)

doesn't accept `files` option

`onError` {function}

A hook that allows you to do whatever you want

`testFailingFiles` {boolean}

If true it will generate a unit test if the file fails lint.

`testPassingFiles` {boolean}

If true it  will generate a unit test if the passes fails lint.

`generateTests` {boolean}

If true it will generate tests for both passing and failing tests, overrides the testPassingFiles and testFailingFiles

`disableConsoleLogging` {boolean}

If true it will disable logging of errors to console

## Running Tests

* `npm test`

## Development

All tests are currently contained in tests/runner.js. This uses Mocha/Chai, not Ember Testing. Tests can be run with:

npm test
You should also check that the dummy app's styles are still correctly compiled by running the ember app using ember s.

PRs are welcomed and should be issued to the master branch.
