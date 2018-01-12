const JSON_SCHEMA_TYPES = ['null', 'boolean', 'object', 'array', 'number', 'string', 'file'];

function getType(type) {
  // JSDoc has 'Object', jsonschema uses 'object'
  if (type === 'Object') {
    return 'object';
  }

  return type.toLowerCase();
}

const IS_TYPE_ARRAY = /\[\]$/;

module.exports = function setType(rawType, output) {
  const type = getType(rawType);

  // Is type an array?
  if (type.match(IS_TYPE_ARRAY)) {
    output.type = 'array';
    output.items = { type: getType(type.replace(IS_TYPE_ARRAY, '')) };
    validateType(output.items.type);
  } else {
    output.type = type;
    validateType(output.type);
  }

  if (output.exampleData) {
    output.exampleData = castExampleType(output.type, output.exampleData);
  }

  return output;
};

module.exports.JSON_SCHEMA_TYPES = JSON_SCHEMA_TYPES;

function validateType(type) {
  if (JSON_SCHEMA_TYPES.indexOf(type) === -1) {
    throw new Error(`Invalid type "${type}" - Type must be: ${JSON_SCHEMA_TYPES.join(', ')}`);
  }
}

function castExampleType(type, data) {
  if (type === 'number') {
    return parseFloat(data);
  } else if (type === 'boolean') {
    return data === 'true';
  } else if (type === 'array') {
    return JSON.parse(data);
  }
  return data;
}
