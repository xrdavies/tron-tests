const TronWeb = require("tronweb");
const fs = require("fs");
const abiContract = require("../build/contracts/MyContract.json").abi;
const utils = require("./lib/utils");
const TransactionSender = require('./lib/TransactionSender.js');

module.exports = class MyTrigger {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;

    this.logger.info(`mainchain host: ${config.mainchain.host}`);

    this.mainWeb3 = new TronWeb({ fullHost: config.mainchain.host, privateKey: config.privateKey });
    this.myContract = this.mainWeb3.contract(abiContract, this.config.mainchain.contract);
  }

  async run() {
    let retries = 3;
    const sleepAfterRetrie = 3000;
    while (retries > 0) {
      try {
        this.logger.debug("MyTrigger generating MyEvent...");
        let data = await this.myContract.methods.generateEvent1().send();

        data = await this.myContract.methods.generateEvent2().send();
        this.logger.debug("MyTrigger generateEvent completed. ", data);
        return true;
      } catch (err) {
        console.log(err);
        this.logger.error(new Error("Exception Running Federator"), err);
        retries--;
        this.logger.debug(`Run ${3 - retries} retrie`);
        if (retries > 0) {
          await utils.sleep(sleepAfterRetrie);
        } else {
          process.exit();
        }
      }
    }
  }
};
