const path = require('path');
const { app } = require('electron');
const winston = require('winston');
const moment = require('moment');
const jetpack = require('fs-jetpack');
const env = require('./env.js');

const now = moment().format('YYYYMMDD-hhmm');
const filename = env.logFilePrefix + now + env.logFileSuffix;
const logFile = path.join(
  app.getPath('userData'),
  env.logsDir,
  filename
);

jetpack.file(logFile);

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      colorize: true,
      timestamp: function() {
        return '[' + moment().format('hh:mm:ss') + ']';
      },
    }),
    new (winston.transports.File)({ filename: logFile }),
  ],
});

module.exports = logger;
