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
    console.log("[1] MyContract Version: ", ver);
    console.log('[1] MyContract Address: ', MyContract.address);

  }).then(async ()=>{ // Create token directly with script
    await deployer.deploy(ERC20Token, "FirstToken", "FTT", 18, tronWrap.address.toHex(accounts));

    let token = await ERC20Token.deployed();
    console.log('[2] Token address: ', token.address);

    let symbol = await token.symbol();
    console.log('[2] Created token\'s symbol: ', symbol);

  }).then(async ()=>{ // Create token using TokenFactory
    await deployer.deploy(TokenFactory);

    let factory = await TokenFactory.deployed();
    console.log('[3] Factory address: ', factory.address);

    let tokenFactory = await tronWeb.contract(factory.abi, factory.address);
    let tokenAddress = await tokenFactory.createERC20Token("SecondToken", "STT", 18, tronWrap.address.toHex(accounts)).send({shouldPollResponse: true});
    console.log('[3] Token address: ', tokenAddress);

    let token = await tronWeb.contract(ERC20Token.abi, tokenAddress);
    console.log('[3] Token address: ', token.address);

    let symbol = await token.symbol().call();
    console.log('[3] Created token\'s symbol: ', symbol)

  }).then(async () =>  {
      // WTF
      console.log('WTF: We have done this job!!!')
  });
};