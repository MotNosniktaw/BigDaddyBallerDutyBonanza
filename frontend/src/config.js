const { REACT_APP_API_URL } = process.env;

const config = {
  bigDaddyApiUrl: REACT_APP_API_URL || "https://1da539e4175f.eu.ngrok.io",
};

console.log({ config });

module.exports = config;
