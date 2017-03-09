const assert = require('assert');

const docs = require('../');

describe('build-docs', () => {
  describe('#extract()', () => {
    describe('description', () => {
      it('should extract the description', () => {
        const description = 'Creates a user in the database';
        assert.deepEqual(docs.extract(`
          /*
           * ${description}
           */
        `).description, description);
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
        assert.deepEqual(docs.extract(`
          /*
${comments.map(comment => `           * @param ${comment}`).join('\n')}
           */
        `).params, expected);
      }

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

      it('should correctly work with object arrays', () => {
        testParam('{Object[]} interests Interests of the user', {
          type: 'array',
          items: {
            type: 'object',
          },
          title: 'interests',
          description: 'Interests of the user',
        });
      });

      it('should extract objects ', () => {
        testParam('{Object} address Address of the user', {
          type: 'object',
          title: 'address',
          description: 'Address of the user',
        });
      });

      it('should extract nested objects', () => {
        testParam([
          '{Object} address Address of the user',
          '{string} address.street Street of the user',
          '{string} address.city City of the user',
          '{string} address.state State of the user',
          '{string} address.zip Zip code of the user',
        ], {
          type: 'object',
          title: 'address',
          description: 'Address of the user',
          properties: {
            street: { type: 'string', description: 'Street of the user' },
            city: { type: 'string', description: 'City of the user' },
            state: { type: 'string', description: 'State of the user' },
            zip: { type: 'string', description: 'Zip code of the user' },
          },
        });
      });

      it('should work for recursively nested objects');

      it('should extract arrays of nested objects', () => {
        testParam([
          '{Object[]} favouriteFoods Favourite foods of the user',
          '{string} favouriteFoods[].cuisine Name of the cuisine',
          '{string} favouriteFoods[].dish Favourite dish',
        ], {
          type: 'array',
          title: 'favouriteFoods',
          description: 'Favourite foods of the user',
          items: {
            type: 'object',
            properties: {
              cuisine: {
                type: 'string',
                description: 'Name of the cuisine',
              },
              dish: {
                type: 'string',
                description: 'Favourite dish',
              },
            },
          },
        });
      });
    });
  });
});
