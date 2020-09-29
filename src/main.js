const log4js = require('log4js');

// Configurations
const config = require('./config/config.js');
const logConfig = require('./config/log-config.json');
log4js.configure(logConfig);

// Services
const Scheduler = require('./lib/Scheduler.js');
const MyListener = require('./listener');
const MyTrigger = require('./trigger');

const logger = log4js.getLogger('Main');
logger.info('Mainchain Host', config.mainchain.host);

if(!config.mainchain) {
    logger.error('Mainchain configuration are required');
    process.exit();
}

const listener = new MyListener(config, log4js.getLogger('MyListener'));
const trigger = new MyTrigger(config, log4js.getLogger('MyTrigger'));

let pollingInterval = config.runEvery * 1000 * 10; // Minutes
let scheduler = new Scheduler(pollingInterval, logger, { run: () => run() });

scheduler.start().catch((err) => {
    logger.error('Unhandled Error on start()', err);
});

async function run() {
    try {
        await listener.run();
        await trigger.run();
    } catch(err) {
        logger.error('Unhandled Error on run()', err);
        process.exit();
    }
}

async function exitHandler() {
    process.exit();
}

// catches ctrl+c event
process.on('SIGINT', exitHandler);

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);

// export so we can test it
module.exports = { scheduler };
