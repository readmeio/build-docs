const os = require('os');
const fs = require('fs');
const assert = require('assert');
const rimraf = require('rimraf');
const { join } = require('path');

const { parseDirectory } = require('../');

let cwd;
let tmpDir;

const files = {
  hello: {
    description: 'Description of hello',
  },
  goodbye: {
    description: 'Description of goodbye',
  },
};

describe('parse-directory', () => {
  beforeEach(() => {
    cwd = process.cwd();

    tmpDir = fs.mkdtempSync(`${os.tmpdir()}/`);

    process.chdir(tmpDir);
  });

  beforeEach(() => {
    Object.keys(files).forEach((file) => {
      fs.writeFileSync(join(tmpDir, `${file}.js`), `
        /*
         * ${file}: ${files[file].description}
         */
      `);
    });
  });

  afterEach(() => {
    rimraf.sync(tmpDir);
  });

  afterEach(() => {
    process.chdir(cwd);
  });

  it('should read all files and parse out comments', () => {
    const docs = parseDirectory(tmpDir);

    assert.equal(docs.length, 2);
    assert.deepEqual(docs.map(doc => doc.name), ['goodbye', 'hello']);
  });

  it('should ignore non-js files', () => {
    fs.writeFileSync(join(tmpDir, 'text-file.txt'), `
      /*
       * This shouldn't be picked up
       */
    `);

    const docs = parseDirectory(tmpDir);
    assert.equal(docs.length, 2);
  });
});
