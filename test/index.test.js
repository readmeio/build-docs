const assert = require('assert');
const fs = require('fs');

const docs = require('../');
const { JSON_SCHEMA_TYPES } = require('../lib/set-type');

describe('build-docs', () => {
  it('should work for multiple blocks', () => {
    const description = 'Creates a user in the database';
    assert.deepEqual(docs(`
      /*
       * name: ${description}
       */

      /*
       * name2: ${description}
       */
    `).map(a => a.description), [description, description]);
  });

  it('should ignore comments without name', () => {
    const name = 'name';
    const description = 'Creates a user in the database';
    assert.deepEqual(docs(`
      /*
       * ${name}: ${description}
       */

      // console.log('test')
    `, [name]).map(doc => ({ name: doc.name, description: doc.description })), [{ name, description }]);
  });

  describe('description', () => {
    it('should extract the description', () => {
      const description = 'Creates a user in the database';
      assert.deepEqual(docs(`
        /*
         * name: ${description}
         */
      `)[0].description, description);
    });

    it('should not pick up the full description', () => {
      const description = 'Creates a user in the database';
      assert.deepEqual(docs(`
        /*
         * name: ${description}
         *
         * Full description
         */
      `)[0].description, description);
    });
  });

  describe('fullDescription', () => {
    it('should extract the fullDescription', () => {
      const fullDescription = 'Creates a user in the database';
      const fullDescriptions = docs(`
        /*
         * name: description
         * ${fullDescription}
         * @param {string} name Name of the user
         */

         /*
          * name: description
          *
          * ${fullDescription}
          */

          /*
           * name: description
           *
           * ${fullDescription}
           * @param {string} name Name of the user
           */
      `).map(doc => doc.fullDescription);

      fullDescriptions.map(fullDesc => assert.equal(fullDesc, fullDescription));
    });

    it('should extract multi-line fullDescription', () => {
      const multiLineFullDescription = ['line-1', 'line-2', 'line-3'];
      assert.equal(docs(`
        /*
         * name: description
${multiLineFullDescription.map(desc => `           * ${desc}`).join('\n')}
         * @param {string} name Name of the user
         */
      `)[0].fullDescription, multiLineFullDescription.join(' '));
    });

    it('should default to empty string', () => {
      assert.deepEqual(docs(`
        /*
         * name: description
         */
      `)[0].fullDescription, '');
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
        /* name: description
${comments.map(comment => `           * @param ${comment}`).join('\n')}
         */
      `)[0].params, expected);
    }

    function testInvalidType(type) {
      assert.throws(() => {
        docs(`
        /* name: description
         * @param {${type}} name - name of the user
         */`);
      }, /Invalid type - Must be a valid JSON schema primitive./);
    }

    it('should throw for invalid type', () => {
      testInvalidType('asddsadsadsa');
      testInvalidType('BOOLEAN');
      testInvalidType('String');
      testInvalidType('BOOLEAN[]');
    });

    it('should not allow objects', () => {
      assert.throws(() => {
        docs(`
        /* name: description
         * @param {object} name - name of the user
         */`);
      }, /Invalid Param - Nested objects are not supported./);
    });

    it('should not allow array of objects', () => {
      assert.throws(() => {
        docs(`
        /* name: description
         * @param {Object[]} users - users
         * @param {string} users.name - users
         */`);
      }, /Invalid Param - Nested objects are not supported./);
    });

    function testValidType(type) {
      if (type === 'object') return assert(true);
      return assert.doesNotThrow(() => {
        docs(`
        /* name: description
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
        /* name: description
${comments.map(comment => `           * @throws ${comment}`).join('\n')}
         */
      `)[0].throws, expected);
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
      `)[0].description, description);
    });

    it('marc-style comments', () => {
      const description = 'Creates a user in the database';
      assert.deepEqual(docs(`
        /*
          name: ${description}
         */
      `)[0].description, description);
    });
  });

  describe('@name', () => {
    it('should add a name based on the string before the description', () => {
      assert.equal(docs(`
        /*
         * action: Description
         */
      `)[0].name, 'action');
    });

    it('should default to name if no description', () => {
      assert.equal(docs(`
        /*
         * action
         */
      `)[0].name, 'action');
    });

    it('should add missing actions', () => {
      assert.equal(docs(`
        /*
         * action: description
         */
      `, ['action', 'test'])[1].name, 'test');
    });

    it('should remove docs for missing actions', () => {
      assert.equal(docs(`
        /*
         * action: description
         * notFound: description
         */
      `, ['action']).length, 1);
    });

    it('should add it with @name', () => {
      assert.equal(docs(`
        /*
         * Description
         *
         * @name action
         */
      `)[0].name, 'action');
    });

    it('should take the first @name', () => {
      assert.equal(docs(`
        /*
         * Description
         *
         * @name action
         * @name action1
         */
      `)[0].name, 'action');
    });
  });

  describe('@secret', () => {
    function testSecrets(comments, expected) {
      if (!Array.isArray(comments)) {
        comments = [comments]; // eslint-disable-line no-param-reassign
      }

      // This is sketchy... but it works
      assert.deepEqual(docs(`
        /* name: description
${comments.map(comment => `           * @secret ${comment}`).join('\n')}
         */
      `)[0].secrets[0], expected);
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
         * name: test
         */
      `)[0].secrets.length, 0);
    });
  });

  describe('@returns', () => {
    function testReturns(comments, expected) {
      if (!Array.isArray(comments)) {
        comments = [comments]; // eslint-disable-line no-param-reassign
      }

      // This is sketchy... but it works
      assert.deepEqual(docs(`
        /* name: description
${comments.map(comment => `           * @returns ${comment}`).join('\n')}
         */
      `)[0].returns, expected);
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
         * name: test
         */
      `)[0].returns), 'null');
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
      const actual = fs.readFileSync(`${__dirname}/fixtures/actual.js`);
      const expected = fs.readFileSync(`${__dirname}/fixtures/expected.json`);

      assert.deepEqual(`${JSON.stringify(docs(actual), null, 2)}\n`, expected.toString());
    });
  });
});
