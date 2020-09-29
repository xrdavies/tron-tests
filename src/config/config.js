const fs = require("fs");
module.exports = {
  mainchain: {
    contract: "41edf84b0e267fe66a95773400d3be295736cfaf47",
    host: "http://127.0.0.1:9090",
    fromTimestamp:0.
  },
  runEvery: 1, // In minutes,
  confirmations: 0, // Number of blocks before processing it, if working with ganache set as 0
  privateKey: "87ad7e2880cc52c706a67f3d5fb8a63b22240ebe103051509c8d1d130981302d",
  storagePath: "./db",
};

