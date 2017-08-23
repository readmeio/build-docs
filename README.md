# build-docs
[![CircleCI](https://circleci.com/gh/readmeio/build-docs.svg?style=shield&circle-token=290d8bd7aa9bd23ba8eab645d7eaa3f810fdf310)](https://circleci.com/gh/readmeio/build-docs)

Library to extract inline comments out of your services

[![](https://d3vv6lp55qjaqc.cloudfront.net/items/1M3C3j0I0s0j3T362344/Untitled-2.png)](https://readme.io)

## Installation

With npm:
```
npm install build-docs --save
```

With yarn:
```
yarn add build-docs
```

## Usage

```js
const buildDocs = require('build-docs');

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

console.log(require('util').inspect(buildDocs(source, 'createUser'), { depth: null }));
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

```

### `const doc = require('build-docs')(source, name)`

- `source` is a string of source code with comments to parse
- `name` is the name of the action

The object returned is an object with the following properties:

- `name` - the name of the action - [docs](#name)
- `description` - the description of the action - [docs](#description)
- `fullDescription` - a longer description of the action which can be multiline - [docs](#fullDescription)
- `params` - an array of the `@param` comment types - [docs](#param)
- `secrets` - an array of the `@secret` comment types - [docs](#secret)
- `throws` - an array of the `@throws` comment types - [docs](#throws)
- `errors` - an object of all the possible errors from this action - [docs](#errors)
- `returns` - an object describing the return type - [docs](#throws)

### `const docs = require('build-docs').parseDirectory(directory)`

There is also a function to make build-docs look inside a directory and
parse docs out of all JS files in that directory. This uses the filename
(minus the extension) for the name of the action.

- `directory` is the folder

This returns an array of docs in the same format as described above.

#### `name`
The name is taken directly from the name you pass in

#### `description`
Description is written as the first line of text in your block comment

```js
/*
 * Function description
 */
```

#### `fullDescription`
Full description is written as 2nd first line of text in your block comment

```js
/*
 * Normal description
 *
 * This part becomes the full description
 * and it can be on multiple lines
 */
```

#### `@param`
We support the same syntax as [jsdoc](http://usejsdoc.org/tags-param.html).
We parse your format and output a valid [JSON Schema](http://json-schema.org/) for each @param.

Primitive types:

```js
/*
 * @param {string} name Name of the user
 * @param {number} age Age of the user
 */
```

#### `@secret`
If your service requires secret values from your users, this is how you request and access them.

```js
/*
 * @secret key Description of the secret
 */
```

#### `@throws`
We support the same syntax as [jsdoc](http://usejsdoc.org/tags-throws.html).

```js
/*
 * @throws free form error description
 * @throws {ErrorType} free form error description
 * @throws {JustAnErrorType}
 */
```

#### `errors`
For the following docs:

```js
/*
 * @throws {ErrorType} free form error description
 */
```

This will return an errors object like the following:

```js
{
  ErrorType: function () {}
}
```

The function is a compiled lodash template: https://lodash.com/docs/4.17.4#template

#### `@returns`
We support the same syntax as [jsdoc](http://usejsdoc.org/tags-returns.html).

```js
/*
 * @returns {string} Name of the user
 */
```

## Credits
[Dom Harrington](https://github.com/domharrington)
