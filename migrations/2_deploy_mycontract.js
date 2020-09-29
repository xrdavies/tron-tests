var MyContract = artifacts.require("MyContract");
var ERC20Token = artifacts.require("ERC20Token");
var TokenFactory = artifacts.require("TokenFactory");

module.exports = function(deployer, networkName, accounts) {

  return deployer.then(async ()=> {
    await deployer.deploy(MyContract);
    let contract = await MyContract.deployed();
    let ver = await contract.version();
    console.log("MyContract Version: ", ver);
    console.log('MyContract Address: ', MyContract.address);

  }).then(async ()=>{

    let result = await deployer.deploy(TokenFactory);
    console.log('deploy result: ', result);

    let factory = await TokenFactory.deployed();
    console.log('Factory address: ', factory.address);

    console.log('accounts: ', accounts);
    let tokenAddress = await factory.createERC20Token("TestToken", "TT", 18, tronWrap.address.toHex(accounts));
    console.log('Token address: ', tokenAddress);

    // let token = await ERC20Token.at(tokenAddress);
    let token = await tronWrap.contract(ERC20Token.abi, tokenAddress.replace(/^41/, '0x'));
    console.log('Token address: ', token.address);

    let symbol = await token.symbol().call();
    console.log('Created token symbol: ', symbol)

  }).then(async () =>  {
    
  });
};