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

var FAILING_FILE = __dirname + '/../tests/dummy/app/public/bad.scss';

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
describe('ember-cli-stylelint', function() {
  this.timeout(60000);

  afterEach(function() {
    fs.removeSync(FAILING_FILE);
  });

  describe('ember build output', () => {

    beforeEach(function(){
      writeBadFile();
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
          expect(result.stdout.match(/[^\r\n]+/g))
            .to.contain('ok 1 Chrome 69.0 - Stylelint: styles/app.scss should pass stylelint');
        });
      });

      it(`Fails if stylelint fails`, () => {
        writeBadFile();
        return emberTest().then( result => {
          expect(result.error).to.exist;
          expect(result.stdout.match(/[^\r\n]+/g))
            .to.contain('not ok 1 Chrome 69.0 - Stylelint: public/bad.scss should pass stylelint')
            .to.contain('ok 2 Chrome 69.0 - Stylelint: styles/app.scss should pass stylelint')
        });
      });
    });
  });
});
