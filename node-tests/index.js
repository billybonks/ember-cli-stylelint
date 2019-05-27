/* global require, beforeEach, describe, afterEach, it */
const exec = require('child_process').exec;
const expect = require('chai').expect;
const fs = require('fs-extra');

function emberCommand(command) {
  return new Promise(function(resolve) {
    exec(`node_modules/.bin/ember ${command}`, { cwd: __dirname + '/..', env: process.env }, function (error, stdout, stderr) {
      resolve({
        error: error,
        stdout: stdout,
        stderr: stderr
      });
    });
  });
}

function emberTest() {
  return emberCommand('test');
}

function emberBuild() {
  return emberCommand('build');
}

function sanetizeResult(result) {
  let start = result.indexOf('Chrome') - 2
  let end = result.indexOf(']') + 4
  let match = result.substring(start, end);
  return result.replace(match,'')
}

var FAILING_FILE = __dirname + '/../tests/dummy/app/public/bad.scss';
var FAILING_CSS_FILE = __dirname + '/../tests/dummy/app/public/bad.css';
function writeBadFile(){
  fs.outputFileSync(FAILING_FILE, `
.should-error {

}

.color.must.be.named {
  color: #000000
}

#should-be-allowed-by-sass-lint-test-config-yml {
  color: green;
}
`);
}

function writeBadFileCss() {
  fs.outputFileSync(FAILING_CSS_FILE, `
.color.must.be.named {
  color: #000000
}
.should-error {

}
#should-be-allowed-by-sass-lint-test-config-yml {
  color: green;
}
`);
}
describe('ember-cli-stylelint', function() {
  this.timeout(60000);

  afterEach(function() {
    fs.removeSync(FAILING_FILE);
    fs.removeSync(FAILING_CSS_FILE);
  });

  describe('ember build output', () => {

    beforeEach(function(){
      writeBadFile();
      writeBadFileCss();
    })

    it(`doesn't build twice`, () => {
      return emberBuild().then( result => {
        let matchedLines = result.stdout.match(/[^\r\n]+/g).filter( (line) => {
          return line.includes('tests/dummy/app/public/bad.scss');
        });
        expect(matchedLines.length).to.equal(1);
      });
    });

    it(`displays failing output to console`, function(){
      return emberBuild().then( result => {
        expect(result.error).to.not.exist;
        expect(result.stdout.match(/[^\r\n]+/g))
          .to.contain('tests/dummy/app/public/bad.css')
          .to.contain(' 3:10  ✖  Expected "#000000" to be "black"   color-named   ')
          .to.contain(' 5:15  ✖  Unexpected empty block             block-no-empty')
          .to.contain('tests/dummy/app/public/bad.scss')
          .to.contain(' 2:15  ✖  Unexpected empty block             block-no-empty')
          .to.contain(' 7:10  ✖  Expected "#000000" to be "black"   color-named')
      });
    });
  })

  describe('generated tests',  () => {
    describe('no grouping', () => {
      it(`doesn't generate 2 tests`, () => {
        return emberTest().then( result => {
          let matchedLines = result.stdout.match(/[^\r\n]+/g).filter( (line) => {
            return line.includes('Stylelint: styles/app.scss should pass stylelint');
          });
          expect(matchedLines.length).to.equal(1);
        });
      });

      it(`Passes if stylelint passes`, () => {
        return emberTest().then( result => {
          expect(result.error).to.not.exist;
          expect(result.stdout.match(/[^\r\n]+/g).map(sanetizeResult))
          .to.contain('ok Stylelint: styles/app.scss should pass stylelint');
        });
      });

      it(`Fails if stylelint fails`, () => {
        writeBadFile();
        return emberTest().then( result => {
          expect(result.error).to.exist;
          expect(result.stdout.match(/[^\r\n]+/g).map(sanetizeResult))
          .to.contain('not ok Stylelint: public/bad.scss should pass stylelint')
          .to.contain('ok Stylelint: styles/app.scss should pass stylelint')
        });
      });
    });
  });
});
