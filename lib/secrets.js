// Matches:
// key Description of the secret
const SECRET = /^([\w]+)\s+([\s\S]+)$/;

module.exports = function parseParams(secrets) {
  return secrets.map((secret) => {
    const matches = secret.match(SECRET);
    return { key: matches[1], description: matches[2] };
  })
  // Strip out falsy values
  .filter(Boolean);
};
