const isProd = process.env.NODE_ENV === 'production';

function info(...args) {
  if (!isProd) console.log(...args);
}

function warn(...args) {
  console.warn(...args);
}

function error(...args) {
  console.error(...args);
}

module.exports = { info, warn, error };
