// Matches:
// {string} name Name of the user
// {string[]} interests Interests of the user
// {string} address.street Street of the user
// {string} favouriteFoods[].cuisine Name of the cuisine
const PARAM = /^{(.*)}\s+(\w+(?:(?:\[\])*\.\w+)*)\s+([\s\S]+)$/;

const IS_TYPE_ARRAY = /\[\]$/;

// Matches:
// address.street
// favouriteFoods[].cuisine
const IS_NESTED_OBJECT_OR_ARRAY = /(\w+)(\[\])*\.(\w+)+/;

function getType(type) {
  // JSDoc has 'Object', jsonschema uses 'object'
  if (type === 'Object') {
    return 'object';
  }

  return type;
}

module.exports = function parseParams(params) {
  return params.map((param) => {
    const matches = param.match(PARAM);
    const type = getType(matches[1]);

    const output = { title: matches[2], description: matches[3] };

    // Is type an array?
    if (type.match(IS_TYPE_ARRAY)) {
      output.type = 'array';
      output.items = { type: getType(type.replace(IS_TYPE_ARRAY, '')) };
    } else {
      output.type = type;
    }

    return output;
  }).map((param, i, parsedParams) => {
    const matches = param.title.match(IS_NESTED_OBJECT_OR_ARRAY);
    if (!matches) return param;

    // Split out nested object properties e.g `user.name`
    const rootProperty = matches[1];
    const isArray = !!matches[2];
    const subProperty = matches[3];

    // Find the root object in the parsed params
    const objectRoot = parsedParams.find(p => p.title === rootProperty);
    let propertiesObject;

    // Array properties such as `favouriteFoods[].cuisine` need to be appended
    // onto the `items` property
    if (isArray) {
      objectRoot.items.properties = objectRoot.items.properties || {};
      propertiesObject = objectRoot.items.properties;
    } else {
      objectRoot.properties = objectRoot.properties || {};
      propertiesObject = objectRoot.properties;
    }

    // Append this property onto that root
    propertiesObject[subProperty] = { type: param.type, description: param.description };

    // Remove this result from the set
    return undefined;
  })
  // Strip out falsy values
  .filter(Boolean);
};