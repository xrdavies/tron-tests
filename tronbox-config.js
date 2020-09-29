const fs = require('fs');
let PRIVATE_KEY = fs.existsSync('./tron.key') ? fs.readFileSync('./tron.key', { encoding: 'utf8' }) : "";// Your tron's private key

module.exports = {
  networks: {
    mainnet: {
      // Don't put your private key here:
      privateKey: PRIVATE_KEY,
      /*
Create a .env file (it must be gitignored) containing something like

  export PRIVATE_KEY_MAINNET=4E7FECCB71207B867C495B51A9758B104B1D4422088A87F4978BE64636656243

Then, run the migration with:

  source .env && tronbox migrate --network mainnet

*/
      userFeePercentage: 100,
      feeLimit: 1e8,
      fullHost: 'https://api.trongrid.io',
      network_id: '1'
    },
    shasta: {
      privateKey: PRIVATE_KEY,
      userFeePercentage: 50,
      feeLimit: 1e8,
      fullHost: 'https://api.shasta.trongrid.io',
      network_id: '2'
    },
    nile: {
      privateKey: PRIVATE_KEY,
      fullNode: 'https://httpapi.nileex.io/wallet',
      solidityNode: 'https://httpapi.nileex.io/walletsolidity',
      eventServer: 'https://eventtest.nileex.io',
      network_id: '3'
    },
    development: {
      // For trontools/quickstart docker image
      // privateKey: 'da146374a75310b9666e834ee4ad0866d6f4035967bfc76217c5a495fff9f0d0',
      // privateKey: '4da33119081c7b144e82f54c3cd6b88e3491fe64fa63f6559826a1b1a814d2cb',
      privateKey: PRIVATE_KEY,
      userFeePercentage: 0,
      feeLimit: 1e8,
      fullHost: 'http://127.0.0.1:9090',
      network_id: '9'
    },
    compilers: {
      solc: {
        version: '0.5.4'
      }
    }
  }
}
