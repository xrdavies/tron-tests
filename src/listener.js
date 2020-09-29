const TronWeb = require("tronweb");
const fs = require("fs");
const abiContract = require("../build/contracts/MyContract.json").abi;
const utils = require("./lib/utils");
const CustomError = require("./lib/CustomError");

module.exports = class MyListener {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;

    this.logger.info(`mainchain host: ${config.mainchain.host}`);

    this.mainWeb3 = new TronWeb({ fullHost: config.mainchain.host, privateKey: config.privateKey });
    this.mainBridgeContract = this.mainWeb3.contract(abiContract, this.config.mainchain.contract);

    this.lastBlockPath = `${config.storagePath || __dirname}/lastBlock---.txt`;
  }

  async run() {
    this.logger.info("Run....");
    let retries = 3;
    const sleepAfterRetrie = 3000;
    while (retries > 0) {
      try {
        if (!fs.existsSync(this.config.storagePath)) {
          fs.mkdirSync(this.config.storagePath);
        }

        let contractAddress = this.config.mainchain.contract;
        let originalFromTimestamp = this.config.mainchain.fromTimestamp || 0;
        let lastTimestamp = 0;
        try {
          lastTimestamp = fs.readFileSync(this.lastBlockPath, "utf8");
          lastTimestamp = parseInt(lastTimestamp);
        } catch (err) {
          lastTimestamp = originalFromTimestamp;
        }
        if (lastTimestamp < originalFromTimestamp) {
          lastTimestamp = originalFromTimestamp;
        }
        if (lastTimestamp >= Date.now()) {
          this.logger.warn(
            `Query too fast!`
          );
          return false;
        }

        this.logger.info("lastTimestamp: ", lastTimestamp);

        // fromBlock = parseInt(fromBlock) + 1;
        this.logger.debug("Running from Timestamp ", lastTimestamp);

        let events = await this.mainWeb3.event.getEventsByContractAddress(contractAddress, {
          // eventName: 'MyEvent',
          sort: 'block_timestamp',
          fromTimestamp: lastTimestamp,
          onlyConfirmed: true,
        });

        if (!events) throw new Error("Failed to obtain the logs");

        this.logger.info(`Found ${events.length} logs`);

        if (events.length > 0) {
          await this._processLogs(events);
        }

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

  async _processLogs(logs) {
    try {
      for (let log of logs) {
        this.logger.info("Processing event log:", log);
      }
      this._saveProgress(logs[logs.length - 1].timestamp);

      return true;
    } catch (err) {
      throw new CustomError(`Exception processing logs`, err);
    }
  }

  _saveProgress(path, value) {
    if (value) {
      fs.writeFileSync(path, value);
    }
  }
};
