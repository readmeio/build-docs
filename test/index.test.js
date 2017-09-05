const assert = require('assert');
const fs = require('fs');

const docs = require('../');
const { JSON_SCHEMA_TYPES } = require('../lib/set-type');

describe('build-docs', () => {
  it('should return only the first block', () => {
    const description = 'Creates a user in the database';
    assert.deepEqual(docs(`
      /*
       * ${description}
       */

      /*
       * ${description}
       */
    `).description, description);
  });

  it('should not error if there are no comments', () => {
    assert.deepEqual(docs(`
    module.exports = () => {}
    `, 'helloWorld').name, 'helloWorld');
  });

  it('should ignore comments without name', () => {
    const name = 'name';
    const description = 'Creates a user in the database';
    const doc = docs(`
      /*
       * ${description}
       */

      // console.log('test')
    `, name);

    assert.equal(doc.name, name);
    assert.equal(doc.description, description);
  });

  describe('description', () => {
    it('should extract the description', () => {
      const description = 'Creates a user in the database';
      assert.deepEqual(docs(`
        /*
         * ${description}
         */
      `).description, description);
    });

    it('should not pick up the full description', () => {
      const description = 'Creates a user in the database';
      assert.deepEqual(docs(`
        /*
         * ${description}
         *
         * Full description
         */
      `).description, description);
    });
  });

  describe('fullDescription', () => {
    it('should extract the fullDescription', () => {
      const fullDescription = 'Creates a user in the database';
      assert.equal(docs(`
        /*
         * description
         * ${fullDescription}
         * @param {string} name Name of the user
         */

        /*
         * description
         *
         * ${fullDescription}
         */

        /*
         * description
         *
         * ${fullDescription}
         * @param {string} name Name of the user
         */
      `).fullDescription, fullDescription);
    });

    it('should extract multi-line fullDescription', () => {
      const multiLineFullDescription = ['line-1', 'line-2', 'line-3'];
      assert.equal(docs(`
        /*
         * description
${multiLineFullDescription.map(desc => `           * ${desc}`).join('\n')}
         * @param {string} name Name of the user
         */
      `).fullDescription, multiLineFullDescription.join(' '));
    });

    it('should default to empty string', () => {
      assert.deepEqual(docs(`
        /*
         * description
         */
      `).fullDescription, '');
    });
  });

  describe('@param', () => {
    function testParam(comments, expected) {
      if (!Array.isArray(comments)) {
        comments = [comments]; // eslint-disable-line no-param-reassign
      }

      if (!Array.isArray(expected)) {
        expected = [expected]; // eslint-disable-line no-param-reassign
      }

      // This is sketchy... but it works
      assert.deepEqual(docs(`
        /* description
${comments.map(comment => `           * @param ${comment}`).join('\n')}
         */
      `).params, expected);
    }

    function testInvalidType(type) {
      assert.throws(() => {
        docs(`
        /* description
         * @param {${type}} name - name of the user
         */`);
      }, /Invalid type ".*" - Type must be: null, boolean, object, array, number, string/);
    }

    it('should throw for invalid type', () => {
      testInvalidType('asddsadsadsa');
      testInvalidType('BOOLEANS[]');
    });

    it('should not allow objects', () => {
      assert.throws(() => {
        docs(`
        /* description
         * @param {object} name - name of the user
         */`);
      }, /Invalid Param - Nested objects are not supported./);
    });

    it('should not allow array of objects', () => {
      assert.throws(() => {
        docs(`
        /* description
         * @param {Object[]} users - users
         * @param {string} users.name - users
         */`);
      }, /Invalid Param - Nested objects are not supported./);
    });

    function testValidType(type) {
      if (type === 'object') return assert(true);
      return assert.doesNotThrow(() => {
        docs(`
        /* description
         * @param {${type}} name - name of the user
         */`);
      });
    }

    // http://json-schema.org/latest/json-schema-core.html#rfc.section.4.2
    it('should not throw for valid types', () => {
      JSON_SCHEMA_TYPES.map(testValidType);
      testValidType('string[]');
      testValidType('number[]');
    });

    it('should allow any casing for type', () => {
      testParam('{String} name - Name of the user', {
        type: 'string',
        title: 'name',
        description: 'Name of the user',
      });
    });

    it('should allow dash between name and description', () => {
      testParam('{string} name - Name of the user', {
        type: 'string',
        title: 'name',
        description: 'Name of the user',
      });
    });

    it('should extract primitives from comments', () => {
      testParam('{string} name Name of the user', {
        type: 'string',
        title: 'name',
        description: 'Name of the user',
      });
    });

    it('should extract arrays of primitives from comments', () => {
      testParam('{string[]} interests Interests of the user', {
        type: 'array',
        items: {
          type: 'string',
        },
        title: 'interests',
        description: 'Interests of the user',
      });
    });

    it('should extract multi word exampleData', () => {
      testParam('{string} name="Marc Cuva" Name of the user', {
        type: 'string',
        title: 'name',
        exampleData: 'Marc Cuva',
        description: 'Name of the user',
      });
    });

    it('should extract single word exampleData', () => {
      testParam('{string} name=Marc Name of the user', {
        type: 'string',
        title: 'name',
        exampleData: 'Marc',
        description: 'Name of the user',
      });
    });

    it('should extract number exampleData', () => {
      testParam('{number} name=12 Age of the user', {
        type: 'number',
        title: 'name',
        exampleData: 12,
        description: 'Age of the user',
      });
    });

    it('should extract boolean exampleData', () => {
      testParam('{boolean} bald=false - Is the user bald', {
        type: 'boolean',
        title: 'bald',
        exampleData: false,
        description: 'Is the user bald',
      });
    });

    it('should extract array exampleData', () => {
      testParam('{number[]} numbers=[1,2,3] - Array of numbers', {
        type: 'array',
        title: 'numbers',
        exampleData: [1, 2, 3],
        items: {
          type: 'number',
        },
        description: 'Array of numbers',
      });
    });
  });

  describe('@throws', () => {
    function testThrows(comments, expected) {
      if (!Array.isArray(comments)) {
        comments = [comments]; // eslint-disable-line no-param-reassign
      }

      if (!Array.isArray(expected)) {
        expected = [expected]; // eslint-disable-line no-param-reassign
      }

      // This is sketchy... but it works
      assert.deepEqual(docs(`
        /* description
${comments.map(comment => `           * @throws ${comment}`).join('\n')}
         */
      `).throws, expected);

      // Should also work with @error
      assert.deepEqual(docs(`
        /* description
${comments.map(comment => `           * @error ${comment}`).join('\n')}
         */
      `).throws, expected);
    }

    it('should work with just a description', () => {
      const description = 'Will throw an error if the argument is null';

      testThrows(description, { description });
    });

    it('should work with just a type', () => {
      const type = '{ValidationError}';

      testThrows(type, { type: type.replace(/{|}/g, '') });
    });

    it('should work with type and description', () => {
      const type = '{ValidationError}';
      const description = 'Will throw an error if the argument is null';

      testThrows(`${type} ${description}`, { type: type.replace(/{|}/g, ''), description });
    });

    it('should work with template string format', () => {
      const type = '{ValidationError}';
      // eslint-disable-next-line no-template-curly-in-string
      const description = 'Will throw an ${test} error if the argument is null ${x}';

      testThrows(`${type} ${description}`, { type: type.replace(/{|}/g, ''), description });
    });
  });

  describe('errors', () => {
    it('should export an object of error types and compiled template functions', () => {
      const errors = docs([
        '/*',
        // eslint-disable-next-line no-template-curly-in-string
        '* @throws {ValidationError} Will throw an ${test} error if the argument is null ${x}',
        // eslint-disable-next-line no-template-curly-in-string
        '* @throws {AnotherError} You cant do ${y}',
        '*/',
      ].join('\n')).errors;

      assert.deepEqual(Object.keys(errors), ['ValidationError', 'AnotherError']);
      assert.deepEqual(errors.ValidationError({ test: 'a', x: 'b' }),
        'Will throw an a error if the argument is null b');
      assert.deepEqual(errors.AnotherError({ y: 'c' }), 'You cant do c');
    });

    describe('toString()', () => {
      it('should output source code', () => {
        const errors = docs([
          '/*',
          // eslint-disable-next-line no-template-curly-in-string
          '* @throws {ValidationError} Will throw an ${test} error if the argument is null ${x}',
          '*/',
        ].join('\n')).errors;

        assert.equal(typeof errors.toString().ValidationError.toString(), 'string');
      });
    });
  });

  describe('alternative comment styles', () => {
    // This style can't be supported because esprima picks each
    // line up as a new comment because technically it starts/ends
    // on the same line
    it.skip('single line comments', () => {
      const description = 'Creates a user in the database';
      assert.deepEqual(docs(`
        //
        // ${description}
        //
      `).description, description);
    });

    it('marc-style comments', () => {
      const description = 'Creates a user in the database';
      assert.deepEqual(docs(`
        /*
          ${description}
         */
      `).description, description);
    });
  });

  describe('@secret', () => {
    function testSecrets(comments, expected) {
      if (!Array.isArray(comments)) {
        comments = [comments]; // eslint-disable-line no-param-reassign
      }

      // This is sketchy... but it works
      assert.deepEqual(docs(`
        /* description
${comments.map(comment => `           * @secret ${comment}`).join('\n')}
         */
      `).secrets[0], expected);
    }

    it('should get key and description', () => {
      testSecrets('key Description of the secret', {
        key: 'key',
        description: 'Description of the secret',
      });
    });

    it('should return an empty array if no @secret', () => {
      assert.equal(docs(`
        /*
         * test
         */
      `).secrets.length, 0);
    });
  });

  describe('@returns', () => {
    function testReturns(comments, expected) {
      if (!Array.isArray(comments)) {
        comments = [comments]; // eslint-disable-line no-param-reassign
      }

      // This is sketchy... but it works
      assert.deepEqual(docs(`
        /* description
${comments.map(comment => `           * @returns ${comment}`).join('\n')}
         */
      `).returns, expected);
    }

    it('should extract primitives from comments', () => {
      testReturns('{string} Name of the user', {
        type: 'string',
        description: 'Name of the user',
      });
    });

    it('should return null if no @returns', () => {
      assert.equal(String(docs(`
        /*
         * test
         */
      `).returns), 'null');
    });

    it('should extract arrays of primitives from comments', () => {
      testReturns('{string[]} Interests of the user', {
        type: 'array',
        items: {
          type: 'string',
        },
        description: 'Interests of the user',
      });
    });

    it('should correctly work with object arrays', () => {
      testReturns('{Object[]} Interests of the user', {
        type: 'array',
        items: {
          type: 'object',
        },
        description: 'Interests of the user',
      });
    });

    it('should extract objects ', () => {
      testReturns('{Object} Address of the user', {
        type: 'object',
        description: 'Address of the user',
      });
    });

    it('should only take the first return value', () => {
      testReturns([
        '{string} Name of the user',
        '{string} Name of the user1',
      ], {
        type: 'string',
        description: 'Name of the user',
      });
    });
  });

  describe('complete example', () => {
    it('should work for a full example', () => {
      const actual = fs.readFileSync(`${__dirname}/fixtures/createUser.js`);
      const expected = fs.readFileSync(`${__dirname}/fixtures/expected.json`);

      assert.deepEqual(`${JSON.stringify(docs(actual, 'createUser'), null, 2)}\n`, expected.toString());
    });
  });
});
