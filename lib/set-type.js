function getType(type) {
  // JSDoc has 'Object', jsonschema uses 'object'
  if (type === 'Object') {
    return 'object';
  }

  return type;
}

const IS_TYPE_ARRAY = /\[\]$/;

module.exports = function setType(rawType, output) {
  const type = getType(rawType);

  // Is type an array?
  if (type.match(IS_TYPE_ARRAY)) {
    output.type = 'array';
    output.items = { type: getType(type.replace(IS_TYPE_ARRAY, '')) };
  } else {
    output.type = type;
  }

  return output;
};
