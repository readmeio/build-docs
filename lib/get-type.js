module.exports = function getType(type) {
  // JSDoc has 'Object', jsonschema uses 'object'
  if (type === 'Object') {
    return 'object';
  }

  return type;
};

module.exports.IS_TYPE_ARRAY = /\[\]$/;
