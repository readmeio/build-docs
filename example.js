const buildDocs = require('./');

const source = `
/*
 * createUser: Creates a user in the database
 *
 * @param {string} name Name of the user
 * @throws {ValidationError} Must provide all required fields
 * @returns {Object} The created user object
 */`;

console.log(require('util').inspect(buildDocs(source), { depth: null })); // eslint-disable-line no-console
// [ { name: 'createUser',
//     description: 'Creates a user in the database',
//     params:
//      [ { title: 'name',
//          description: 'Name of the user',
//          type: 'string' } ],
//     throws:
//      [ { type: 'ValidationError',
//          description: 'Must provide all required fields' } ],
//     returns: { description: 'user The created user object', type: 'object' } } ]
