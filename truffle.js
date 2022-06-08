module.exports = {
    networks: {
        genache: {
            host: "localhost",
            port: 7545,
            gas: 5000000,
            network_id: "5777" // Match any network id
        }
    },
    compilers: {
      solc: {
        version: "0.6.0",    // Fetch exact version from solc-bin (default: truffle's version)
      }
    },
};