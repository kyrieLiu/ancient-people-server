/**
 * author Liu Yin
 * date 2020/9/9
 * Description:记录log日志
 */
const log4js = require('log4js');

log4js.configure({
  appenders: {
    stdout: { // 控制台输出
      type: 'console'
    },
    file: {
      type: 'file',
      filename: 'logs/app.log',
      layout: {
        type: 'pattern',
        pattern: '%r %p - %m'
      }
    }
  },
  categories: {
    default: {
      appenders: ['stdout', 'file'],
      level: 'debug'
    }
  }
});
const logger = log4js.getLogger();
export default logger;
