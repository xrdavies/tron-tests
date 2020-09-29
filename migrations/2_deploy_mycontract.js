var MyContract = artifacts.require("MyContract");
var ERC20Token = artifacts.require("ERC20Token");
var TokenFactory = artifacts.require("TokenFactory");

const config = require('../tronbox-config');
const TronWeb = require('tronweb');

module.exports = function(deployer, networkName, accounts) {

  const tronWeb = new TronWeb({ fullHost: config.networks[networkName].fullHost, privateKey: config.networks[networkName].privateKey })

  return deployer.then(async ()=> {
    await deployer.deploy(MyContract);
    let contract = await MyContract.deployed();
    let ver = await contract.version();
    console.log("MyContract Version: ", ver);
    console.log('MyContract Address: ', MyContract.address);

  }).then(async ()=>{

    let factory = await deployer.deploy(TokenFactory);
    console.log('Factory address: ', factory.address);

    let tokenFactory = await tronWeb.contract(factory.abi, factory.address);
    let tokenAddress = await tokenFactory.createERC20Token("TestToken", "TT", 18, tronWrap.address.toHex(accounts)).send({shouldPollResponse: true});
    console.log('Token address: ', tokenAddress);

    let token = await tronWeb.contract(ERC20Token.abi, tokenAddress);
    console.log('Token address: ', token.address);

    let symbol = await token.symbol().call();
    console.log('Created token\'s symbol: ', symbol)

  }).then(async () =>  {
      // WTF
  });
};