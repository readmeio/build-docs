const buildDocs = require('./');

const source = `
/*
 * Creates a user in the database
 *
 * This creates a user in the database. Here you can add a
 * full description.
 *
 * @param {string} name Name of the user
 * @secret apiKey This is a secret value that will be required
 * @throws {ValidationError} Must provide all required fields
 * @returns {Object} The created user object
 */`;

console.log(require('util').inspect(buildDocs(source, 'createUser'), { depth: null })); // eslint-disable-line no-console
// { name: 'createUser',
//   description: 'Creates a user in the database',
//   fullDescription: 'This creates a user in the database. Here you can add a full description.',
//   params:
//    [ { title: 'name',
//        description: 'Name of the user',
//        type: 'string' } ],
//   throws:
//    [ { type: 'ValidationError',
//        description: 'Must provide all required fields' } ],
//   secrets:
//    [ { key: 'apiKey',
//        description: 'This is a secret value that will be required' } ],
//   returns: { description: 'The created user object', type: 'object' } }
