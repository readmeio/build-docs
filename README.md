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
 * createUser: Creates a user in the database
 *
 * This creates a user in the database. Here you can add a
 * full description.
 *
 * @param {string} name Name of the user
 * @throws {ValidationError} Must provide all required fields
 * @returns {Object} The created user object
 */`;

console.log(require('util').inspect(buildDocs(source), { depth: null }));
// [ { name: 'createUser',
//     description: 'Creates a user in the database',
//     fullDescription: 'This creates a user in the database. Here you can add a full description.',
//     params:
//      [ { title: 'name',
//          description: 'Name of the user',
//          type: 'string' } ],
//     throws:
//      [ { type: 'ValidationError',
//          description: 'Must provide all required fields' } ],
//     returns: { description: 'The created user object', type: 'object' } } ]
```

### `const docs = buildDocs(source)`

- `source` is a string of source code with comments to parse

The object returned is an array of objects with the following properties:

- `name` - the name of the action - [docs](#name)
- `description` - the description of the action - [docs](#description)
- `fullDescription` - a longer description of the action which can be multiline - [docs](#fullDescription)
- `params` - an array of the `@param` comment types - [docs](#param)
- `throws` - an array of the `@throws` comment types - [docs](#throws)

#### `name`
The name can be written in 2 different forms:

As a string before your description:

```js
/*
 * name: function description
 */
```

Or using the `@name` block tag:

```js
/*
 * @name name
 */
```

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

Arrays:

```js
/*
 * @param {string[]} interests Interests of the user
 */
```

Objects with nested properties:

```js
/*
 * @param {Object} address Address of the user
 * @param {string} address.street Street of the user
 * @param {string} address.city City of the user
 * @param {string} address.state State of the user
 * @param {string} address.zip Zip code of the user
 */
```

Arrays of objects with nested properties

```js
/*
 * @param {Object[]} favouriteFoods Favourite foods of the user
 * @param {string} favouriteFoods[].cuisine Name of the cuisine
 * @param {string} favouriteFoods[].dish Favourite dish
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

#### `@returns`
We support the same syntax as [jsdoc](http://usejsdoc.org/tags-returns.html).

```js
/*
 * @returns {string} Name of the user
 */
```

## Credits
[Dom Harrington](https://github.com/domharrington)
