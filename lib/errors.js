const template = require('lodash.template');

const interpolate = /\${([\s\S]+?)}/g;

function Errors(throws) {
  Object.assign(this, Object.keys(throws).reduce((errors, next) => {
    const error = throws[next];
    return Object.assign(errors, {
      [error.type]: template(error.description, { interpolate }),
    });
  }, {}));
}

Errors.prototype.toString = function toString() {
  return Object.keys(this).reduce((errors, next) => {
    return Object.assign(errors, {
      [next]: this[next].source,
    });
  }, {});
};

module.exports = (throws) => {
  return new Errors(throws);
};
