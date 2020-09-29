const { version } = require("elliptic");

var MyContract = artifacts.require("./MyContract.sol");

module.exports = function(deployer) {
  return deployer.deploy(MyContract).then(async ()=>{
    let contract = await MyContract.deployed();
    let ver = await contract.version();
    console.log(ver);

    console.log('MyContract: ', MyContract.address);
  });
};