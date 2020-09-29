var MyContract = artifacts.require("MyContract");
var ERC20Token = artifacts.require("ERC20Token");
var TokenFactory = artifacts.require("TokenFactory");

const config = require('../tronbox-config');
const TronWeb = require('tronweb');

function sleep(sec) {
  return new Promise(resolve => setTimeout(resolve, 1000 * sec));
}

module.exports = function (deployer, networkName, accounts) {

  const tronWeb = new TronWeb({ fullHost: config.networks[networkName].fullHost, privateKey: config.networks[networkName].privateKey })
  const myAccount = tronWrap.address.toHex(accounts);

  return deployer.then(async () => {
    await deployer.deploy(MyContract);
    let contract = await MyContract.deployed();
    let ver = await contract.version();
    console.log("[1] MyContract Version: ", ver);
    console.log('[1] MyContract Address: ', MyContract.address);

  }).then(async () => { // Create token directly with script
    // Using TronBox
    await deployer.deploy(ERC20Token, "FirstToken", "FTT", 18, tronWrap.address.toHex(accounts));
    let token = await ERC20Token.deployed();
    console.log('[2] Token1 address: ', token.address);
    let symbol = await token.symbol();
    console.log('[2] Created token1\'s symbol: ', symbol);

    // Using TronWeb
    let instance = await ERC20Token.new("FirstToken2", "FTT2", 18, tronWrap.address.toHex(accounts));
    let token2 = await tronWeb.contract(instance.abi, instance.address);
    console.log('[2] Token2 address: ', token2.address);
    let symbol2 = await token2.symbol().call();
    console.log('[2] Created token2\'s symbol: ', symbol2);

  }).then(async () => { // Create token using TokenFactory, with triggerConstantContract
    await deployer.deploy(TokenFactory);

    let factory = await TokenFactory.deployed();
    console.log('[3] Factory address: ', factory.address);
    let tokenFactory = await tronWeb.contract(factory.abi, factory.address);

    let tokenAddress = await tokenFactory.createERC20Token("SecondToken1", "STT1", 18, tronWrap.address.toHex(accounts)).send({ shouldPollResponse: true });
    console.log('[3] Token address: ', tokenAddress);

    let txn, signedTxn, receipt, txid, ret;

    txn = await tronWeb.transactionBuilder.triggerConstantContract(
      tokenAddress,
      'symbol()',
      {},
      [],
      tronWrap.address.toHex(accounts)
    );
    signedTxn = await tronWeb.trx.sign(txn.transaction, config.networks[networkName].privateKey);
    receipt = await tronWeb.trx.sendRawTransaction(signedTxn);
    txid = receipt.transaction.txID;
    console.log('txid: ', txid);
    for (let i = 0; i < 5; i++) {
      await sleep(5);
      ret = await tronWeb.trx.getTransaction(txid);
      if (ret.ret) {
        console.log('[3] SendRawTransaction ret: ', ret);
        break;
      }
      console.log('[3] retried ', i);
    }

    /*
    txn = await tronWeb.transactionBuilder.triggerConstantContract(
      tokenAddress,
      'mint(address,uint256)',
      {},
      [accounts, 10000000000],
      tronWrap.address.toHex(accounts)
    );
    signedTxn = await tronWeb.trx.sign(txn.transaction, config.networks[networkName].privateKey);
    receipt = await tronWeb.trx.sendRawTransaction(signedTxn);
    txid = receipt.transaction.txID;
    console.log('txid: ', txid);
    for (let i = 0; i < 5; i++) {
      await sleep(5);
      ret = await tronWeb.trx.getTransaction(txid);
      if (ret.ret) {
        console.log('[3] SendRawTransaction ret: ', ret);
        break;
      }
      console.log('[3] retried ', i);
    }
    */

  }).then(async () => { // Create token using TokenFactory
    await deployer.deploy(TokenFactory);

    let factory = await TokenFactory.deployed();
    console.log('[4] Factory address: ', factory.address);

    let tokenFactory = await tronWeb.contract(factory.abi, factory.address);
    let tokenAddress = await tokenFactory.createERC20Token("SecondToken2", "STT2", 18, tronWrap.address.toHex(accounts)).send({ shouldPollResponse: true });
    console.log('[4] Token address: ', tokenAddress);

    // use proxy: begin
    const tokenSymbolFromFactory = await tokenFactory.getTokenSymbol(tokenAddress).call();
    console.log('[44] Token symbol: ', tokenSymbolFromFactory);

    await tokenFactory.mintToken(tokenAddress, myAccount, 10).send({ shouldPollResponse: true });
    const tokenbalanceOfFromFactory = await tokenFactory.balanceOf(tokenAddress, myAccount).call();
    console.log('[44] Token balance: ', tokenbalanceOfFromFactory.toNumber());
    // use proxy: end

    let token = await tronWeb.contract(ERC20Token.abi, tokenAddress);
    console.log('[4] Token address: ', token.address);

    let symbol = await token.symbol().call();
    console.log('[4] Created token\'s symbol: ', symbol)

  }).then(async () => {
    // WTF
    console.log('WTF: We have done this job!!!')
  });
};