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

    await deployer.deploy(TokenFactory);
    let factory = await TokenFactory.deployed();
    console.log('Factory address: ', factory.address);

    let tokenAddress = await factory.createERC20Token("TestToken", "TT", 18, accounts[0]);
    console.log('Token address: ', tokenAddress);

    let token = await ERC20Token.at(tokenAddress);
    console.log('Token: ', token);
  }).then(async () =>  {
    
  });
};