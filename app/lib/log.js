const path = require('path');
const { app } = require('electron');
const winston = require('winston');
const moment = require('moment');
const jetpack = require('fs-jetpack');
const findRemoveSync = require('find-remove')
const env = require('./env.js');


const today = moment().format('YYYYMMDD');
const filename = env.logFilePrefix + today + env.logFileSuffix;
const logsDir = path.join(
  app.getPath('userData'),
  env.logsDir
);
const logFile = path.join(
  logsDir,
  filename
);


jetpack.file(logFile);


const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      silent: env.name === 'test' ? true : false,
      level: env.logLevelConsole,
      colorize: true,
      prettyPrint: true,
      timestamp: () => {
        return '[' + moment().format('hh:mm:ss') + ']';
      },
    }),
    new (winston.transports.File)({
      level: env.logLevelFile,
      filename: logFile,
      maxsize: env.logFileMaxSize,
      maxFiles: env.maxLogFiles,
    }),
  ],
});

module.exports = logger;
