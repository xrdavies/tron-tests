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
    console.log('[Directly with script] Token1 address: ', token.address);

    let symbol = await token.symbol();
    console.log('[Directly with script] Created token1\'s symbol: ', symbol);

    // Using TronWeb
    let instance = await ERC20Token.new("FirstToken2", "FTT2", 18, tronWrap.address.toHex(accounts));
    let token2 = await tronWeb.contract(instance.abi, instance.address);
    console.log('[Directly with script] Token2 address: ', token2.address);

    let symbol2 = await token2.symbol().call();
    console.log('[Directly with script] Created token2\'s symbol: ', symbol2);

  }).then(async () => { // Create by script, managed by factory
    await deployer.deploy(TokenFactory);

    await deployer.deploy(ERC20Token, "Main", "MAIN", 18, myAccount);
    let mainToken = await ERC20Token.deployed();
    console.log('[Create by script, managed by factory] Main token address: ', mainToken.address);

    let factory = await TokenFactory.deployed();
    console.log('[Create by script, managed by factory] Factory address: ', factory.address);
    let tokenFactory = await tronWeb.contract(factory.abi, factory.address);

    let hasMain = await tokenFactory.hasSideToken(mainToken.address).send({shouldPollResponse: true});
    console.log('[Create by script, managed by factory] has main: ', hasMain);
    if (!hasMain) {
      let instance = await ERC20Token.new("SideToken", "ST", 18, tokenFactory.address);
      let sideToken = await tronWeb.contract(instance.abi, instance.address);
      console.log('[Create by script, managed by factory] Create new side token: ', sideToken.address);
      let receipt = await tokenFactory.addSideToken(mainToken.address, sideToken.address).send({shouldPollResponse: true});
      console.log('[Create by script, managed by factory] Add new side token: ', receipt);
    }

    let receipt = await tokenFactory.acceptTransfer(mainToken.address, myAccount, 10000).send({shouldPollResponse: true});
    console.log('[Create by script, managed by factory] acceptTransfer: ', receipt);

    let sideTokenAddress = await  tokenFactory.mappedTokens(mainToken.address).call();
    console.log('[Create by script, managed by factory] re-get side token address: ', sideTokenAddress);

    let sideToken = await tronWeb.contract(ERC20Token.abi, sideTokenAddress);
    let symbol = await sideToken.symbol().call();
    console.log('[Create by script, managed by factory] side token symbol: ', symbol);

    let balance = await sideToken.balanceOf(myAccount).call();
    console.log('[Create by script, managed by factory] my balance: ', balance.toString());

  }).then(async () => { // Create token through TokenFactory and call methods through proxy
    await deployer.deploy(TokenFactory);

    let factory = await TokenFactory.deployed();
    console.log('[Using proxy] Factory address: ', factory.address);

    let tokenFactory = await tronWeb.contract(factory.abi, factory.address);
    let tokenAddress = await tokenFactory.createERC20Token("SecondToken2", "STT2", 18, factory.address).send({ shouldPollResponse: true });
    console.log('[Using proxy] Token address: ', tokenAddress);

    const tokenSymbolFromFactory = await tokenFactory.getTokenSymbol(tokenAddress).call();
    console.log('[Using proxy] Token symbol: ', tokenSymbolFromFactory);

    await tokenFactory.mintToken(tokenAddress, myAccount, 10).send({ shouldPollResponse: true });
    const tokenbalanceOfFromFactory = await tokenFactory.balanceOf(tokenAddress, myAccount).call();
    console.log('[Using proxy] Token balance: ', tokenbalanceOfFromFactory.toString());

  }).then(async () => { // Create token using TokenFactory
    await deployer.deploy(TokenFactory);

    let factory = await TokenFactory.deployed();
    console.log('[Create token using TokenFactory] Factory address: ', factory.address);

    let tokenFactory = await tronWeb.contract(factory.abi, factory.address);
    let tokenAddress = await tokenFactory.createERC20Token("SecondToken2", "STT2", 18, tronWrap.address.toHex(accounts)).send({ shouldPollResponse: true });
    console.log('[Create token using TokenFactory] Token address: ', tokenAddress);

    let token = await tronWeb.contract(ERC20Token.abi, tokenAddress);
    console.log('[Create token using TokenFactory] Token address: ', token.address);

    let symbol = await token.symbol().call();
    console.log('[Create token using TokenFactory] Created token\'s symbol: ', symbol)

  }).then(async () => { // Create token using TokenFactory, with triggerConstantContract
    await deployer.deploy(TokenFactory);
    let factory = await TokenFactory.deployed();
    console.log('[Using triggerConstantContract] Factory address: ', factory.address);

    let tokenFactory = await tronWeb.contract(factory.abi, factory.address);
    let tokenAddress = await tokenFactory.createERC20Token("SecondToken1", "STT1", 18, tronWrap.address.toHex(accounts)).send({ shouldPollResponse: true });
    console.log('[Using triggerConstantContract] Token address: ', tokenAddress);

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
    console.log('[Using triggerConstantContract] txid: ', txid);
    for (let i = 0; i < 5; i++) {
      await sleep(5);
      ret = await tronWeb.trx.getTransaction(txid);
      if (ret.ret) {
        console.log('[Using triggerConstantContract] SendRawTransaction ret: ', ret);
        break;
      }
      console.log('[Using triggerConstantContract] retried ', i);
    }

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
    console.log('[Using triggerConstantContract] txid: ', txid);
    for (let i = 0; i < 5; i++) {
      await sleep(5);
      ret = await tronWeb.trx.getTransaction(txid);
      if (ret.ret) {
        console.log('[Using triggerConstantContract] SendRawTransaction ret: ', ret);
        break;
      }
      console.log('[Using triggerConstantContract] retried ', i);
    }

  }).then(async () => {
    // WTF
    console.log('WTF: We have done this job!!!')
  });
};